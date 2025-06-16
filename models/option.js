const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalRatings: { type: Number, default: 0 },
  numberOfRatings: { type: Number, default: 0 },
  author_email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  poll: { type: mongoose.Schema.Types.ObjectId, ref: 'PollMeta', required: true },
  status: { type: String, default: "active" }
});

// Ensure option name is unique within a poll
OptionSchema.index({ name: 1, poll: 1 }, { unique: true });

module.exports = mongoose.model('Option', OptionSchema);