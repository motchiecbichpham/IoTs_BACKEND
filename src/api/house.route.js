const express = require("express");
const router = express.Router();
const { connectDB } = require("../utils/db");

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const houses = await db.collection("Houses").find({}).toArray();
    res.json(houses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:houseName", async (req, res) => {
  try {
    const db = await connectDB();
    const house = await db.collection("Houses").findOne({
      houseName: req.params.houseName,
    });

    if (house) {
      res.json(house);
    } else {
      res.status(404).json({ message: "House not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:houseName/occupancy", async (req, res) => {
  try {
    const db = await connectDB();
    const { isOccupied } = req.body;
    const houseName = req.params.houseName;

    // Update house occupancy
    const result = await db.collection("Houses").findOneAndUpdate(
      { houseName: houseName },
      {
        $set: {
          isOccupied: isOccupied,
          lastUsed: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result.value) {
      return res.status(404).json({ message: "House not found" });
    }

    const io = req.app.get("io");
    io.emit("occupancyChange", {
      houseName: houseName,
      isOccupied: isOccupied,
      message: isOccupied ? `${houseName} occupied` : `${houseName} empty`,
    });

    res.json({
      houseName: houseName,
      isOccupied: isOccupied,
      message: isOccupied ? `${houseName} occupied` : `${houseName} empty`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
