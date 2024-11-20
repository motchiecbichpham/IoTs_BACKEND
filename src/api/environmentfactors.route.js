const express = require("express");
const router = express.Router();

const { connectDB } = require("../utils/db");

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const environmentData = await db
      .collection("EnvironmentalHistory")
      .find({})
      .toArray();
    res.json(environmentData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/daily", async (req, res) => {
  try {
    const db = await connectDB();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: yesterday,
            $lt: today,
          },
        },
      },
      {
        $project: {
          hour: { $hour: "$timestamp" },
          temperature: 1,
          eco2: 1,
        },
      },
      {
        $sort: { hour: 1 },
      },
    ];
    const hourlyEnvironmentData = await db
      .collection("EnvironmentalHistory")
      .aggregate(pipeline)
      .toArray();

    res.json(hourlyEnvironmentData);
  } catch (error) {
    res.status(500).json({ messsage: error.message });
  }
});

module.exports = router;
