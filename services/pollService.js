const PollMeta = require('../models/pollMeta');
const Option = require('../models/option');
const Rating = require('../models/rating');

// Get all polls
exports.getAllPolls = async () => {
  return PollMeta.find({ status: "active" });
};

// Get poll by ID
exports.getPollById = async (id) => {
  return PollMeta.findById(id);
};

exports.createPollWithOptions = async ({ title, description, options, author_email }) => {
  const pollMeta = new PollMeta({
    title,
    description,
    author_email,
  });
  await pollMeta.save();

  // Batch create options linked to this poll
  const docs = options.map(name => ({
    name,
    poll: pollMeta._id,
    author_email,
  }));
  await Option.insertMany(docs);

  return pollMeta;
};

// Update poll
exports.updatePoll = async (id, data) => {
  return PollMeta.findByIdAndUpdate(id, data, { new: true });
};

// Delete poll
exports.deletePoll = async (id) => {
  await Option.deleteMany({ poll: id });
  return PollMeta.findByIdAndDelete(id);
};

// Get options for a poll
exports.getOptionsByPollId = async (pollId, sortBy = "name") => {
  const sortObj = sortBy === "created_at"
    ? { created_at: -1, name: 1 }
    : { name: 1 };
  return Option.find({ poll: pollId, status: "active" }).sort(sortObj);
};

// Add option to poll
exports.addOptionToPoll = async (pollId, name, authorEmail) => {
  const option = new Option({ name, author_email: authorEmail, poll: pollId });
  await option.save();
  return { success: true, message: "Option added successfully" };
};

// Update option
exports.updateOption = async (optionId, data) => {
  return Option.findByIdAndUpdate(optionId, data, { new: true });
};

// Delete option
exports.deleteOption = async (optionId) => {
  return Option.findByIdAndDelete(optionId);
};

// Save ratings for a poll
exports.saveRatings = async (pollId, ratings, user_email) => {
  for (const optionName in ratings) {
    const option = await Option.findOne({ poll: pollId, name: optionName });
    if (option) {
      const currentRating = parseInt(ratings[optionName]);
      // Check if this user already rated this option
      const existing = await Rating.findOne({ poll: pollId, option: option._id, user_email });
      if (existing) {
        // Optionally, update the rating value or just skip
        continue;
      }
      // Save the rating
      await Rating.create({ poll: pollId, option: option._id, user_email, value: currentRating });
      option.totalRatings += currentRating;
      option.numberOfRatings += 1;
      await option.save();
    }
  }
};

// Get all ratings for a poll
exports.getAllRatings = async (pollId, sortBy = "name") => {
  // Determine sort object based on sortBy parameter
  const sortObj = sortBy === "created_at"
    ? { created_at: -1, name: 1 }
    : { name: 1 };
  // Fetch all options with created_at and name, sorted accordingly
  const options = await Option.find({ poll: pollId, status: "active" }).sort(sortObj);
  const totalRatings = {};
  options.forEach(option => {
    const avgRating = option.numberOfRatings === 0 ? 0 : Math.round((option.totalRatings / option.numberOfRatings) * 10) / 10;
    totalRatings[option.name] = { total: option.totalRatings, count: option.numberOfRatings, avgRating, created_at: option.created_at };
  });
  return totalRatings;
};