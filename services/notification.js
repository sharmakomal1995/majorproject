const nodemailer = require("nodemailer");
const twilio = require("twilio");

// EMAIL FUNCTION
exports.sendBookingEmail = async (user, listing, booking) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Booking Confirmed",
      html: `
        <h2>Booking Confirmed </h2>
        <p>Listing: ${listing.title}</p>
        <p>Check-in: ${booking.checkIn}</p>
        <p>Check-out: ${booking.checkOut}</p>
        <p>Total: ₹${booking.totalPrice}</p>
      `
    });

  } catch (err) {
    console.log("EMAIL ERROR:", err.message);
  }
};



// SMS FUNCTION
exports.sendBookingSMS = async (user, listing) => {
  try {
    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH
    );

    const message = await client.messages.create({
      body: `Booking confirmed for ${listing.title}`,
      from: process.env.TWILIO_PHONE,
      to: user.phone || "+917991177459"
    });

  } catch (err) {
    console.log("SMS ERROR:", err.message);
  }
};

// CANCEL EMAIL FUNCTION
exports.sendBookingCancelledEmail = async (user, listing, booking) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Booking Cancelled",
      html: `
        <h2>Booking Cancelled </h2>
        <p>Listing: ${listing.title}</p>
        <p>Check-in: ${booking.checkIn}</p>
        <p>Check-out: ${booking.checkOut}</p>
        <p>Your booking has been successfully cancelled.</p>
      `
    });

  } catch (err) {
    console.log("CANCEL EMAIL ERROR:", err.message);
  }
};

// CANCEL SMS FUNCTION
exports.sendBookingCancelledSMS = async (user, listing) => {
  try {
    const client = twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH
    );

    await client.messages.create({
      body: `Your booking for ${listing.title} has been cancelled.`,
      from: process.env.TWILIO_PHONE,
      to: user.phone || "+917991177459"
    });

  } catch (err) {
    console.log("CANCEL SMS ERROR:", err.message);
  }
};