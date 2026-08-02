const express = require('express');
const router = express.Router();
const {
  getDiaryByDate,
  addMealEntry,
  updateMealEntry,
  deleteMealEntry,
  updateWater,
  getDiaryDates,
  getDiaryRange,
} = require('../controllers/diaryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dates', getDiaryDates);
router.get('/range', getDiaryRange);
router.get('/:date', getDiaryByDate);
router.post('/:date/meals', addMealEntry);
router.put('/:date/meals/:mealType/:entryId', updateMealEntry);
router.delete('/:date/meals/:mealType/:entryId', deleteMealEntry);
router.put('/:date/water', updateWater);

module.exports = router;
