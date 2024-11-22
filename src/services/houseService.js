const jwt = require('jsonwebtoken');
const { connectDB } = require('../utils/db');
const config = require('../utils/config');

class HouseService {
  static async findHouseByCredentials(houseName, cardId) {
    const db = await connectDB();
    return db.collection('HousesCollection').findOne({
      houseName,
      'authorizedCard.cardId': cardId
    });
  }

  static async generateToken(house) {
    return jwt.sign(
      {
        houseId: house._id,
        houseName: house.houseName,
        cardId: house.authorizedCard.cardId
      },
      config.JWT_SECRET
    );
  }

  static async getAllHouses() {
    const db = await connectDB();
    return db.collection('HousesCollection').find({}).toArray();
  }

  static async findHouseByName(houseName) {
    const db = await connectDB();
    return db.collection('HousesCollection').findOne({ houseName });
  }

  static async toggleHouseOccupancy(cardId) {
    const db = await connectDB();
    const result = await db.collection('HousesCollection').findOneAndUpdate(
      { 'authorizedCard.cardId': cardId },
      [{
        $set: {
          isOccupied: { $not: '$isOccupied' },
          'authorizedCard.lastUsed': new Date(),
          lastUsed: new Date()
        }
      }],
      { returnDocument: 'after' }
    );

    return result;
  }
}

module.exports = HouseService;