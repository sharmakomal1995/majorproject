const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
const User = require("../models/user");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

router.get("/test", (req, res) => {
  res.send("USER ROUTES WORKING");
});

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(userController.signup);

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        (req, res) => {
            req.flash("success", "Welcome back to Wanderlust!");
            const redirectUrl = res.locals.redirectUrl || "/listings";
            res.redirect(redirectUrl);
        }
    );

router.get("/logout", userController.logout);
router.get("/profile", userController.profile);

router.post(
  "/profile",
  isLoggedIn,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const updateData = {
        username: req.body.username
      };

      if (req.file) {
        updateData.profileImage = {
          url: req.file.path,
          filename: req.file.filename
        };
      }

      await User.findByIdAndUpdate(req.user._id, updateData);

      req.flash("success", "Profile updated");
      res.redirect("/profile/about");
    } catch (err) {
      console.log(err);
      req.flash("error", "Something went wrong");
      res.redirect("/profile/about");
    }
  }
);


router.get("/profile/about", isLoggedIn, (req, res) => {
  const editMode = req.query.editMode === "true";

  res.render("users/profile", {
    editMode,
    currUser: req.user,
    page: "about",
  });
});

router.get("/profile/past-trips", isLoggedIn, (req, res) => {
  res.render("users/pastTrips", {
    currUser: req.user,
    page: "trips"
  });
});

router.get("/profile/connections", isLoggedIn, (req, res) => {
  res.render("users/connections", {
    currUser: req.user,
    page: "connections"
  });
});

router.post("/profile/update", isLoggedIn, async (req, res) => {
  try {
    const { field, value } = req.body;

     console.log("BODY:", req.body);
console.log("USER ID:", req.user._id);

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        [`profile.${field}`]: value
      }
    });

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    
    res.sendStatus(500);
  }
});

const HostReview = require("../models/hostReview");

router.get("/hosts/:id", async (req, res) => {

    const host = await User.findById(req.params.id);

    const reviews = await HostReview.find({ host: host._id });

    let avgRating = 0;
    if (reviews.length > 0) {
        avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    }

    res.render("users/hostProfile", {
        host,
        reviews,
        avgRating
    });
});


module.exports = router;
