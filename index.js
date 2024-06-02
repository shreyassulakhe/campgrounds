if (process.env.NODE_ENV !== "production") {
    // --> check the current mode is not in production mode;
    // --> current mode is development mode; 
    require('dotenv').config();
}
// require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas/schema');
const methodOverride = require('method-override');
const Joi = require('joi');
const flash = require('connect-flash');
const passport = require('passport');
const User = require('./models/user');
const localStrategy = require('passport-local');
const reviews = require('./controllers/reviews');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const campgroundRoutes = require('./routers/campgrounds');
const userRoutes = require('./routers/user');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

const session = require('express-session');
const MongoStore = require('connect-mongo');

// const dbUrl = process.env.DB_URL;
const dbUrl = 'mongodb://127.0.0.1:27017/yelpcamp';

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Connected to mongoDB");
    })
    .catch(() => {
        console.log("Failed to connect mongoDB");
    });

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret: 'thisissecret',
    touchAfter: 24 * 3600// update the session in sec.
})

// let store = new MongoStore({
//     mongoUrl: dbUrl,
//     collection: "sessions"
// });


const sessionConfig = {
    store: store,
    secret: "thisissecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        // httpOnly --> used to enhance security;
        expire: Date.now() + (7 * 24 * 60 * 60 * 1000),
        maxAge: (7 * 24 * 60 * 60 * 1000)
    }
}
app.use(session(sessionConfig));
app.use(flash());

// --> PASSPORT;
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.query);
    res.locals.successMessage = req.flash('successMessage');
    res.locals.errorMessage = req.flash('errorMessage');
    next();
})


app.use('/campgrounds', campgroundRoutes);
app.use('/', userRoutes);

// --> the below function is used to catch error, this is used to replace try{}catch(e);
const catchAsync = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    // console.log(error);  
    if (error) {
        // details is not a map/object, it's a array with multiple error messages, 
        // in such case join all error messages, with a comma seperated;
        const msg = error.details.map(el => el.message).join(',');
        throw new Error(msg);
    } else next();
};

app.get('/reviews', reviews.getAllReviews);
app.post('/campgrounds/:id/newReview', validateReview, catchAsync(reviews.addReview));
app.delete('/campgrounds/:id/:reviewId', catchAsync(reviews.deleteReview));

app.use((err, req, res, next) => {
    console.log("error!!!!!!!!!!");
    const { status = 401, message = "404 page not found loude" } = err;
    console.log("error : ", err);
    res.status(status).render('error', { err });
    // res.send("404!!");
});

app.use('*', (req, res, next) => {
    // console.log("i am not hitting this route");
    const err = "404 Page not found!!";
    res.status(404).render('error', { err });
})

app.listen('3000', () => {
    console.log("Listing on localhost:3000");
});



