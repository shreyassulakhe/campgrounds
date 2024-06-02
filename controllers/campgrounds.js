const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary/index');

module.exports.index = async (req, res, next) => {
    try {
        const allCamps = await Campground.find({});
        res.render('home', { allCamps });
    } catch (err) {
        next(err);
    }
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const del = await Campground.findByIdAndDelete(id);
    // console.log(del);
    // const allCamps = await Campground.find({});
    // res.render('home', { allCamps });
    req.flash('successMessage', 'Successfully deleted!');
    res.redirect('/campgrounds');
    // res.send("Wait while deleting...");
};

module.exports.newCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();
    const newCamp = new Campground(req.body);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.img = req.files.map(f => ({ url: f.path, imageName: f.filename }));
    await newCamp.save();
    const camp = await Campground.findById(newCamp.id);
    req.flash('successMessage', 'Successfully added new Campground');
    // res.render('show', { camp });
    console.log(newCamp);
    res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.renderNewForm = (req, res, next) => {
    // if (req.isAuthenticated() == false) {
    //     req.flash('errorMessage', 'you must be logged in');
    //     return res.redirect('/login');
    // }
    res.render('new');
}

module.exports.showCampground = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    // console.log(camp);
    if (!camp) {
        req.flash('errorMessage', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    res.render('show', { camp });
};

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    // res.send("Editing...");
    const camp = await Campground.findById(id);
    // console.log(camp);
    if (!camp) {
        req.flash('errorMessage', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    res.render('edit', { camp });
};

module.exports.editCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();
    campground.geometry = geoData.body.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, imageName: f.filename }));
    campground.image.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let imgname of req.body.deleteImages) {
            await cloudinary.uploader.destroy(imgname);
        }
        await campground.updateOne({ $pull: { image: { imageName: { $in: req.body.deleteImages } } } });
    }
    req.flash('successMessage', 'update Successfully!!');
    res.redirect(`/campgrounds/${campground.id}`);
};