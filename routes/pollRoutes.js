const express = require("express");
const path = require("path");
const router = express.Router();
const pollController = require("../controllers/pollController");

// Serve frontend
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Poll CRUD
router.get("/api/polls", pollController.getAllPolls);
router.post("/api/createPoll", pollController.createPoll);
router.get("/api/poll/:id", pollController.getPollById);
router.put("/api/poll/:id", pollController.updatePoll);
router.delete("/api/poll/:id", pollController.deletePoll);
router.post("/api/poll/:id/report", pollController.reportPoll);

// Option CRUD (poll-specific)
router.get("/api/poll/:id/options", pollController.getOptionsByPollId);
router.post("/api/poll/:id/option", pollController.addOptionToPoll);
router.put("/api/option/:optionId", pollController.updateOption);
router.delete("/api/option/:optionId", pollController.deleteOption);
router.post("/api/option/:optionId/report", pollController.reportOption);

// Ratings (poll-specific)
router.post("/api/poll/:id/rateOptions", pollController.rateOptions);
router.get("/api/poll/:id/getAllRatings", pollController.getAllRatings);

// Admin: List reported polls/options and handle actions
router.get("/api/reportedPolls", pollController.getReportedPolls);
router.get("/api/reportedOptions", pollController.getReportedOptions);
router.post("/api/poll/:id/markNotIssue", pollController.markPollNotIssue);
router.post("/api/poll/:id/markDeleted", pollController.markPollDeleted);
router.post("/api/option/:optionId/markNotIssue", pollController.markOptionNotIssue);
router.post("/api/option/:optionId/markDeleted", pollController.markOptionDeleted);

module.exports = router;