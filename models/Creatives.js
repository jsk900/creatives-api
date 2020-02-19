const mongoose = require('mongoose');

const CreativesSchema = new mongoose.Schema({
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
  city: {
    type: String,
    required: true
  },
  website: {
    type: String
  },
  category: {
    type: [String],
    required: true
  },
  social: {
    deviantArt: {
      type: String
    },
    flickr: {
      type: String
    },
    pinterest: {
      type: String
    },
    instagram: {
      type: String
    },
    behance: {
      type: String
    },
    vimeo: {
      type: String
    }
  },
  services: {
    type: Boolean
  },
  creative: {
    type: String,
    default: 'true'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Creatives = mongoose.model('creatives', CreativesSchema);
