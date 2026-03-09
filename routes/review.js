const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
);

router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
);
router.get(
    "/:reviewId/edit",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.editReview)
);

router.put(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    validateReview,
    wrapAsync(reviewController.updateReview)
);


module.exports = router;
