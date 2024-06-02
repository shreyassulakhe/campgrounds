const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.addReview = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    //--> review.author = req.user._id;

    // console.log("review : ", review);
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    // res.send("hitting the route");
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('successMessage', "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
}

module.exports.getAllReviews = async (req, res, next) => {
    const reviews = await Review.find({});
    res.send(reviews);
};

