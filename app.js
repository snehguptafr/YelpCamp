const mongoose = require("mongoose");
const Campground = require("./models/campground");
const express = require("express");
const session  = require("express-session");
const ejsMate = require("ejs-mate");
const path = require("path");
const app = express();
const methodOverride = require("method-override");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews")

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
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "topsecret",
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))



app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews); 

app.get("/", (req, res) => {
  res.render("home");
});





// app.all('*', (req, res, next) => {
//   next(new ExpressError("Page not found", 404));
// })

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if(!err.message) err.message = "Uh oh, something went wrong :("
  res.status(statusCode).render("error", { err })
})

app.listen(3000, () => {
  console.log("Server up on port 3000");
});
