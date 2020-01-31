const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
  languageCode: {
    type: String,
    required: true
  },
  languageName: {
    type: String,
    required: true
  },
  component: {
    type: String,
    required: true
  },
  element: {
    type: String,
    required: true
  },
  elementText: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Language = mongoose.model('language', LanguageSchema);
