const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      index: true,
    },
    nameLocal: { type: String, trim: true }, // Local language name (Tamil etc)
    brand: { type: String, trim: true },
    category: {
      type: String,
      enum: [
        'breakfast', 'lunch', 'dinner', 'snacks', 'drinks',
        'protein', 'fruits', 'vegetables', 'grains', 'dairy',
        'sweets', 'spices', 'oils', 'other',
      ],
      default: 'other',
    },
    cuisine: {
      type: String,
      enum: ['south_indian', 'north_indian', 'indian', 'global'],
      default: 'south_indian',
    },
    servingSize: { type: Number, default: 100 }, // grams
    servingUnit: { type: String, default: 'g' },
    commonServings: [
      {
        label: String, // e.g., "1 piece", "1 cup"
        grams: Number,
      },
    ],
    // Macronutrients per 100g
    nutrients: {
      calories: { type: Number, required: true, min: 0 },
      protein: { type: Number, default: 0 },
      completeProtein: { type: Number, default: 0 },
      incompleteProtein: { type: Number, default: 0 },
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
      // Vitamins (mcg or mg)
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
      // Minerals (mg)
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
    isVerified: { type: Boolean, default: false },
    isUserAdded: { type: Boolean, default: false },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [String],
    imageUrl: String,
  },
  { timestamps: true }
);

// Text index for search
foodSchema.index({ name: 'text', nameLocal: 'text', brand: 'text', tags: 'text' });
foodSchema.index({ category: 1 });
foodSchema.index({ cuisine: 1 });

module.exports = mongoose.model('Food', foodSchema);
