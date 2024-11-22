const { connectDB } = require("../utils/db");

class EnvironmentService {
  async getAllEnvironmentalData() {
    const db = await connectDB();
    return db.collection("EnvironmentalHistory").find({}).toArray();
  }

  async getDailyEnvironmentalData() {
    const db = await connectDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: today,
            $lt: tomorrow,
          },
        },
      },
      {
        $project: {
          hour: { $hour: "$timestamp" },
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          temperature: 1,
          eco2: 1,
        },
      },
      {
        $sort: { hour: 1 },
      },
    ];

    return db.collection("EnvironmentalHistory").aggregate(pipeline).toArray();
  }
}

module.exports = new EnvironmentService();
