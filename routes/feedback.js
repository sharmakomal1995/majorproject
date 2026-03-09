const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  try {
    const { feedback } = req.body;

    // save in MongoDB
    await Feedback.create({ message: feedback });

    // send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Feedback Received",
      text: feedback,
    });

    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

router.post("/support", async (req, res) => {
  const { message } = req.body;

  await Feedback.create({
    message,
    page: "contact"
  });

  res.json({ success: true });
});


module.exports = router;
