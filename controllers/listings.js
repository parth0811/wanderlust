const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken });
const multer  = require('multer')
const {storage,cloudinary}=require("../cloudConfig.js")
const upload = multer({ storage });


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews", populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};
module.exports.createListing = async (req, res, next) => {
    let response=await geocodingClient.forwardGeocode({
        query:req.body.listing.location,
        limit:1,
    })
    .send()
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    if (response.body.features.length > 0) {
            newListing.geometry = response.body.features[0].geometry;
        } else {
            // ⛔ If geocoding failed, still assign fallback geometry
            newListing.geometry = {
                type: "Point",
                coordinates: [77.2090, 28.6139] // New Delhi fallback
            };
            req.flash("error", "Could not find the location you entered. Using fallback coordinates.");
        }
    let savedLinsting=await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing,originalImageUrl });
};
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    // ✅ Update basic fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    // ✅ Check if location changed
    if (req.body.listing.location !== listing.location || !listing.geometry) {
        const geoData = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        }).send();

        if (geoData.body.features.length > 0) {
            listing.geometry = geoData.body.features[0].geometry;
        } else {
            listing.geometry = {
                type: "Point",
                coordinates: [77.2090, 28.6139], // fallback (Delhi)
            };
            req.flash("error", "Could not geocode new location. Using fallback.");
        }
    }

    // ✅ Update image
    if (req.file) {
        if (listing.image?.filename) {
            await cloudinary.uploader.destroy(listing.image.filename);
        }

        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};