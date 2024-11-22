const express = require("express");
const auth = require("../middlewares/confirmAuth");
const { connectDB } = require("../utils/db");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { houseName, cardId } = req.body;

  const db = await connectDB();

  try {
    if (!houseName || !cardId) {
      res.send(401).json({
        success: false,
        message: "Required both fields",
      });
    }

    const house = await db.collection("HousesCollection").findOne({
      houseName: houseName,
      "authorizedCard.cardId": cardId,
    });

    if (!house) {
      return res.status(401).json({
        message: "invalid house credentials",
      });
    }

    const token = jwt.sign(
      {
        houseId: house._id,
        houseName: house.houseName,
        cardId: house.authorizedCard.cardId,
      },
      config.JWT_SECRET,
    );

    return res.status(200).json({
      success: true,
      token,
      house: {
        houseName: house.houseName,
        isOccupied: house.isOccupied,
        lastUsed: house.lastUsed,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "cannot connect" });
  }
});

router.get("/houses", async (req, res) => {
  try {
    const db = await connectDB();
    const houses = await db.collection("HousesCollection").find({}).toArray();
    res.json(houses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:houseName", auth, async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (decoded.houseName !== req.params.houseName) {
      return res
        .status(403)
        .json({ error: "Unauthorized: House name mismatch" });
    }

    const db = await connectDB();
    const house = await db.collection("HousesCollection").findOne({
      houseName: req.params.houseName,
    });

    if (!house) {
      return res.status(404).json({ error: "House not found" });
    }

    res.json(house);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: error.message });
  }
});

router.post("/use-card", auth, async (req, res) => {
  try {
    const db = await connectDB();
    const { cardId } = req.body;

    const house = await db.collection("HousesCollection").findOne({
      "authorizedCard.cardId": cardId,
    });

    if (!house) {
      return res.status(404).json({ error: "Invalid card" });
    }

    const result = await db
      .collection("HousesCollection")
      .updateOne({ "authorizedCard.cardId": cardId }, [
        {
          $set: {
            isOccupied: { $not: "$isOccupied" },
            "authorizedCard.lastUsed": new Date(),
            lastUsed: new Date(),
          },
        },
      ]);

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "Failed to update house status" });
    }

    const updatedHouse = await db.collection("HousesCollection").findOne({
      "authorizedCard.cardId": cardId,
    });

    res.json({
      message: `House is now ${updatedHouse.isOccupied ? "occupied" : "vacant"}`,
      house: updatedHouse,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
