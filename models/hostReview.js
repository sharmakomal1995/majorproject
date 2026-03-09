const mongoose = require("mongoose");

const hostReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    communication: {
        type: Number,
        min: 1,
        max: 5
    },
    responseTime: {
        type: Number,
        min: 1,
        max: 5
    },
    comment: String,

    guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    }
}, { timestamps: true });

module.exports = mongoose.model("HostReview", hostReviewSchema);