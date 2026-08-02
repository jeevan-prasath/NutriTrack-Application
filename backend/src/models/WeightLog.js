const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    weight: { type: Number, required: true, min: 10, max: 500 }, // kg
    bodyFat: { type: Number, min: 1, max: 60 }, // percentage (optional)
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

weightLogSchema.index({ user: 1, date: -1 });
weightLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WeightLog', weightLogSchema);
