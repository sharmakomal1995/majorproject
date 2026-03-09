const express = require("express");
const router = express.Router();

router.get("/info/:slug", (req, res) => {

    const pages = {
        "help-centre": {
            title: "Help Centre",
            content: "Find answers to common questions and support topics."
        },
        "safety": {
            title: "Safety Information",
            content: "Learn about safety guidelines and reporting issues."
        },
        "aircover": {
            title: "AirCover Protection",
            content: "AirCover provides protection for guests and hosts."
        },
        "experience": {
            title: "Airbnb your experience",
            content: "Host unique experiences and earn income."
        },
        "service": {
            title: "Airbnb your service",
            content: "Offer services to travelers worldwide."
        },
        "summer-release-2026": {
            title: "2026 Summer Release",
            content: "Discover our latest features and improvements launching in Summer 2026."
        },

        "newsroom": {
            title: "Newsroom",
            content: "Read the latest news, announcements, and press updates."
        },

        "careers": {
            title: "Careers at Wanderlust",
            content: "Join our team and help shape the future of travel."
        },

        "investors": {
            title: "Investor Relations",
            content: "Access financial reports, company updates, and investor resources."
        }
    };

    const page = pages[req.params.slug];

    if (!page) {
        return res.status(404).render("static/page", {
            title: "Page Not Found",
            content: "Sorry, this page does not exist."
        });
    }

    res.render("static/page", page);
});

module.exports = router;