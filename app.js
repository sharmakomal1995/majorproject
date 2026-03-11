if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const wishlistRoutes = require("./routes/wishlist");
const feedbackRoutes = require("./routes/feedback");
const companyRoutes = require("./routes/company");

const Feedback = require("./models/feedback");
const nodemailer = require("nodemailer");
const bookingRoutes = require("./routes/bookings");
const hostReviewRoutes = require("./routes/hostReviews");
const messageRoutes = require("./routes/messages");
const profileRoutes = require("./routes/profile");
const staticRoutes = require("./routes/static");

mongoose.set("strictQuery", true);

const dbUrl = process.env.ATLASDB_URL;
const sessionSecret = process.env.SESSION_SECRET;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("connected to DB");
}
main().catch(console.log);

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  touchAfter: 24 * 3600,
});

app.use(
  session({
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);


app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  next();
});

app.use((req, res, next) => {
  res.locals.bodyClass = "";
  next();
});

app.use((req, res, next) => {
  res.locals.currUser = req.user;
  next();
});

app.use((req,res,next)=>{
    res.locals.currentPath = req.path;
    next();
});

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/profile", profileRoutes);
app.use("/bookings", bookingRoutes);
app.use("/messages", messageRoutes);
app.use("/host-reviews", hostReviewRoutes);

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.use("/wishlist", wishlistRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/support", require("./routes/support"));

app.use("/", companyRoutes);
app.use("/", staticRoutes);
app.use("/", userRouter);

// Feedback POST Route
app.post("/feedback", async (req, res) => {
  try {
    const { message, isBug, page } = req.body;

    // Save to MongoDB
    await Feedback.create({
      message,
      isBug: isBug === "on",
      page,
    });

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Airbnb Feedback" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Feedback Received",
      html: `
        <h3>New Feedback</h3>
        <p><b>Message:</b> ${message}</p>
        <p><b>Bug Report:</b> ${isBug === "on" ? "Yes" : "No"}</p>
        <p><b>Page:</b> ${page}</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// Footer Pages Routes 
app.get("/privacy", (req, res) => {
  res.render("privacy");
});

app.get("/terms", (req, res) => {
  res.render("terms");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});



app.use((req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const { statusCode = 500, message = "something went wrong!" } = err;
  res.status(statusCode).render("error", { message });
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});