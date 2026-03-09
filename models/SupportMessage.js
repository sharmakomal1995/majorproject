const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({
  userId: String,
  message: String,
  reply: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SupportMessage", supportSchema);
