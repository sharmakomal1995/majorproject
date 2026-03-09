const Listing = require("../models/listing");
const User = require("../models/user");
const timeAgo = require("../utils/timeAgo");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Booking = require("../models/bookings");
const mapToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
    if (req.query.category) {
        const listings = await Listing.find({
            category: req.query.category
        }).populate("reviews");

        return res.render("listings/filter", { listings, currUser: req.user });
    }

    const allListings = await Listing.find({})
        .populate("reviews");

    const states = [...new Set(
        allListings.map(l => l.state).filter(Boolean)
    )];


    const sections = states.map(state => {
        const stateListings = allListings.filter(
            l => l.state === state
        );

        const guestFavCount = stateListings.filter(
            l => l.isGuestFavourite === true
        ).length;

        const avgPrice =
            stateListings.length > 0
                ? stateListings.reduce((sum, l) => sum + l.price, 0) / stateListings.length
                : 0;

        let title;

        if (guestFavCount >= 3) {
            title = `Guest favourite stays in ${state}`;
        } else if (stateListings.length >= 5) {
            title = `Popular homes in ${state}`;
        } else if (Math.random() > 0.7) {
            title = `Available this weekend in ${state}`;
        } else if (avgPrice < 3000) {
            title = `Affordable stays in ${state}`;
        } else {
            title = `Places to stay in ${state}`;
        }

        return {
            title,
            id: String(state).replace(/\s+/g, ""),
            data: stateListings
        };
    });

    res.render("listings/index", { sections, currUser: req.user,footerTop: true });
};

module.exports.searchListings = async (req, res) => {
    const { location, checkin, checkout, guests } = req.query;

    if (!location || !checkin || !checkout || !guests) {
        req.flash("error", "Please fill all search fields");
        return res.redirect("/listings");
    }

    const listings = await Listing.find({
        $or: [
            { city: { $regex: location, $options: "i" } },
            { state: { $regex: location, $options: "i" } },
            { country: { $regex: location, $options: "i" } }
        ],
        maxGuests: { $gte: Number(guests) }
    }).populate("reviews");

    res.render("listings/filter", {
        listings,
        currUser: req.user
    });
};

module.exports.renderNewForm = (req, res) => {
    return res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");

    const bookingCount = await Booking.countDocuments({ listing: id });

    // CANCELLATION DATE CALCULATION
    let cancellationDate = null;

    if (req.user) {
        const latestBooking = await Booking.findOne({
            listing: id,
            user: req.user._id
        }).sort({ createdAt: -1 });

        if (latestBooking && latestBooking.checkIn) {
            const checkInDate = new Date(latestBooking.checkIn);
            cancellationDate = new Date(checkInDate);
            cancellationDate.setDate(checkInDate.getDate() - 5);
        }
    }

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let isSaved = false;

    if (req.user) {
        const user = await User.findById(req.user._id);
        isSaved = user.wishlist.includes(id);
    }
    listing.reviews.forEach(review => {
        review.timeAgo = timeAgo(review.createdAt);
    });
    const requestUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    // RATING CALCULATION START 
    const reviews = listing.reviews || [];

    let totals = {
        rating: 0,
        cleanliness: 0,
        accuracy: 0,
        checkIn: 0,
        communication: 0,
        location: 0,
        value: 0
    };

    reviews.forEach(r => {
        totals.rating += r.rating || 0;
        totals.cleanliness += r.cleanliness || 0;
        totals.accuracy += r.accuracy || 0;
        totals.checkIn += r.checkIn || 0;
        totals.communication += r.communication || 0;
        totals.location += r.location || 0;
        totals.value += r.value || 0;
    });

    const reviewCount = reviews.length;

    let averages = {
        rating: 0,
        cleanliness: 0,
        accuracy: 0,
        checkIn: 0,
        communication: 0,
        location: 0,
        value: 0
    };

    if (reviewCount > 0) {
        averages = {
            rating: (totals.rating / reviewCount).toFixed(1),
            cleanliness: (totals.cleanliness / reviewCount).toFixed(1),
            accuracy: (totals.accuracy / reviewCount).toFixed(1),
            checkIn: (totals.checkIn / reviewCount).toFixed(1),
            communication: (totals.communication / reviewCount).toFixed(1),
            location: (totals.location / reviewCount).toFixed(1),
            value: (totals.value / reviewCount).toFixed(1)
        };
    }
    // STAR DISTRIBUTION CALCULATION 
    let starCounts = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    };

    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            starCounts[r.rating]++;
        }
    });

    let starPercentages = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    };

    if (reviewCount > 0) {
        for (let star = 1; star <= 5; star++) {
            starPercentages[star] =
                Math.round((starCounts[star] / reviewCount) * 100);
        }
    }
    const hostSince = listing.owner?.createdAt
        ? new Date(listing.owner.createdAt).toLocaleString("en-US", {
            month: "short",
            year: "numeric"
        })
        : "Recently joined";

    return res.render("listings/show.ejs", {
        listing, requestUrl, isSaved, timeAgo, averages,
        reviewCount, starPercentages, bookingCount, hostSince, cancellationDate,footerTop: true
    });
};

module.exports.createListing = async (req, res) => {
    const { city, state, country, ...rest } = req.body.listing;

    const geoData = await geocoder.forwardGeocode({
        query: `${city}, ${state}, ${country}`,
        limit: 1,
        types: ["place", "locality"]
    }).send();
    if (!geoData.body.features.length) {
        req.flash("error", "Invalid city name");
        return res.redirect("/listings/new");
    }
    const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    const listing = new Listing({
        ...rest,
        city,
        state,
        country,
        owner: req.user._id,
        location: geoData.body.features[0].geometry,
        images: imgs
    });

    await listing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    return res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    const { city, state, country, ...rest } = req.body.listing;
    const fullLocation = `${city}, ${state}, ${country}`;
    const geoData = await geocoder.forwardGeocode({
        query: fullLocation,
        limit: 1
    }).send();
    listing.set({
        ...rest,
        city,
        state,
        country,
        location: geoData.body.features[0].geometry
    });
    listing.isGuestFavourite = req.body.listing.isGuestFavourite || false;

    const newImages = req.files.filter(f =>
        f.fieldname === "listing[images]"
    );

    newImages.forEach(file => {
        listing.images.push({
            url: file.path,
            filename: file.filename
        });
    });

    req.files.forEach(file => {
        const match = file.fieldname.match(/replaceImages\[(\d+)\]/);
        if (match) {
            const index = parseInt(match[1]);
            listing.images[index] = {
                url: file.path,
                filename: file.filename
            };
        }
    });

    if (req.body.deleteImages) {
        listing.images = listing.images.filter(
            img => !req.body.deleteImages.includes(img.filename)
        );
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    return res.redirect("/listings");
};
