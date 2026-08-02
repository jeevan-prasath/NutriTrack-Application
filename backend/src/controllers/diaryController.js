const DiaryEntry = require('../models/DiaryEntry');
const Food = require('../models/Food');

// Helper: calculate nutrition from food + grams
const calculateNutrition = (foodNutrients, grams) => {
  const factor = grams / 100;
  const result = {};
  Object.keys(foodNutrients).forEach((key) => {
    result[key] = +((foodNutrients[key] || 0) * factor).toFixed(2);
  });
  return result;
};

// @desc  Get diary for a date
// @route GET /api/diary/:date
const getDiaryByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    let diary = await DiaryEntry.findOne({ user: req.user._id, date })
      .populate('meals.breakfast.food', 'name nameLocal nutrients servingSize commonServings')
      .populate('meals.lunch.food', 'name nameLocal nutrients servingSize commonServings')
      .populate('meals.dinner.food', 'name nameLocal nutrients servingSize commonServings')
      .populate('meals.snacks.food', 'name nameLocal nutrients servingSize commonServings');

    if (!diary) {
      // Return empty diary structure
      return res.json({
        success: true,
        data: {
          user: req.user._id,
          date,
          meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
          water: 0,
          totals: {},
          notes: '',
        },
      });
    }

    res.json({ success: true, data: diary });
  } catch (error) {
    next(error);
  }
};

// @desc  Add food to diary
// @route POST /api/diary/:date/meals
const addMealEntry = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { foodId, grams, mealType, servingLabel } = req.body;

    if (!foodId || !grams || !mealType) {
      return res.status(400).json({ success: false, message: 'foodId, grams, and mealType are required' });
    }

    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });

    const nutrition = calculateNutrition(food.nutrients.toObject(), grams);

    const entry = {
      food: food._id,
      foodSnapshot: { name: food.name, nutrients: food.nutrients.toObject() },
      grams,
      servingLabel,
      mealType,
      nutrition,
    };

    let diary = await DiaryEntry.findOne({ user: req.user._id, date });

    if (!diary) {
      diary = new DiaryEntry({
        user: req.user._id,
        date,
        meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
      });
    }

    diary.meals[mealType].push(entry);
    await diary.save();

    // Repopulate
    await diary.populate([
      { path: 'meals.breakfast.food', select: 'name nameLocal nutrients servingSize commonServings' },
      { path: 'meals.lunch.food', select: 'name nameLocal nutrients servingSize commonServings' },
      { path: 'meals.dinner.food', select: 'name nameLocal nutrients servingSize commonServings' },
      { path: 'meals.snacks.food', select: 'name nameLocal nutrients servingSize commonServings' },
    ]);

    res.status(201).json({ success: true, message: 'Food added to diary', data: diary });
  } catch (error) {
    next(error);
  }
};

// @desc  Update meal entry
// @route PUT /api/diary/:date/meals/:mealType/:entryId
const updateMealEntry = async (req, res, next) => {
  try {
    const { date, mealType, entryId } = req.params;
    const { grams, servingLabel } = req.body;

    const diary = await DiaryEntry.findOne({ user: req.user._id, date });
    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });

    const entry = diary.meals[mealType].id(entryId);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    if (grams) {
      entry.grams = grams;
      const nutrition = calculateNutrition(entry.foodSnapshot.nutrients, grams);
      entry.nutrition = nutrition;
    }
    if (servingLabel) entry.servingLabel = servingLabel;

    await diary.save();
    res.json({ success: true, message: 'Entry updated', data: diary });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete meal entry
// @route DELETE /api/diary/:date/meals/:mealType/:entryId
const deleteMealEntry = async (req, res, next) => {
  try {
    const { date, mealType, entryId } = req.params;
    const diary = await DiaryEntry.findOne({ user: req.user._id, date });
    if (!diary) return res.status(404).json({ success: false, message: 'Diary not found' });

    diary.meals[mealType] = diary.meals[mealType].filter(
      (e) => e._id.toString() !== entryId
    );

    await diary.save();
    res.json({ success: true, message: 'Entry deleted', data: diary });
  } catch (error) {
    next(error);
  }
};

// @desc  Update water intake
// @route PUT /api/diary/:date/water
const updateWater = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { water } = req.body;

    let diary = await DiaryEntry.findOne({ user: req.user._id, date });
    if (!diary) {
      diary = new DiaryEntry({
        user: req.user._id,
        date,
        meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
        water: 0,
      });
    }

    diary.water = water;
    await diary.save();
    res.json({ success: true, data: diary });
  } catch (error) {
    next(error);
  }
};

// @desc  Get diary dates (for calendar)
// @route GET /api/diary/dates?month=2026-08
const getDiaryDates = async (req, res, next) => {
  try {
    const { month } = req.query; // YYYY-MM
    let filter = { user: req.user._id };

    if (month) {
      filter.date = { $regex: `^${month}` };
    }

    const entries = await DiaryEntry.find(filter)
      .select('date totals.calories water')
      .sort({ date: -1 })
      .lean();

    res.json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

// @desc  Get diary range for reports
// @route GET /api/diary/range?start=2026-07-01&end=2026-08-01
const getDiaryRange = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const entries = await DiaryEntry.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    })
      .select('date totals water')
      .sort({ date: 1 })
      .lean();

    res.json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiaryByDate,
  addMealEntry,
  updateMealEntry,
  deleteMealEntry,
  updateWater,
  getDiaryDates,
  getDiaryRange,
};
