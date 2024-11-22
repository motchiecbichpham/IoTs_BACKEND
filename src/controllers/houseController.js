const houseService = require("../services/houseService");

exports.loginHouse = async (req, res) => {
  const { houseName, cardId } = req.body;
  try {
    const result = await houseService.loginHouse(houseName, cardId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getAllHouses = async (req, res) => {
  try {
    const houses = await houseService.getAllHouses();
    res.json(houses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getHouseByName = async (req, res) => {
  try {
    const { houseName } = req.params;
    if (req.user.houseName !== houseName) {
      return res.status(403).json({ error: "Unauthorized: House name mismatch" });
    }

    const house = await findHouseByName(houseName);
    if (!house) {
      return res.status(404).json({ error: "House not found" });
    }

    res.json(house);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.useCard = async (req, res) => {
  try {
    const { cardId } = req.body;
    const updatedHouse = await toggleHouseOccupancy(cardId);

    if (!updatedHouse) {
      return res.status(400).json({ error: "Failed to update house status" });
    }

    res.json({
      message: `House is now ${updatedHouse.isOccupied ? "occupied" : "vacant"}`,
      house: updatedHouse,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// Other controller methods similarly implemented
