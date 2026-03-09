const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile");
const { isLoggedIn } = require("../middleware");

router.get("/past-trips", isLoggedIn, profileController.pastTrips);

router.get("/connections", isLoggedIn, profileController.connections);

module.exports = router;