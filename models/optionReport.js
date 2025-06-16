const mongoose = require('mongoose');

const OptionReportSchema = new mongoose.Schema({
  option: { type: mongoose.Schema.Types.ObjectId, ref: 'Option', required: true },
  user_email: { type: String, required: true },
  reason: { type: String }, // optional: allow user to specify reason
  created_at: { type: Date, default: Date.now }
});

OptionReportSchema.index({ option: 1, user_email: 1 }, { unique: true }); // prevent duplicate reports

module.exports = mongoose.model('OptionReport', OptionReportSchema);