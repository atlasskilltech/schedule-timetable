const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

// Views
router.get('/by-division', timetableController.renderByDivision);
router.get('/by-faculty', timetableController.renderByFaculty);
router.get('/by-day', timetableController.renderByDay);

// API endpoints
router.get('/api/by-division', timetableController.getByDivision);
router.get('/api/division-details', timetableController.getDivisionDetails);
router.get('/api/by-faculty', timetableController.getByFaculty);
router.get('/api/faculty-details', timetableController.getFacultyDetails);
router.get('/api/by-day', timetableController.getByDay);
router.get('/api/day-details', timetableController.getDayDetails);

module.exports = router;
