const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  emailVisible: {
    type: Boolean
  },
  emailNotificationAllowed: {
    type: Boolean
  },
  subscribeToNewsletter: {
    type: Boolean
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  creative: {
    type: String,
    default: 'false'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('user', UserSchema);
