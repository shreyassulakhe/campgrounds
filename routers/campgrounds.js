const express = require('express');
const router = express.Router();
// const passport = require('passport');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas/schema');
const { isLoggedIn } = require('../middleware');
const { storage } = require('../cloudinary/index');
const campgrounds = require('../controllers/campgrounds');

// --> MULTER;
const multer = require('multer')
const upload = multer({ storage })

const catchAsync = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
};

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    // console.log(error);
    if (error) {
        // details is not a map/object, it's a array with multiple error messages,
        // in such case join all error messages, with a comma seperated;
        const msg = error.details.map(el => el.message).join(',');
        throw new Error(msg);
    } else next();
};

router.get('/', campgrounds.index);

router.delete('/:id', catchAsync(campgrounds.deleteCampground));

router.post('/new', upload.array('image'), validateCampground, catchAsync(campgrounds.newCampground));
// router.post('/new', upload.single('image'), (req, res) => {
//     // res.send(req.body);
//     // res.send(req.file);
//     console.log(req.file);
//     res.send("It worked");
// });

router.get('/new', campgrounds.renderNewForm);

router.get('/:id', catchAsync(campgrounds.showCampground));

router.get('/:id/edit', catchAsync(campgrounds.renderEditForm));

router.put('/:id', upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground));

module.exports = router;



