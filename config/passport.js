const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Allowed email domains - only these can sign in
const ALLOWED_DOMAINS = [
  'isdi.in',
  'atlasuniversity.edu.in'
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value || '';
      const domain = email.split('@')[1]?.toLowerCase();

      // Check if user's email domain is allowed
      if (!ALLOWED_DOMAINS.includes(domain)) {
        return done(null, false, { message: 'Access denied. Your email domain is not authorized.' });
      }

      const user = {
        googleId: profile.id,
        displayName: profile.displayName,
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        email: email,
        photo: profile.photos?.[0]?.value || '',
      };
      return done(null, user);
    }
  ));
  console.log('✅ Google OAuth strategy configured');
  console.log('   Allowed domains:', ALLOWED_DOMAINS.join(', '));
} else {
  console.warn('⚠️  GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing in .env');
  console.warn('   Google Sign-In will not work until you add them.');
  console.warn('   Get credentials from: https://console.cloud.google.com/apis/credentials');
}

module.exports = passport;
