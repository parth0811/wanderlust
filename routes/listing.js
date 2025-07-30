const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner, validateListing, normalizeImage } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js")
const upload = multer({ storage });


router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,
        upload.single("listing[image]"),
        normalizeImage,
        validateListing,
        wrapAsync(listingController.createListing)
    );
    

//New r
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"),normalizeImage, validateListing,
        wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)
    );
    
//Edit r
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;