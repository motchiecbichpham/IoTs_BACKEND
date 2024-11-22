import time
from aq import AQ
import pygame
import time
from gtts import gTTS
from aq import AQ
from gpiozero import AngularServo
from time  import sleep
import serial
import pymongo
from pymongo import MongoClient
import datetime
import paho.mqtt.publish as publish

MQTT_PATH = "2IS/Straberry"
MQTT_SERVER = "10.12.220.101"
PortRF = serial.Serial('/dev/ttyAMA0', 9600)
client = MongoClient('mongodb://etu-web2.ut-capitole.fr:27017/')
db = client.db_straberry

pygame.init()

def generate_sound(text, lang):
  print("Converting your text to sound . . .")
  tts = gTTS(text=text, lang=lang)
  tts.save("sound.mp3")

def play_sound():
  pygame.mixer.music.load("sound.mp3")
  pygame.mixer.music.play()
  while pygame.mixer.music.get_busy() == True:
     continue

def alert_speaker(eco2):
    publish.single(MQTT_PATH, eco2, hostname=MQTT_SERVER)
    if eco2 < 400:
      generate_sound("Everything is good.","en")
    elif eco2>40000:
      generate_sound("Warning: Hazardous air quality detected. Avoid outdoor activity.Air pollution levels are dangerously high. Stay indoors!","en")
    elif eco2>5000:
      generate_sound("Severe air pollution. Use protective masks if going outside.","en")
    elif eco2>2000:
      generate_sound("Poor air quality detected. Consider reducing outdoor activities.","en")
    elif eco2>=400:
      generate_sound("Air quality is slightly degraded. Sensitive groups should take precautions.","en")

    play_sound()

def log_record(temp_c, eco2):
    print(temp_c, eco2)
    db.EnvironmentalHistory.insert_one(
      {"timestamp": datetime.datetime.now(),
          "temperature": temp_c,
          "eco2": eco2})

def log_reading(aq):
    temp_c = str(aq.get_temp())
    eco2 = str(int(aq.get_eco2()))
    log_record(temp_c=float(temp_c), eco2=float(eco2))
    alert_speaker(eco2=float(eco2))
    print(f"{time.monotonic()}\t{temp_c}\t{str(int(eco2))}")

def main():
    aq = AQ()
    aq.leds_automatic()

    current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    print(f"Logging started at: {current_time}")
    print("Press CTRL-C to end logging")

    last_calibration_hour = None

    try:
        while True:
            current_time = time.localtime()
            log_reading(aq)
            #if current_time.tm_min == 0 and current_time.tm_sec == 0:
            if current_time.tm_hour != last_calibration_hour:
                 log_reading(aq)
                 if current_time.tm_hour == 0:
                     print("Resetting calibration")
                     aq.calibrate_400()
                     last_calibration_hour = 0
                 else:
                     last_calibration_hour = current_time.tm_hour

            time.sleep(10*60)

    except KeyboardInterrupt:
        current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        print(f"Logging ended at: {current_time}")

if __name__ == "__main__":
    main()