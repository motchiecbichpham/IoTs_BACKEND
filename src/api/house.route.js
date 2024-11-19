// api/house.routes.js
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

module.exports = router;
