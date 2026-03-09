const joi = require('joi');

module.exports.listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        price: joi.number().required().min(0),
        maxGuests: joi.number().min(1).required(),
        country: joi.string().required(),
        category: joi.string().required(),
        city: joi.string().required(),

        latitude: joi.number().required(),
        longitude: joi.number().required(),
        images: joi.array().items(
            joi.object({
                url: joi.string().required(),
                filename: joi.string().required()
            })
        ).optional(),
        isGuestFavourite: joi.boolean().truthy("on").default(false),

    }).required(),
}).options({ allowUnknown: true });

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),

        cleanliness: joi.number().required().min(1).max(5),
        accuracy: joi.number().required().min(1).max(5),
        checkIn: joi.number().required().min(1).max(5),
        communication: joi.number().required().min(1).max(5),
        location: joi.number().required().min(1).max(5),
        value: joi.number().required().min(1).max(5),

        comment: joi.string().required(),
    }).required()
});


