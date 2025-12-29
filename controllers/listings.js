const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    return res.render("listings/index.ejs", { allListings });
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

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    return res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
    const url = req.file.path;
    const filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    await newListing.save();

    req.flash("success", "New Listing Created!");
    return res.redirect("/listings");
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

    listing.set(req.body.listing);

    if (req.file) {
        const url = req.file.path;
        const filename = req.file.filename;
        listing.image = { url, filename };
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    return res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    return res.redirect("/listings");
};
