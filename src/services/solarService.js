const { connectDB } = require("../utils/db");
const axios = require("axios");

class SolarService {
  async storeSolarData(data) {
    try {
      const db = await connectDB();
      const housesCollection = db.collection("HousesCollection");

      const { timestamp, production } = data;
      const houseName = this._determineHouseName(timestamp);

      const house = await housesCollection.findOne({ houseName });

      if (house) {
        const update = this._createUpdateObject(house, timestamp, production);
        const result = await housesCollection.updateOne({ houseName }, update);

        this._logUpdateResult(houseName, result);
      } else {
        console.log(`House ${houseName} not found.`);
      }
    } catch (error) {
      console.log("Error inserting solar data into the database:", error);
      throw error;
    }
  }

  _determineHouseName(timestamp) {
    const currentHour = timestamp.getHours();

    if (currentHour >= 0 && currentHour < 6) return "GreenHouse";
    if (currentHour >= 6 && currentHour < 12) return "RedHouse";
    if (currentHour >= 12 && currentHour < 18) return "YellowHouse";
    return "BlueHouse";
  }

  _createUpdateObject(house, timestamp, production) {
    return {
      $push: {
        ...(house.isOccupied
          ? { energyUsed: { timestamp, production } }
          : { energySaved: { timestamp, production } }),
      },
      $set: { lastUpdated: timestamp },
    };
  }

  _logUpdateResult(houseName, result) {
    if (result.modifiedCount > 0) {
      console.log(`Updated ${houseName} with energy data.`);
    } else {
      console.log(`No update made for ${houseName}`);
    }
  }

  fetchSolarData = async () => {
    try {
      const response = await axios.get(
        "https://labadenquet.pythonanywhere.com/production"
      );
      const production = parseFloat(response.data.prod);

      const timestamp = new Date();

      return { production, timestamp };
    } catch (error) {
      console.log("Error fetching solar data:", error);
      throw error;
    }
  };
}

module.exports = new SolarService();
