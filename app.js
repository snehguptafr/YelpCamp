const mongoose = require("mongoose");
const Campground = require("./models/campground");
const express = require("express");
const ejsMate = require("ejs-mate");
const path = require("path");
const app = express();
const methodOverride = require("method-override");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelpcamp")
  .then(() => console.log("Connected to the database"))
  .catch(() => console.log("Error connecting to the db"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

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

app.post("/campgrounds", async (req, res, next) => {
  try{
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
  }
  catch(e){
    next(e)
  }
});

app.get("/campgrounds/:id", async (req, res) => {
  const camp = await Campground.findById(req.params.id);
  res.render("campgrounds/show", { camp });
});

app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${id}`);
});

app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});

app.get("/campgrounds/:id/edit", async (req, res) => {
  const camp = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { camp });
});

app.use((err, req, res, next) => {
  res.send("Uh oh! something went wrong :(")
})

app.listen(3000, () => {
  console.log("Server up on port 3000");
});
