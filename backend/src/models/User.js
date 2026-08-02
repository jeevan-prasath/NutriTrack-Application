const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: { type: String, default: null },
    profile: {
      age: { type: Number, min: 1, max: 120 },
      gender: { type: String, enum: ['male', 'female', 'other'] },
      height: { type: Number, min: 50, max: 300 }, // cm
      weight: { type: Number, min: 10, max: 500 }, // kg
      goalWeight: { type: Number, min: 10, max: 500 },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
        default: 'moderately_active',
      },
      goal: {
        type: String,
        enum: ['maintain', 'lose', 'gain', 'recomposition'],
        default: 'maintain',
      },
    },
    customTargets: {
      calories: { type: Number },
      protein: { type: Number },
      carbs: { type: Number },
      fat: { type: Number },
      fiber: { type: Number },
      water: { type: Number },
    },
    settings: {
      darkMode: { type: Boolean, default: false },
      units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
      notifications: { type: Boolean, default: true },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate BMI
userSchema.methods.getBMI = function () {
  const { height, weight } = this.profile;
  if (!height || !weight) return null;
  const heightM = height / 100;
  return +(weight / (heightM * heightM)).toFixed(1);
};

// Calculate BMR (Mifflin-St Jeor)
userSchema.methods.getBMR = function () {
  const { age, gender, height, weight } = this.profile;
  if (!age || !gender || !height || !weight) return null;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? Math.round(base + 5) : Math.round(base - 161);
};

// Calculate TDEE
userSchema.methods.getTDEE = function () {
  const bmr = this.getBMR();
  if (!bmr) return null;
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  return Math.round(bmr * (multipliers[this.profile.activityLevel] || 1.55));
};

// Calculate recommended macros
userSchema.methods.getRecommendedTargets = function () {
  const tdee = this.getTDEE();
  if (!tdee) return null;
  const { goal, weight } = this.profile;

  let calories = tdee;
  if (goal === 'lose') calories = tdee - 500;
  if (goal === 'gain') calories = tdee + 300;

  const protein = Math.round((weight || 70) * 1.8); // 1.8g per kg
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  const fiber = 30;
  const water = Math.round((weight || 70) * 35); // ml

  return { calories, protein, carbs, fat, fiber, water };
};

module.exports = mongoose.model('User', userSchema);
