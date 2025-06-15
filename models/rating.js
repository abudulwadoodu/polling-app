const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  poll: { type: mongoose.Schema.Types.ObjectId, ref: 'PollMeta', required: true },
  option: { type: mongoose.Schema.Types.ObjectId, ref: 'Option', required: true },
  user_email: { type: String, required: true },
  value: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

// Ensure a user can rate an option only once per poll
RatingSchema.index({ poll: 1, option: 1, user_email: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);