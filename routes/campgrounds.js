const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const {campgroundSchema} = require("../schemas")


const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if(error){
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
    }
    else{
      next();
    }
}

router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  });
  
router.get("/new", (req, res) => {
    res.render("campgrounds/new");
 });
  
router.post("/", validateCampground, catchAsync(async (req, res, next) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
 }));
  
router.get("/:id",catchAsync( async (req, res, next) => {
    const camp = await Campground.findById(req.params.id).populate('reviews');
    res.render("campgrounds/show", { camp });
 }));
  
router.put("/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${id}`);
 }));
  
router.delete("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
 }));

router.get("/:id/edit", catchAsync(async (req, res) => {
  const camp = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { camp });
}));

 module.exports = router;
