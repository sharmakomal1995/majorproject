const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  isBug: {
    type: Boolean,
    default: false,
  },
  page: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
