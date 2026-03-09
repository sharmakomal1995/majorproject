const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  bookingStatus: {
    type: String,
    enum: ["pending", "reserved", "cancelled", "completed"],
    default: "pending"
  },
  reviewGiven: {
  type: Boolean,
  default: false
},
  refundStatus: {
    type: String,
    enum: ["none", "initiated", "processed", "failed"],
    default: "none"
  },
  refundAmount: Number,
  refundDate: Date,
  refundId: String,
  timeline: [
    {
      status: String,
      date: Date
    }
  ],
  razorpayOrderId: String,
  razorpayPaymentId: String
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
