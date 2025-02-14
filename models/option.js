// models/Option.js
const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  totalRatings: { type: Number, default: 0 },
  numberOfRatings: { type: Number, default: 0 },
});

module.exports = mongoose.model('Option', OptionSchema);