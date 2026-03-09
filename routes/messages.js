const express = require("express");
const router = express.Router();

const controller = require("../controllers/messages");
const { isLoggedIn } = require("../middleware");

router.get("/contact/:listingId", isLoggedIn, controller.contactHostPage);

router.post("/contact/:listingId", isLoggedIn, controller.sendMessage);

router.get("/inbox", isLoggedIn, controller.inbox);

router.get("/chat/:userId/:listingId", isLoggedIn, controller.chat);

router.post("/reply/:userId/:listingId", isLoggedIn, controller.reply);

router.get("/fetch/:userId/:listingId", isLoggedIn, controller.fetchMessages);

module.exports = router;