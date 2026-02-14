const express = require('express');
const router = express.Router();
const infraController = require('../controllers/infraController');

// View
router.get('/rooms', infraController.renderInfraDashboard);

// API endpoints
router.get('/api/rooms', infraController.getRooms);
router.get('/api/filter-options', infraController.getFilterOptions);
router.get('/api/statistics', infraController.getStatistics);

module.exports = router;
