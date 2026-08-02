const WeightLog = require('../models/WeightLog');

// @desc  Log weight
// @route POST /api/weight
const logWeight = async (req, res, next) => {
  try {
    const { date, weight, bodyFat, notes } = req.body;

    const log = await WeightLog.findOneAndUpdate(
      { user: req.user._id, date },
      { weight, bodyFat, notes },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

// @desc  Get weight logs
// @route GET /api/weight?period=month
const getWeightLogs = async (req, res, next) => {
  try {
    const { period = 'month', start, end } = req.query;
    let filter = { user: req.user._id };

    if (start && end) {
      filter.date = { $gte: start, $lte: end };
    } else {
      const now = new Date();
      let fromDate;
      if (period === 'week') fromDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      else if (period === 'month') fromDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      else if (period === 'year') fromDate = new Date(now - 365 * 24 * 60 * 60 * 1000);

      if (fromDate) {
        filter.date = { $gte: fromDate.toISOString().split('T')[0] };
      }
    }

    const logs = await WeightLog.find(filter).sort({ date: 1 }).lean();
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete weight log
// @route DELETE /api/weight/:id
const deleteWeightLog = async (req, res, next) => {
  try {
    await WeightLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Weight log deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { logWeight, getWeightLogs, deleteWeightLog };
