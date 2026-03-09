const Booking = require("../models/bookings");

/* PAST TRIPS */
module.exports.pastTrips = async (req, res) => {
    const today = new Date();

    const pastTrips = await Booking.find({
        user: req.user._id,
        checkOut: { $lt: today },
        bookingStatus: { $ne: "cancelled" }
    }).populate("listing");

    res.render("profile/pastTrips", {
        pastTrips,
        page: "trips"
    });
};


/* CONNECTIONS */
module.exports.connections = async (req, res) => {

    const myBookings = await Booking.find({
        user: req.user._id
    }).populate({
        path: "listing",
        populate: { path: "owner" }
    });

    const hostsMap = new Map();

    myBookings.forEach(b => {
        if (b.listing?.owner) {
            hostsMap.set(
                b.listing.owner._id.toString(),
                b.listing.owner
            );
        }
    });

    const connections = Array.from(hostsMap.values());

    res.render("profile/connections", {
        connections,
        page: "connections"
    });
};