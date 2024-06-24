const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');// const {camps} = require("./dataset")
mongoose.connect("mongodb://127.0.0.1:27017/yelpcamp")
    .then(() => console.log("Connected to the database"))
    .catch(() => console.log("Error connecting to the db"))

// const seeding = async() =>{
//     await Campground.deleteMany({});
//     for(let camp of camps){
//         const newCamp = new Campground(camp);
//         await newCamp.save()
//         // console.log(camp)
//     }
//     console.log("seeding done");
// }
// seeding()

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //YOUR USER ID
            author: '666bdc543c02a8edf5e9cf32',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/ddqlbimns/image/upload/v1719036540/YelpCamp/onb2ibwakncjw2ibl87t.jpg',
                    filename: 'YelpCamp/onb2ibwakncjw2ibl87t',
                },
                {
                    url: 'https://res.cloudinary.com/ddqlbimns/image/upload/v1719036540/YelpCamp/gmtvodldlc1eu3dhra4k.jpg',
                    filename: 'YelpCamp/gmtvodldlc1eu3dhra4k',
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
