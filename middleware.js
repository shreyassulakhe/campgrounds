module.exports.isLoggedIn = (req, res, next) =>  {
    if (!req.isAuthenticated()) {
        req.flash('errorMessage', 'you must be logged in');
        return res.redirect('/login');
    }
    next();
}