const express = require("express");
const router = express.Router();
const User = require("../models/user");
const middleware = require("../middleware");

router.get("/", middleware.isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.render("wishlist/index", { listings: user.wishlist });
});


router.post("/:id", middleware.isLoggedIn, async (req, res) => {
    try {

        const listingId = req.params.id;
        const user = await User.findById(req.user._id);

        const exists = user.wishlist.some(
            id => id.toString() === listingId.toString()
        );

        if (exists) {
            user.wishlist.pull(listingId);
        } else {
            user.wishlist.push(listingId);
        }

        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            saved: !exists
        });

    } catch (err) {
        res.status(500).json({ success: false });
    }
});


module.exports = router;