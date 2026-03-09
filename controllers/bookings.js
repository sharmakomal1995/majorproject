const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/bookings");
const { sendBookingCancelledEmail, sendBookingCancelledSMS } = require("../services/notification");
const Listing = require("../models/listing");
const notification = require("../services/notification");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

// Render checkout page
module.exports.renderCheckout = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate("reviews"); 

  if (!listing) return res.status(404).send("Listing not found");

  const { checkIn, checkOut, adults, children, infants, pets } = req.query;
  const totalGuests =
    Number(adults || 0) +
    Number(children || 0) +
    Number(infants || 0) +
    Number(pets || 0);

  // calculate nights
  const nights = Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );

  const price = listing.price;
  const totalPrice = nights * price;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + tax;

  // avg rating calculation
  let avgRating = 0;
  let reviewCount = listing.reviews.length;

  if (reviewCount > 0) {
    const total = listing.reviews.reduce((sum, r) => sum + r.rating, 0);
    avgRating = (total / reviewCount).toFixed(1);
  }

  res.render("bookings/checkout", {
    listing,
    avgRating,
    reviewCount,
    checkIn,
    checkOut,
    adults,
    children,
    infants,
    pets,
    totalGuests,
    nights,
    price,
    totalPrice,
    tax,
    grandTotal
  });
};

// Create order
module.exports.createOrder = async (req, res) => {
  try {

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const { checkIn, checkOut, guests } = req.body;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "Dates missing" });
    }

    const nights =
      (new Date(checkOut) - new Date(checkIn)) /
      (1000 * 60 * 60 * 24);

    if (nights <= 0) {
      return res.status(400).json({ error: "Invalid date selection" });
    }

    const total = nights * listing.price;

    // Prevent double booking
    const existing = await Booking.findOne({
      listing: listing._id,
      bookingStatus: "reserved",
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn }
    });

    if (existing) {
      return res.status(400).json({ message: "Dates already booked" });
    }

    const booking = new Booking({
      user: req.user._id,
      listing: listing._id,
      checkIn,
      checkOut,
      guests,
      totalPrice: total,
      timeline: [{ status: "created", date: new Date() }]
    });
    
    await booking.save();

    const order = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: booking._id.toString()
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      bookingId: booking._id,
      key: process.env.RAZORPAY_KEY

    });

  } catch (err) {
    return res.status(500).json({
      error: "Something went wrong",
      details: err.message
    });
  }
};


// Verify payment
module.exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false });
  }

  const booking = await Booking.findById(bookingId).populate("listing");

  booking.paymentStatus = "paid";
  booking.bookingStatus = "reserved";
  booking.razorpayPaymentId = razorpay_payment_id;
  if (!booking.timeline) booking.timeline = [];

  booking.timeline.push({
    status: "paid",
    date: new Date()
  });
  await booking.save();

  // SEND NOTIFICATIONS HERE
  await notification.sendBookingEmail(req.user, booking.listing, booking);
  await notification.sendBookingSMS(req.user, booking.listing);
  res.json({ success: true });
};

// Success page
module.exports.successPage = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("listing");
  res.render("bookings/success", { booking });
};

module.exports.myBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const userBookings = await Booking.find({ user: userId })
      .populate({
        path: "listing",
        select: "title images"
      })
      .sort({ createdAt: -1 });
    
    res.render("bookings/myBookings", { bookings: userBookings });

  } catch (err) {
    console.log(err);
    res.send("Error loading bookings");
  }
};

module.exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking
      .findById(req.params.id)
      .populate("user")
      .populate("listing");

    if (!booking) return res.send("Booking not found");

    if (!booking.user._id.equals(req.user._id))
      return res.send("Unauthorized");

    booking.bookingStatus = "cancelled";

    // IF PAYMENT DONE → INITIATE REFUND
    if (booking.paymentStatus === "paid") {

      const refund = await razorpay.payments.refund(
        booking.razorpayPaymentId,
        { amount: booking.totalPrice * 100 }
      );

      booking.refundStatus = "processed";
      booking.refundAmount = booking.totalPrice;
      booking.refundDate = new Date();
      booking.refundId = refund.id;

      booking.timeline.push({
        status: "refund-processed",
        date: new Date()
      });
    }

    booking.timeline.push({
      status: "cancelled",
      date: new Date()
    });

    await booking.save();

    await sendBookingCancelledEmail(booking.user, booking.listing, booking);
    await sendBookingCancelledSMS(booking.user, booking.listing);

    res.redirect("/bookings/my-bookings");

  } catch (err) {
    console.log(err);
    res.send("Cancel failed");
  }
};

module.exports.downloadInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("listing")
      .populate("user");

    if (!booking) {
      return res.send("Booking not found");
    }

    if (!booking.user._id.equals(req.user._id)) {
      return res.send("Unauthorized");
    }

    res.render("bookings/invoice", { booking });

  } catch (err) {
    console.log(err);
    res.send("Error generating invoice");
  }
};

module.exports.refundBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) return res.send("Booking not found");

  if (booking.paymentStatus !== "paid")
    return res.send("Payment not completed");

  const refund = await razorpay.payments.refund(
    booking.razorpayPaymentId,
    {
      amount: booking.totalPrice * 100
    }
  );

  booking.refundStatus = "processed";
  booking.refundAmount = booking.totalPrice;
  booking.refundDate = new Date();
  booking.refundId = refund.id;

  booking.timeline.push({
    status: "refunded",
    date: new Date()
  });

  await booking.save();

  res.send("Refund successful");
}

module.exports.adminCancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("user")
    .populate("listing");

  if (!booking) return res.send("Not found");

  booking.bookingStatus = "cancelled";

  // refund auto if paid
  if (booking.paymentStatus === "paid") {

    const refund = await razorpay.payments.refund(
      booking.razorpayPaymentId,
      { amount: booking.totalPrice * 100 }
    );

    booking.refundStatus = "processed";
    booking.refundAmount = booking.totalPrice;
    booking.refundDate = new Date();
    booking.refundId = refund.id;

    booking.timeline.push({
      status: "refunded-by-admin",
      date: new Date()
    });
  }

  booking.timeline.push({
    status: "cancelled-by-admin",
    date: new Date()
  });

  await booking.save();

  await sendBookingCancelledEmail(
    booking.user,
    booking.listing,
    booking
  );

  res.send("Admin cancelled + refund done");
};