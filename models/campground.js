const mongoose = require('mongoose');
// const { campgroundSchema } = require('../schemas/schema');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    imageName: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    location: String,
    price: Number,
    image: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

CampgroundSchema.virtual('properties.popUpText').get(function () {
    return `<strong> <a href="/campgrounds/${this._id}"> ${this.title} </a> </strong>`
});

const Campground = mongoose.model('Campground', CampgroundSchema);
module.exports = Campground;