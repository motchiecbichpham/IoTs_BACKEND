import time
import paho.mqtt.client as mqtt
from gpiozero import AngularServo
from time  import sleep
import serial
import time
import paho.mqtt.client as mqtt
import subprocess
from pymongo import MongoClient
signalPIN = 2
status=False
client = MongoClient('mongodb://etu-web2.ut-capitole.fr:27017/')
db = client.db_straberry
collections = db.list_collection_names()
houses_db = db.HousesCollection

#servo = AngularServo(signalPIN, min_angle=0, max_angle=180, min_pulse_width=0.0005, max_pulse_width=0.0024)
def on_message(client, data, message):
        global status
        value = float(message.payload.decode('utf-8'))
        #servo = AngularServo(signalPIN, min_angle=0, max_angle=180, min_pulse_width=0.0005, max_pulse_width=0.0024)
        if value < 400 and status == True:
                servo = AngularServo(signalPIN, min_angle=0, max_angle=180, min_pulse_width=0.0005, max_pulse_width=0.0024)
                servo.angle = 180
                sleep(1)
                servo.angle = 0
                sleep(1)
                status = False
                houses_db.update_many({},'$set': { "isAirFilterOn": False } )
        elif value > 400 and status == False:
                servo = AngularServo(signalPIN, min_angle=0, max_angle=180, min_pulse_width=0.0005, max_pulse_width=0.0024)
                servo.angle = 0
                sleep(1)
                servo.angle = 180
                sleep(1)
                status = True
                houses_db.update_many({},'$set': { "isAirFilterOn": True } )


PortRF = serial.Serial('/dev/ttyAMA0',9600)


client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.connect('10.12.220.101', 1883, 60)
client.on_message = on_message
client.subscribe('2IS/Straberry', qos=0)
client.loop_start()
time.sleep(1000000)
client.loop_stop()
client.disconnect()