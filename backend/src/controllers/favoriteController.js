const Favorite = require('../models/Favorite');

// @desc  Get favorites
// @route GET /api/favorites
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('food', 'name nameLocal category nutrients.calories nutrients.protein nutrients.carbs nutrients.fat servingSize commonServings')
      .lean();

    res.json({ success: true, data: favorites.map((f) => f.food).filter(Boolean) });
  } catch (error) {
    next(error);
  }
};

// @desc  Add favorite
// @route POST /api/favorites
const addFavorite = async (req, res, next) => {
  try {
    const { foodId } = req.body;
    await Favorite.findOneAndUpdate(
      { user: req.user._id, food: foodId },
      {},
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    next(error);
  }
};

// @desc  Remove favorite
// @route DELETE /api/favorites/:foodId
const removeFavorite = async (req, res, next) => {
  try {
    await Favorite.findOneAndDelete({ user: req.user._id, food: req.params.foodId });
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

// @desc  Check if food is favorite
// @route GET /api/favorites/:foodId/check
const checkFavorite = async (req, res, next) => {
  try {
    const fav = await Favorite.findOne({ user: req.user._id, food: req.params.foodId });
    res.json({ success: true, isFavorite: !!fav });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite };
