const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// Views
router.get('/classrooms', resourceController.renderClassrooms);
router.get('/unscheduled', resourceController.renderUnscheduled);

// API endpoints
router.get('/api/classrooms', resourceController.getClassrooms);
router.get('/api/classroom-schedule', resourceController.getClassroomSchedule);
router.get('/api/unscheduled', resourceController.getUnscheduled);

module.exports = router;
