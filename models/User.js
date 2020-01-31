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
    type: Boolean,
    default: true
  },
  emailNotificationAllowed: {
    type: Boolean,
    default: true
  },
  subscribeToNewsletter: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('user', UserSchema);
