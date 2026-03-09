require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAPBOX_TOKEN;

mongoose.connect(process.env.ATLASDB_URL)
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log(err));

const geocoder = mbxGeocoding({
  accessToken: process.env.MAPBOX_TOKEN
});

async function updateListings() {
  const listings = await Listing.find({});

  for (let listing of listings) {
    try {
      const response = await geocoder.forwardGeocode({
        query: `${listing.city}, ${listing.country}`,
        limit: 1
      }).send();

      const coords = response.body.features[0].geometry.coordinates;

      listing.location = {
        type: "Point",
        coordinates: coords
      };

      await listing.save();
      console.log(`Updated: ${listing.title}`);
    } catch (err) {
      console.log("Error for:", listing.title);
    }
  }

  mongoose.connection.close();
}

updateListings();
