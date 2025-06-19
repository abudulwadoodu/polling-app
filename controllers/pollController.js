const pollService = require("../services/pollService");
const PollReport = require("../models/pollReport"); 
const OptionReport = require("../models/optionReport"); 
const Comment = require("../models/comment");

// Get all polls
exports.getAllPolls = async (req, res) => {
  try {
    const polls = await pollService.getAllPolls();
    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get poll by ID
exports.getPollById = async (req, res) => {
  try {
    const poll = await pollService.getPollById(req.params.id);
    res.json(poll);
  } catch (error) {
    res.status(404).json({ error: "Poll not found" });
  }
};

// Create a new poll with options
exports.createPoll = async (req, res) => {
  try {
    const { title, description, options, author_email } = req.body;
    if (!title || !description || !Array.isArray(options) || options.length === 0 || !author_email) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    // Use pollService to create poll and options
    const poll = await pollService.createPollWithOptions({ title, description, options, author_email });
    res.json({ success: true, pollId: poll._id, poll });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating poll", error: error.message });
  }
};

// Update poll
exports.updatePoll = async (req, res) => {
  try {
    const poll = await pollService.updatePoll(req.params.id, req.body);
    res.json(poll);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete poll
// exports.deletePoll = async (req, res) => {
//   try {
//     await pollService.deletePoll(req.params.id);
//     res.json({ success: true });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

exports.reportPoll = async (req, res) => {
  try {
    await PollReport.create({
      poll: req.params.id,
      user_email: req.body.user_email,
      reason: req.body.reason || "",
      reported_at: new Date()
    });
    // Update poll status to "flagged"
    await pollService.updatePoll(req.params.id, { status: "flagged" });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get options for a poll
exports.getOptionsByPollId = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || "name";
    const user_email = req.query.user_email;
    const options = await pollService.getOptionsByPollId(req.params.id, sortBy);

    if (user_email) {
      const Rating = require("../models/rating");
      const rated = await Rating.find({ poll: req.params.id, user_email });
      const ratedOptionIds = new Set(rated.map(r => r.option.toString()));
      options.forEach(opt => {
        opt.ratedByUser = ratedOptionIds.has(opt._id.toString());
      });
    } else {
      options.forEach(opt => { opt.ratedByUser = false; });
    }

    res.json({ options });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add option to poll
exports.addOptionToPoll = async (req, res) => {
  try {
    const result = await pollService.addOptionToPoll(req.params.id, req.body.newOption, req.body.user_email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update option
exports.updateOption = async (req, res) => {
  try {
    const updated = await pollService.updateOption(req.params.optionId, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete option
// exports.deleteOption = async (req, res) => {
//   try {
//     await pollService.deleteOption(req.params.optionId);
//     res.json({ success: true });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// Rate options for a poll
exports.rateOptions = async (req, res) => {
  try {
    const user_email = req.body.user_email;
    if (!user_email) return res.status(400).json({ error: "Email required" });
    await pollService.saveRatings(req.params.id, req.body.ratings, user_email);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.reportOption = async (req, res) => {
  try {
    await OptionReport.create({
      option: req.params.optionId,
      user_email: req.body.user_email,
      reason: req.body.reason || "", 
      reported_at: new Date()
    });
    // Update option status to "flagged"
    const Option = require("../models/option");
    await Option.findByIdAndUpdate(req.params.optionId, { status: "flagged" });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all ratings for a poll
exports.getAllRatings = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || "name";
    const totalRatings = await pollService.getAllRatings(req.params.id, sortBy);
    res.json({ ratings: totalRatings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List reported polls
exports.getReportedPolls = async (req, res) => {
  const PollReport = require("../models/pollReport");
  const PollMeta = require("../models/pollMeta");
  // Get latest report for each poll
  const reports = await PollReport.aggregate([
    { $sort: { created_at: -1 } },
    { $group: { _id: "$poll", reason: { $first: "$reason" }, reportedBy: { $first: "$user_email" }, reportedAt: { $first: "$created_at" } } }
  ]);
  const pollIds = reports.map(r => r._id);
  // Exclude polls with status "deleted"
  const polls = await PollMeta.find({ _id: { $in: pollIds }, status: { $ne: "deleted" } });
  // Attach reason, reporter, and date to each poll
  const pollsWithDetails = polls.map(p => {
    const report = reports.find(r => r._id.equals(p._id));
    return { ...p.toObject(), reason: report ? report.reason : "", reportedBy: report ? report.reportedBy : "", reportedAt: report ? report.reportedAt : "" };
  });
  res.json(pollsWithDetails);
};

// List reported options
exports.getReportedOptions = async (req, res) => {
  const OptionReport = require("../models/optionReport");
  const Option = require("../models/option");
  const PollMeta = require("../models/pollMeta");
  const reports = await OptionReport.aggregate([
    { $sort: { created_at: -1 } },
    { $group: { _id: "$option", reason: { $first: "$reason" }, reportedBy: { $first: "$user_email" }, reportedAt: { $first: "$created_at" } } }
  ]);
  const optionIds = reports.map(r => r._id);
  // Exclude options with status "deleted"
  const options = await Option.find({ _id: { $in: optionIds }, status: { $ne: "deleted" } });
  // Fetch poll IDs for each option
  const pollIdSet = new Set(options.map(o => o.poll.toString()));
  // Exclude polls with status "deleted"
  const polls = await PollMeta.find({ _id: { $in: Array.from(pollIdSet) }, status: { $ne: "deleted" } });
  const validPollIds = new Set(polls.map(p => p._id.toString()));
  // Exclude options whose poll is deleted
  const filteredOptions = options.filter(o => validPollIds.has(o.poll.toString()));
  const optionsWithDetails = filteredOptions.map(o => {
    const report = reports.find(r => r._id.equals(o._id));
    const poll = polls.find(p => p._id.equals(o.poll));
    return {
      ...o.toObject(),
      pollTitle: poll ? poll.title : "",
      reason: report ? report.reason : "",
      reportedBy: report ? report.reportedBy : "",
      reportedAt: report ? report.reportedAt : ""
    };
  });
  res.json(optionsWithDetails);
};

// Mark poll as not an issue
exports.markPollNotIssue = async (req, res) => {
  const PollMeta = require("../models/pollMeta");
  const PollReport = require("../models/pollReport");
  await PollMeta.findByIdAndUpdate(req.params.id, { status: "active" });
  await PollReport.deleteOne({ poll: req.params.id, user_email: req.body.user_email });
  res.json({ success: true });
};

// Mark poll as deleted
exports.markPollDeleted = async (req, res) => {
  const PollMeta = require("../models/pollMeta");
  await PollMeta.findByIdAndUpdate(req.params.id, { status: "deleted" });
  res.json({ success: true });
};

// Mark option as not an issue
exports.markOptionNotIssue = async (req, res) => {
  const Option = require("../models/option");
  const OptionReport = require("../models/optionReport");
  await Option.findByIdAndUpdate(req.params.optionId, { status: "active" });
  await OptionReport.deleteOne({ option: req.params.optionId, user_email: req.body.user_email });
  res.json({ success: true });
};

// Mark option as deleted
exports.markOptionDeleted = async (req, res) => {
  const Option = require("../models/option");
  await Option.findByIdAndUpdate(req.params.optionId, { status: "deleted" });
  res.json({ success: true });
};

exports.getComments = async (req, res) => {
    const comments = await Comment.find({ poll: req.params.id }).sort({ created_at: -1 });
    res.json(comments);
};

exports.addComment = async (req, res) => {
    const { text, user_email } = req.body;
    const comment = new Comment({
        poll: req.params.id,
        text,
        user_email,
        created_at: new Date()
    });
    await comment.save();
    res.json({ success: true });
};