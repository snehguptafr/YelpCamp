const mongoose = require("mongoose");
const Campground = require("./models/campground");
const express = require("express");
const path = require("path");
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/yelpcamp")
    .then(() => console.log("Connected to the database"))
    .catch(() => console.log("Error connecting to the db"))

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/newcamp", async (req, res) => {
    const newCamp = new Campground({
        title: "Goa Campground",
        price: "20000",
        description: "Beauiful campground by the beach",
        location: "Goa"
    })
    await newCamp.save();
    console.log(newCamp)
    res.send(newCamp)
})

app.listen(3000, () => {
    console.log("Server up on port 3000")
})