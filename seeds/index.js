const mongoose = require("mongoose");
const Campground = require("../models/campground");
const {camps} = require("./dataset")
mongoose.connect("mongodb://127.0.0.1:27017/yelpcamp")
    .then(() => console.log("Connected to the database"))
    .catch(() => console.log("Error connecting to the db"))

const seeding = async() =>{
    await Campground.deleteMany({});
    for(let camp of camps){
        const newCamp = new Campground(camp);
        await newCamp.save()
        // console.log(camp)
    }
    console.log("seeding done");
}
seeding()
