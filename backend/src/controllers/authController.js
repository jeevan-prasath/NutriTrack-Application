const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc  Register user
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        settings: user.settings,
        customTargets: user.customTargets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        settings: user.settings,
        customTargets: user.customTargets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  const user = req.user;
  const targets = user.getRecommendedTargets();

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      settings: user.settings,
      customTargets: user.customTargets,
      bmi: user.getBMI(),
      bmr: user.getBMR(),
      tdee: user.getTDEE(),
      recommendedTargets: targets,
    },
  });
};

// @desc  Update user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, profile, settings, customTargets } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (profile) user.profile = { ...user.profile.toObject?.() || user.profile, ...profile };
    if (settings) user.settings = { ...user.settings.toObject?.() || user.settings, ...settings };
    if (customTargets !== undefined) user.customTargets = customTargets;

    await user.save();

    const targets = user.getRecommendedTargets();

    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        settings: user.settings,
        customTargets: user.customTargets,
        bmi: user.getBMI(),
        bmr: user.getBMR(),
        tdee: user.getTDEE(),
        recommendedTargets: targets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Change password
// @route PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
