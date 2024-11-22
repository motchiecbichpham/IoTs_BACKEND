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

// Other controller methods similarly implemented
