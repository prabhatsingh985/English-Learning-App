const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, default: 'Easy' }
});

module.exports = mongoose.model('Topic', topicSchema);
