const { connectDB } = require("../utils/db");

// Function to store fetched solar data into MongoDB
const storeSolarData = async (data) => {
  try {
    const db = await connectDB();
    const housesCollection = db.collection("HousesCollection");

    const { timestamp, production } = data;

    const currentHour = timestamp.getHours();

    let houseName;
    if (currentHour >= 0 && currentHour < 6) {
      houseName = "GreenHouse";
    } else if (currentHour >= 6 && currentHour < 12) {
      houseName = "BlueHouse";
    } else if (currentHour >= 12 && currentHour < 18) {
      houseName = "YellowHouse";
    } else {
      houseName = "BlueHouse";
    }

    const house = await housesCollection.findOne({ houseName });

    if (house) {
      const energySource = house.isOccupied ? "energyUsed" : "energySaved";

      const update = {
        $inc: { [energySource]: production },
        $set: { lastUpdated: timestamp },
      };

      const result = await housesCollection.updateOne({ houseName }, update);

      if (result.modifiedCount > 0) {
        console.log(
          `Updated ${houseName} with ${energySource} += ${production}`,
        );
      } else {
        console.log(`No update made for ${houseName}`);
      }
    } else {
      console.log(`House ${houseName} not found.`);
    }
  } catch (error) {
    console.log("Error inserting solar data into the database:", error);
    throw error;
  }
};

module.exports = storeSolarData;
