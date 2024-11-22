const express = require("express");
const houseController = require("../controllers/houseController");
const auth = require("../middlewares/confirmAuth");

const router = express.Router();

router.post("/login", houseController.loginHouse);
router.get("/houses", houseController.getAllHouses);
router.get("/:houseName", auth, houseController.getHouseByName);
router.post("/use-card", auth, houseController.useCard);

module.exports = router;
