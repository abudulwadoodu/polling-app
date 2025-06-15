const mongoose = require('mongoose');

const PollMetaSchema = new mongoose.Schema({
  title: { type: String, required: true, default: "Poll Title" },
  description: { type: String, default: "Poll Description" },
  author_email: { type: String, required: true },
  shortlisted_option: { type: String, default: "" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  closed_at: { type: Date, default: null }
});

// Automatically update `updated_at` on save
PollMetaSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('PollMeta', PollMetaSchema);