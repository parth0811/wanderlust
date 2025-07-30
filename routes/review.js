const express=require("express");
const router=express.Router({mergeParams:true});
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const{validateReview,isLoggedIn,isReviewAuthor,saveRedirectUrl}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");

//reviews
//post
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
//delete 
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports=router;