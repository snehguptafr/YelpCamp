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
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoStore = require('connect-mongo');
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews")
const users = require("./routes/users")

const connectionUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose
  .connect(connectionUrl)
  .then(() => console.log("Connected to the database"))
  .catch(() => console.log("Error connecting to the db"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({ replaceWith: "_"}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
  mongoUrl: connectionUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret,
  }
});

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig)); //should be before passport session
app.use(flash());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.maptiler.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://cdn.maptiler.com/",
  "https://api.maptiler.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/ddqlbimns/", 
              "https://images.unsplash.com/",
              "https://api.maptiler.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

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

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if(!err.message) err.message = "Uh oh, something went wrong :("
  res.status(statusCode).render("error", { err })
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server up on port 3000");
});
