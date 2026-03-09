const express = require("express");
const router = express.Router();
const bookings = require("../controllers/bookings");
const Booking = require("../models/bookings");
const Review = require("../models/review"); 
const { isLoggedIn, validateBooking,isAdmin } = require("../middleware");

router.get("/:id/checkout", isLoggedIn, bookings.renderCheckout);

router.post("/:id/create-order",
  isLoggedIn,
  bookings.createOrder
);

router.post("/verify", isLoggedIn, bookings.verifyPayment);

router.get("/success/:id", isLoggedIn, bookings.successPage);

router.get("/my-bookings", isLoggedIn, bookings.myBookings);

router.patch("/:id/cancel", isLoggedIn, bookings.cancelBooking);

router.get("/:id/invoice", isLoggedIn, bookings.downloadInvoice);

router.post("/:id/refund", isLoggedIn, bookings.refundBooking);

router.patch("/:id/admin-cancel",
  isLoggedIn,
  isAdmin,
  bookings.adminCancelBooking
);

router.get("/:id/details",isLoggedIn, async(req,res)=>{
 const booking = await Booking.findById(req.params.id);
 res.render("bookings/details",{booking});
});

router.get("/:id/review", isLoggedIn, async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("listing");

  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/bookings/my-bookings");
  }

  res.render("bookings/review", { booking });
});

router.post("/:id/review", isLoggedIn, async (req, res) => {
  console.log("BODY =", req.body);
  const booking = await Booking.findById(req.params.id)
    .populate("listing");

  const { rating, comment } = req.body;

  const review = new Review({
    rating,
    comment,
    author: req.user._id,
    listing: booking.listing._id
  });

  await review.save();

  booking.reviewGiven = true;
  await booking.save();

  req.flash("success", "Review submitted successfully!");
  res.redirect("/bookings/my-bookings");
});


module.exports = router;
