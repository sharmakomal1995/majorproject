const express = require("express");
const router = express.Router({ mergeParams: true });
const HostReview = require("../models/hostReview");
const Booking = require("../models/bookings");
const { isLoggedIn } = require("../middleware");

// POST - Create Host Review
router.post("/", isLoggedIn, async (req, res) => {

 const { bookingId, rating, comment } = req.body;

 const booking = await Booking.findById(bookingId).populate("listing");

 if (!booking || !booking.user.equals(req.user._id)) {
  req.flash("error", "Unauthorized");
  return res.redirect("back");
 }

 const review = new HostReview(req.body.hostReview);
 review.guest = req.user._id;
 review.host = booking.listing.owner;
 review.booking = booking._id;
 review.rating = rating;
 review.comment = comment;

 await review.save();

 booking.reviewGiven = true;
 await booking.save();

 req.flash("success", "Review submitted successfully!");
 res.redirect("/bookings/my-bookings");
});

module.exports = router;