const environmentService = require("../services/environmentService");

exports.getAllEnvironmentalData = async (req, res) => {
  try {
    const environmentData = await environmentService.getAllEnvironmentalData();
    res.json(environmentData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDailyEnvironmentalData = async (req, res) => {
  try {
    const hourlyEnvironmentData =
      await environmentService.getDailyEnvironmentalData();
    res.json(hourlyEnvironmentData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
