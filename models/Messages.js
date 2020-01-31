const mongoose = require('mongoose');

const MessagesSchema = new mongoose.Schema({
  sendingUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  receivingUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  messageTitle: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Messages = mongoose.model('messages', MessagesSchema);
