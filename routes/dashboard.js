const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

const cors = require("cors");

router.use(cors({
  origin: "http://localhost:5173"
}));
router.get('/', (req, res) => {
  res.render('start');
});
router.get('/dashboard', dashboardController.renderDashboard);
router.get('/api/dashboard/stats', dashboardController.getDashboardStats);
router.get('/api/dashboard/timetable', dashboardController.getTimetableData);
router.get('/api/dashboard/filters', dashboardController.getFilterOptions);

module.exports = router;
