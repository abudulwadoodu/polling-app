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
router.delete("/api/poll/:id", pollController.markPollDeleted);
router.post("/api/poll/:id/report", pollController.reportPoll);

// Option CRUD (poll-specific)
router.get("/api/poll/:id/options", pollController.getOptionsByPollId);
router.post("/api/poll/:id/option", pollController.addOptionToPoll);
router.put("/api/option/:optionId", pollController.updateOption);
router.delete("/api/option/:optionId", pollController.markOptionDeleted);
router.post("/api/option/:optionId/report", pollController.reportOption);

// Ratings (poll-specific)
router.post("/api/poll/:id/rateOptions", pollController.rateOptions);
router.get("/api/poll/:id/getAllRatings", pollController.getAllRatings);

// Comments (poll-specific)
router.get("/api/poll/:id/comments", pollController.getComments);
router.post("/api/poll/:id/comments", pollController.addComment);

// Admin: List reported polls/options and handle actions
router.get("/api/reportedPolls", pollController.getReportedPolls);
router.get("/api/reportedOptions", pollController.getReportedOptions);
router.post("/api/poll/:id/markNotIssue", pollController.markPollNotIssue);
router.post("/api/option/:optionId/markNotIssue", pollController.markOptionNotIssue);

module.exports = router;