const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

// Login page
router.get('/login', (req, res) => {
  // If already logged in, redirect to home
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('login');
});

// Google OAuth - start
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth - callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/login?error=access_denied'
  }),
  (req, res) => {
    // Successful authentication
    res.redirect('/');
  }
);

// Access denied page
router.get('/denied', (req, res) => {
  res.render('denied');
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  });
});

module.exports = router;
