const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Review = require("./models/review")
const express = require("express");
const ejsMate = require("ejs-mate");
// const Joi = require("joi");
const {campgroundSchema} = require("./schemas")
const path = require("path");
const app = express();
const methodOverride = require("method-override");

const catchAsync = require("./utils/catchAsync");
const expressError = require("./utils/ExpressError");
const ExpressError = require("./utils/ExpressError");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelpcamp")
  .then(() => console.log("Connected to the database"))
  .catch(() => console.log("Error connecting to the db"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

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

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
  const camp = new Campground(req.body.campground);
  await camp.save();
  res.redirect(`/campgrounds/${camp._id}`);
}));

app.get("/campgrounds/:id",catchAsync( async (req, res, next) => {
  const camp = await Campground.findById(req.params.id);
  res.render("campgrounds/show", { camp });
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${id}`);
}));

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
}));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
  const camp = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { camp });
}));

app.post("/campgrounds/:id/reviews", catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review)
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`)

}))

app.all('*', (req, res, next) => {
  next(new ExpressError("Page not found", 404));
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if(!err.message) err.message = "Uh oh, something went wrong :("
  res.status(statusCode).render("error", { err })
})

app.listen(3000, () => {
  console.log("Server up on port 3000");
});
