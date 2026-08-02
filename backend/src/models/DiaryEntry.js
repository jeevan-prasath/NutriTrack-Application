const mongoose = require('mongoose');

const mealEntrySchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    foodSnapshot: {
      name: String,
      nutrients: mongoose.Schema.Types.Mixed,
    },
    grams: { type: Number, required: true, min: 0.1 },
    servingLabel: String,
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
      required: true,
    },
    // Calculated nutrition for this entry
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      netCarbs: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      saturatedFat: { type: Number, default: 0 },
      monounsaturatedFat: { type: Number, default: 0 },
      polyunsaturatedFat: { type: Number, default: 0 },
      transFat: { type: Number, default: 0 },
      omega3: { type: Number, default: 0 },
      omega6: { type: Number, default: 0 },
      cholesterol: { type: Number, default: 0 },
      water: { type: Number, default: 0 },
      vitaminA: { type: Number, default: 0 },
      vitaminB1: { type: Number, default: 0 },
      vitaminB2: { type: Number, default: 0 },
      vitaminB3: { type: Number, default: 0 },
      vitaminB5: { type: Number, default: 0 },
      vitaminB6: { type: Number, default: 0 },
      vitaminB7: { type: Number, default: 0 },
      vitaminB9: { type: Number, default: 0 },
      vitaminB12: { type: Number, default: 0 },
      vitaminC: { type: Number, default: 0 },
      vitaminD: { type: Number, default: 0 },
      vitaminE: { type: Number, default: 0 },
      vitaminK: { type: Number, default: 0 },
      calcium: { type: Number, default: 0 },
      iron: { type: Number, default: 0 },
      magnesium: { type: Number, default: 0 },
      phosphorus: { type: Number, default: 0 },
      potassium: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
      zinc: { type: Number, default: 0 },
      copper: { type: Number, default: 0 },
      manganese: { type: Number, default: 0 },
      selenium: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const diarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: {
      type: String, // YYYY-MM-DD format
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    meals: {
      breakfast: [mealEntrySchema],
      lunch: [mealEntrySchema],
      dinner: [mealEntrySchema],
      snacks: [mealEntrySchema],
    },
    water: { type: Number, default: 0 }, // ml
    notes: { type: String, maxlength: 1000 },
    // Daily totals (computed)
    totals: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      netCarbs: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      saturatedFat: { type: Number, default: 0 },
      monounsaturatedFat: { type: Number, default: 0 },
      polyunsaturatedFat: { type: Number, default: 0 },
      transFat: { type: Number, default: 0 },
      omega3: { type: Number, default: 0 },
      omega6: { type: Number, default: 0 },
      cholesterol: { type: Number, default: 0 },
      vitaminA: { type: Number, default: 0 },
      vitaminB1: { type: Number, default: 0 },
      vitaminB2: { type: Number, default: 0 },
      vitaminB3: { type: Number, default: 0 },
      vitaminB5: { type: Number, default: 0 },
      vitaminB6: { type: Number, default: 0 },
      vitaminB7: { type: Number, default: 0 },
      vitaminB9: { type: Number, default: 0 },
      vitaminB12: { type: Number, default: 0 },
      vitaminC: { type: Number, default: 0 },
      vitaminD: { type: Number, default: 0 },
      vitaminE: { type: Number, default: 0 },
      vitaminK: { type: Number, default: 0 },
      calcium: { type: Number, default: 0 },
      iron: { type: Number, default: 0 },
      magnesium: { type: Number, default: 0 },
      phosphorus: { type: Number, default: 0 },
      potassium: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
      zinc: { type: Number, default: 0 },
      copper: { type: Number, default: 0 },
      manganese: { type: Number, default: 0 },
      selenium: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Compute totals before saving
diarySchema.methods.computeTotals = function () {
  const allEntries = [
    ...this.meals.breakfast,
    ...this.meals.lunch,
    ...this.meals.dinner,
    ...this.meals.snacks,
  ];

  const totals = {};
  allEntries.forEach((entry) => {
    Object.keys(entry.nutrition).forEach((key) => {
      totals[key] = (totals[key] || 0) + (entry.nutrition[key] || 0);
    });
  });

  // Round all values to 1 decimal
  Object.keys(totals).forEach((k) => {
    totals[k] = +totals[k].toFixed(1);
  });

  this.totals = totals;
};

diarySchema.pre('save', function () {
  this.computeTotals();
});

diarySchema.index({ user: 1, date: 1 }, { unique: true });
diarySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('DiaryEntry', diarySchema);
