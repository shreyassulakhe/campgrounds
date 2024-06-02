const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegisterForm = (req, res) => {
    res.render('user/register');
};

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        return res.redirect('/campgrounds');
    } catch (e) {
        req.flash('errorMessage', 'Username already exists!!');
        res.redirect('/register');
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render('user/login');
};

module.exports.login = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (!user || err) {
            req.flash('errorMessage', 'Invalid username or password');
            return res.redirect('/login');
        }
        res.redirect('/campgrounds');
    })(req, res, next);
};