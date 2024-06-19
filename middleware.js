const express = require("express");
const Campground = require("./models/campground");
const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You need to be signed in");
        return res.redirect("/login");
    }
    next()
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
    }
    else{
      next();
    }
}

module.exports.isAuthor = async(req, res, next) =>{
  const { id } = req.params;
  const camp = await Campground.findById(id);
    if(!camp.author.equals(req.user._id)){
      req.flash("error", "You don't have permissions to do that!");
      return res.redirect(`/campgrounds/${id}`)
    }
    next();
}
