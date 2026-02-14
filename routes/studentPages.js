const express = require('express');
const router = express.Router();

// Student Dashboard - drill-down by school/program/cohort/class
router.get('/', (req, res) => {
  res.render('student-dashboard', { active: 'student-dashboard' });
});

// Student Roster - view students in a class
router.get('/students', (req, res) => {
  res.render('students', { active: 'student-dashboard' });
});

// Student Search - global search
router.get('/search', (req, res) => {
  res.render('student-search', { active: 'student-search' });
});

// Student Divisions - filter-based drill-down
router.get('/divisions', (req, res) => {
  res.render('student-divisions', { active: 'student-divisions' });
});

module.exports = router;
