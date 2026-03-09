const express = require("express");
const router = express.Router();

router.get("/company-details", (req, res) => {
  res.render("company");
});

module.exports = router;
