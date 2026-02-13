// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
}

// Middleware to inject user data into all views
function injectUser(req, res, next) {
  res.locals.user = req.user || null;
  next();
}

module.exports = { ensureAuthenticated, injectUser };
