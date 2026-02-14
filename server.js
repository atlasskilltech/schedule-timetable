const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const passport = require('./config/passport');
const { ensureAuthenticated, injectUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'atlas-timetable-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Inject user data into all views
app.use(injectUser);

// --- Auth routes (public — no login required) ---
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// --- Protected routes (require Google login) ---
const dashboardRoutes = require('./routes/dashboard');
const timetableRoutes = require('./routes/timetable');
const resourceRoutes = require('./routes/resources');
const infraRoutes = require('./routes/infra');
const studentPageRoutes = require('./routes/studentPages');
const studentApiRoutes = require('./routes/studentApi');

app.use('/', ensureAuthenticated, dashboardRoutes);
app.use('/timetable', ensureAuthenticated, timetableRoutes);
app.use('/resources', ensureAuthenticated, resourceRoutes);
app.use('/infra', ensureAuthenticated, infraRoutes);
app.use('/student-count', ensureAuthenticated, studentPageRoutes);
app.use('/api', ensureAuthenticated, studentApiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
