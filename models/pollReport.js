const mongoose = require('mongoose');

const PollReportSchema = new mongoose.Schema({
  poll: { type: mongoose.Schema.Types.ObjectId, ref: 'PollMeta', required: true },
  user_email: { type: String, required: true },
  reason: { type: String },
  created_at: { type: Date, default: Date.now }
});

PollReportSchema.index({ poll: 1, user_email: 1 }, { unique: true });

module.exports = mongoose.model('PollReport', PollReportSchema);