// routes/pollRoutes.js
const express = require("express");
const router = express.Router();
const pollController = require("../controllers/pollController");

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

router.post("/addOption", pollController.addOption);
router.post("/rateOptions", pollController.rateOptions);
router.get("/getOptions", pollController.getOptions);
router.get("/getTotalRatings", pollController.getTotalRatings);

module.exports = router;
