const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  });
  
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
 });
  
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const camp = new Campground(req.body.campground);
    camp.author = req.user._id;
    await camp.save();
    req.flash("success", "Successfully created a campground")
    res.redirect(`/campgrounds/${camp._id}`);
 }));
  
router.get("/:id",catchAsync( async (req, res, next) => {
    const camp = await Campground.findById(req.params.id).populate('reviews').populate("author");
    if(!camp){
      req.flash("error", "Campground not found");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { camp });
 }));
  
router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const campg = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Successfully updated a campground")
    res.redirect(`/campgrounds/${id}`);
 }));
  
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground")
    res.redirect("/campgrounds");
 }));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  if(!camp){
    req.flash("error", "Campground not found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { camp });
}));

module.exports = router;
