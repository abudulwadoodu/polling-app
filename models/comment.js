// models/comment.js
const mongoose = require('mongoose');
const CommentSchema = new mongoose.Schema({
    poll: { type: mongoose.Schema.Types.ObjectId, ref: 'PollMeta', required: true },
    text: { type: String, required: true },
    user_email: { type: String },
    created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Comment', CommentSchema);