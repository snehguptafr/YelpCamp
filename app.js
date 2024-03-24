const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Review = require("./models/review")
const express = require("express");
const ejsMate = require("ejs-mate");
// const Joi = require("joi");
const {campgroundSchema, reviewSchema} = require("./schemas")
const path = require("path");
const app = express();
const methodOverride = require("method-override");

const campgrounds = require("./routes/campgrounds");

const catchAsync = require("./utils/catchAsync");
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



const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  }
  else{
    next();
  }
}

app.use('/campgrounds', campgrounds);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
  const camp = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { camp });
}));

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review)
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`)

}))

app.delete("/campground/:id/reviews/:reviewId", catchAsync(async(req, res) => {
  const {id, reviewId} = req.params;
  console.log(("delete request!"))
  await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
  await Review.findByIdAndDelete(reviewId)
  console.log("deleted")
  res.redirect(`/campgrounds/${id}`)
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
