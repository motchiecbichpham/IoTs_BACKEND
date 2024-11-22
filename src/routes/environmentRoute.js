const express = require("express");
const router = express.Router();
const environmentController = require("../controllers/environmentController");

router.get("/", environmentController.getAllEnvironmentalData);
router.get("/daily", environmentController.getDailyEnvironmentalData);

module.exports = router;
