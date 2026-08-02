const express = require('express');
const router = express.Router();
const { logWeight, getWeightLogs, deleteWeightLog } = require('../controllers/weightController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', logWeight);
router.get('/', getWeightLogs);
router.delete('/:id', deleteWeightLog);

module.exports = router;
