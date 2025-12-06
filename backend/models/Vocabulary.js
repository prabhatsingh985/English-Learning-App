const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  word: { type: String, required: true },
  meaning: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vocabulary', vocabularySchema);
