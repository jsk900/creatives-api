const mongoose = require('mongoose');

const WorksSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },

  fileCategory: {
    type: String,
    required: true
  },
  fileTitle: {
    type: String,
    required: true
  },
  fileDescription: {
    type: String,
    required: true
  },
  creationDate: {
    type: Date,
    required: true
  },
  tags: {
    type: [String],
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  thumbnailPath: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Works = mongoose.model('works', WorksSchema);
