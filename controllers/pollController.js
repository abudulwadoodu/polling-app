// controllers/pollController.js
const pollService = require("../services/pollService");

// default options
let pollOptions = [
  "Lulu Barbeque Nation",
  "Karthika Park",
  "O by Tamara",
  "Imperial Kitchen",
];

exports.addOption = (req, res) => {
  const newOption = req.body.newOption;

  if (!newOption || newOption.trim() === "") {
    res.json({ success: false, message: "Invalid option" });
    return;
  }

  pollOptions.push(newOption);
  pollService.initializeRatings(newOption);

  res.json({ success: true, message: "Option added successfully" });
};

exports.rateOptions = async (req, res) => {
  try {
    await pollService.saveRatings(req.body.ratings, pollOptions);
    res.json({ success: true, message: "Ratings submitted successfully" });
  } catch (error) {
    res.json({ success: false, message: "Error saving ratings" });
  }
};

exports.getOptions = (req, res) => {
  res.json({ options: pollOptions });
};

exports.getTotalRatings = async (req, res) => {
  try {
    const totalRatings = await pollService.getTotalRatings();
    res.json({ totalRatings: totalRatings });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
