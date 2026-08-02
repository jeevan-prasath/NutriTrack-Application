const mongoose = require('mongoose');

const recentSearchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    searchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

recentSearchSchema.index({ user: 1, food: 1 }, { unique: true });
recentSearchSchema.index({ user: 1, searchedAt: -1 });

module.exports = mongoose.model('RecentSearch', recentSearchSchema);
