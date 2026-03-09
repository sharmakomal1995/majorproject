const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set('strictQuery', true);

const reviewSchema = new Schema({
    rating: { type: Number, min: 1, max: 5, required: true },
    cleanliness: { type: Number, min: 1, max: 5, required: true },
    accuracy: { type: Number, min: 1, max: 5, required: true },
    checkIn: { type: Number, min: 1, max: 5, required: true },
    communication: { type: Number, min: 1, max: 5, required: true },
    location: { type: Number, min: 1, max: 5, required: true },
    value: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });   

module.exports = mongoose.model("Review", reviewSchema);



