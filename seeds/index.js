const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelper');

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((err) => {
        console.log("Error in connting to mongodb ", err);
    });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const rnd = Math.floor(Math.random() * cities.length);
        const city = cities[rnd];
        const price = Math.floor(Math.random() * 20) + 10;
        const newCamp = new Campground({
            author: '664f998864558bc1cd9552ac',
            title: `${sample(descriptors)}, ${sample(places)}`,
            location: `${city.city} , ${city.state}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur eveniet, quasi numquam aspernatur sunt expedita? Nam impedit rerum soluta debitis explicabo placeat numquam voluptatibus?",
            img: "https://source.unsplash.com/collection/483251",
            price,
            geometry: {
                type: "Point",
                coordinates: [city.longitude, city.latitude]
            }
        });
        await newCamp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
// seedDB();
