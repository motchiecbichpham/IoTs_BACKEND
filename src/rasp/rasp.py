import time
from aq import AQ
import pygame
import time
from gtts import gTTS
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
   
def air_filter(eco2, temp_c):
    print('air_filter')
    
def alert_speaker(eco2):
    if(eco2>40000):
      generate_sound("Highest level of air pollution","en")
    elif(eco2>5000):
      generate_sound("4 level of air pollution","en")
    elif(eco2>2000):
      generate_sound("3 level of air pollution","en")
    elif(eco2>1000):
      generate_sound("2 level of air pollution","en")
    else: 
      return
    play_sound()
    
def log_record(temp_c, eco2):
    print(temp_c, eco2)

def log_reading(aq):
    temp_c = str(aq.get_temp())
    eco2 = str(int(aq.get_eco2()))
    log_record(temp_c=temp_c, eco2=eco2)
    alert_speaker(eco2=eco2)
    air_filter(eco2=eco2, temp_c=temp_c)
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
            
            # Log at even hours (2am, 4am, 6am, ...)
            if current_time.tm_min == 0 and current_time.tm_sec == 0:
                if current_time.tm_hour % 2 == 0 and current_time.tm_hour != last_calibration_hour:
                    log_reading(aq)
                    
                    # Reset calibration at midnight
                    if current_time.tm_hour == 0:
                        print("Resetting calibration")
                        aq.calibrate_400()
                        last_calibration_hour = 0
                    else:
                        last_calibration_hour = current_time.tm_hour

            # Add a small delay to prevent CPU overuse
            time.sleep(1000)

    except KeyboardInterrupt:
        current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        print(f"Logging ended at: {current_time}")

if __name__ == "__main__":
    main()