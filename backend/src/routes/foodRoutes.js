const express = require('express');
const router = express.Router();
const { searchFoods, getFoodById, getFoodsByCategory, getRecentSearches, getCategories } = require('../controllers/foodController');
const { protect } = require('../middleware/auth');

router.get('/search', protect, searchFoods);
router.get('/categories', getCategories);
router.get('/recent', protect, getRecentSearches);
router.get('/category/:category', getFoodsByCategory);
router.get('/:id', protect, getFoodById);

module.exports = router;
