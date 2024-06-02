const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const router = express.Router();
const users = require('../controllers/users');


const catchAsync = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
};

router.get('/register', users.renderRegisterForm);

router.post('/register', catchAsync(users.register));

router.get('/login', users.renderLoginForm);


// --> not working.. reason : "don't know"
// router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res, next) => {
//     req.flash('errorMessage', 'Invalid username or password');
//     return res.redirect('/campgrounds');
//     // res.send("louda");
// })

//==> working..
router.post('/login', users.login);

// router.get('/logout', (req, res) => {
//     req.logout();
//     req.flash('successMessage', 'Successfully logged out');
//     res.redirect('/campgrounds');
// });


module.exports = router;