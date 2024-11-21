const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const authenticateHouse = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ error: "Please authenticate" });

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.house = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticateHouse;
