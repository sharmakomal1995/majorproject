const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set('strictQuery', true);
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,

    },
    description: String,

    images: [
        {
            url: String,
            filename: String,
        }
    ],

    price: Number,
    location: String,
    country: String,

    category: {
        type: String,
        required: true,
    },

    maxGuests: {
        type: Number,
        required: true,
        min: 1
    },

    bedrooms: {
        type: Number,
        default: 1
    },
    beds: {
        type: Number,
        default: 1
    },
    bathrooms: {
        type: Number,
        default: 1
    },
    space: String,
    guestAccess: String,
    duringStay: String,
    otherThings: String,
    uniqueFeature: String,
    nearbyPlaces: String,
    foodSpots: String,


    isGuestFavourite: {
        type: Boolean,
        default: false,
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    bookings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Booking",
        },
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    city: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    checkInTime: {
        type: String,
        default:"after 2:00 PM"
    },
    checkOutTime: {
        type: String,
        default:"before 11:00 AM"
    }

});

// Average rating (from reviews)
listingSchema.virtual("avgRating").get(function () {
    if (!this.reviews || this.reviews.length === 0) return null;

    const sum = this.reviews.reduce(
        (total, review) => total + review.rating,
        0
    );
    return sum / this.reviews.length;
});

// Total reviews count
listingSchema.virtual("reviewsCount").get(function () {
    return this.reviews ? this.reviews.length : 0;
});


listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;