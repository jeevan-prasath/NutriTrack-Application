const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getFavorites);
router.post('/', addFavorite);
router.get('/:foodId/check', checkFavorite);
router.delete('/:foodId', removeFavorite);

module.exports = router;
