const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      const user = {
        googleId: profile.id,
        displayName: profile.displayName,
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        email: profile.emails?.[0]?.value || '',
        photo: profile.photos?.[0]?.value || '',
      };
      return done(null, user);
    }
  ));
  console.log('✅ Google OAuth strategy configured');
} else {
  console.warn('⚠️  GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing in .env');
  console.warn('   Google Sign-In will not work until you add them.');
  console.warn('   Get credentials from: https://console.cloud.google.com/apis/credentials');
}

module.exports = passport;
