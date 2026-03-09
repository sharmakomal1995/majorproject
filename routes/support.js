const express = require("express");
const router = express.Router();
const Support = require("../models/SupportMessage");

// user message save
router.post("/", async (req, res) => {
  await Support.create({
    userId: req.session.userId || "guest",
    message: req.body.message
  });

  res.json({ success: true });
});

// load chat history
router.get("/", async (req, res) => {
  const msgs = await Support.find({
    userId: req.session.userId || "guest"
  }).sort("createdAt");

  res.json(msgs);
});

// admin reply route 
router.post("/reply/:id", async (req, res) => {
  await Support.findByIdAndUpdate(req.params.id, {
    reply: req.body.reply,
    status: "answered"
  });

  res.redirect("/support/admin/support");
});

// admin inbox page
router.get("/admin/support", async (req, res) => {
  const msgs = await Support.find().sort({ createdAt: -1 });
  res.render("admin/support", { msgs });
});


module.exports = router;
