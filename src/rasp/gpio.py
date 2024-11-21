from pymongo import MongoClient
import serial
import datetime
import time
import RPi.GPIO as GPIO
PortRF = serial.Serial('/dev/ttyAMA0',9600)

client = MongoClient('mongodb://etu-web2.ut-capitole.fr:27017/')
db = client.db_straberry
collections = db.list_collection_names()
houses_db = db.HousesCollection


house_id = ""

PAUSE = 0.5
GPIO.setmode(GPIO.BOARD)

ports = [36,38,16,40]

for port in ports:
    GPIO.setup(port, GPIO.OUT)
    GPIO.output(port, GPIO.LOW)

def get_card_id():
  while True:
        ID = ""
        print('wait')
        read_byte = PortRF.read(1)
        if read_byte==b"\x02":
          for _ in range(0,12):
            read_byte=PortRF.read()
            ID += read_byte.decode('utf-8')
        if ID:
          return ID

def find_house(house_id):
  house = houses_db.find_one({ "authorizedCard.cardId": house_id})
  return house

def light_up(house):
  port = house['port']
  houses_db.find_one_and_update({'_id': house['_id']},{ '$set': { "lastUsed" : datetime.datetime.now(), "isOccupied": True} })
  GPIO.output(port, GPIO.HIGH)
def light_off(house):
  port = house['port']
  houses_db.find_one_and_update({'_id': house['_id']},{ '$set': { "lastUsed" : datetime.datetime.now(), "isOccupied": False} })
  GPIO.output(port, GPIO.LOW)
def main():
  while True:
    house_id =""
    print("Start scanning\n")

    print("Scan the house card: ")
    house_id = get_card_id()

    print("House finding")
    time.sleep(PAUSE)
    house = find_house(house_id=house_id)
    time.sleep(4 * PAUSE)
    if house:
      if house['isOccupied']:
        light_off(house)
      else:
        light_up(house)
      print(house)
    else:
      print("House not found")
  GPIO.cleanup()

main()