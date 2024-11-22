const HouseService = require('../services/houseService');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

class HouseController {
  static async login(req, res) {
    const { houseName, cardId } = req.body;

    try {
      if (!houseName || !cardId) {
        return res.status(401).json({
          success: false,
          message: 'Required both fields'
        });
      }

      const house = await HouseService.findHouseByCredentials(houseName, cardId);

      if (!house) {
        return res.status(401).json({
          message: 'Invalid house credentials'
        });
      }

      const token = await HouseService.generateToken(house);

      return res.status(200).json({
        success: true,
        token,
        house: {
          houseName: house.houseName,
          isOccupied: house.isOccupied,
          lastUsed: house.lastUsed
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Cannot connect' });
    }
  }

  static async getAllHouses(req, res) {
    try {
      const houses = await HouseService.getAllHouses();
      res.json(houses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getHouseByName(req, res) {
    try {
      const token = req.header("Authorization").split(" ")[1] ||'';

      const decoded = jwt.verify(token, config.JWT_SECRET);
      // if (decoded.houseName !== req.params.houseName) {
      //   return res.status(403).json({ error: 'Unauthorized: House name mismatch' });
      // }

      const house = await HouseService.findHouseByName(decoded.houseName);

      if (!house) {
        return res.status(404).json({ error: 'House not found' });
      }

      res.json(house);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async useCard(req, res) {
    try {
      const { cardId } = req.body;

      const updatedHouse = await HouseService.toggleHouseOccupancy(cardId);

      if (!updatedHouse) {
        return res.status(404).json({ error: 'Invalid card' });
      }

      res.json({
        message: `House is now ${updatedHouse.isOccupied ? 'occupied' : 'vacant'}`,
        house: updatedHouse
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = HouseController;