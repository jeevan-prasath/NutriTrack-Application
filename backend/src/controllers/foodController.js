const Food = require('../models/Food');
const RecentSearch = require('../models/RecentSearch');

const buildFuzzyRegex = (q) => {
  // Allow 1 fuzzy character between each letter to tolerate typos and minor misspellings
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fuzzy = escaped.split('').join('.{0,1}');
  return new RegExp(fuzzy, 'i');
};

// @desc  Search foods
// @route GET /api/foods/search?q=idli&category=breakfast&limit=20
const searchFoods = async (req, res, next) => {
  try {
    const { q, category, cuisine, limit = 25, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (q) {
      const fuzzyRx = buildFuzzyRegex(q);
      query.$or = [
        { name: { $regex: q, $options: 'i' } },          // exact prefix first
        { nameLocal: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { name: { $regex: fuzzyRx } },                    // fuzzy fallback
        { nameLocal: { $regex: fuzzyRx } },
      ];
    }

    if (category) query.category = category;
    if (cuisine) query.cuisine = cuisine;

    const [foods, total] = await Promise.all([
      Food.find(query)
        .select('name nameLocal category cuisine nutrients.calories nutrients.protein nutrients.carbs nutrients.fat servingSize commonServings')
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      Food.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: foods,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get food by ID
// @route GET /api/foods/:id
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });

    // Track recent search
    if (req.user) {
      await RecentSearch.findOneAndUpdate(
        { user: req.user._id, food: food._id },
        { searchedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, data: food });
  } catch (error) {
    next(error);
  }
};

// @desc  Get foods by category
// @route GET /api/foods/category/:category
const getFoodsByCategory = async (req, res, next) => {
  try {
    const foods = await Food.find({ category: req.params.category })
      .select('name nameLocal category cuisine nutrients.calories nutrients.protein nutrients.carbs nutrients.fat servingSize commonServings')
      .lean();

    res.json({ success: true, data: foods });
  } catch (error) {
    next(error);
  }
};

// @desc  Get user's recent searches
// @route GET /api/foods/recent
const getRecentSearches = async (req, res, next) => {
  try {
    const recent = await RecentSearch.find({ user: req.user._id })
      .sort({ searchedAt: -1 })
      .limit(10)
      .populate('food', 'name nameLocal category nutrients.calories nutrients.protein nutrients.carbs nutrients.fat servingSize')
      .lean();

    res.json({ success: true, data: recent.map((r) => r.food).filter(Boolean) });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all categories
// @route GET /api/foods/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Food.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchFoods, getFoodById, getFoodsByCategory, getRecentSearches, getCategories };
