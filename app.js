if(process.env.NODE_ENV !== "production"){
  require("dotenv").config();
}

const mongoose = require("mongoose");
const express = require("express");
const session  = require("express-session");
const flash = require("connect-flash")
const ejsMate = require("ejs-mate");
const path = require("path");
const app = express();
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews")
const users = require("./routes/users")

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

app.use(session(sessionConfig)); //should be before passport session
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews); 
app.use('/', users);

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
