const { connectDB } = require("../utils/db");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

class HouseService {
  async loginHouse(houseName, cardId) {
    if (!houseName || !cardId) {
      throw { status: 401, message: "Required both fields" };
    }

    const db = await connectDB();
    const house = await db.collection("HousesCollection").findOne({
      houseName: houseName,
      "authorizedCard.cardId": cardId,
    });

    if (!house) {
      throw { status: 401, message: "Invalid house credentials" };
    }

    const token = jwt.sign(
      {
        houseId: house._id,
        houseName: house.houseName,
        cardId: house.authorizedCard.cardId,
      },
      config.JWT_SECRET
    );

    return {
      success: true,
      token,
      house: {
        houseName: house.houseName,
        isOccupied: house.isOccupied,
        lastUsed: house.lastUsed,
      },
    };
  }

  // Other service methods
}

module.exports = new HouseService();
