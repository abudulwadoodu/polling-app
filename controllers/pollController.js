// controllers/pollController.js
const pollService = require("../services/pollService");

// Add new option
exports.addOption = async (req, res) => {
  const newOption = req.body.newOption;

  if (!newOption || newOption.trim() === "") {
    res.json({ success: false, message: "Invalid option" });
    return;
  }

  try {
    await pollService.initializeRatings(newOption);
    res.json({ success: true, message: "Option added successfully" });
  } catch (error) {
    res.json({ success: false, message: "Error adding option" });
  }
};

// Rate available options
exports.rateOptions = async (req, res) => {
  try {
    const existingOptions = await pollService.getAllOptions();
    await pollService.saveRatings(req.body.ratings, existingOptions);
    res.json({ success: true, message: "Ratings submitted successfully" });
  } catch (error) {
    res.json({ success: false, message: "Error saving ratings" });
  }
};

// Existing options to rate
exports.getOptions = async (req, res) => {
  try {
    const pollOptions = await pollService.getAllOptions();
    res.json({ options: pollOptions });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Summary of submitted ratings
exports.getAllRatings = async (req, res) => {
  try {
    const totalRatings = await pollService.getAllRatings();
    res.json({ totalRatings: totalRatings });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};