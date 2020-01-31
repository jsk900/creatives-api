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
  country: {
    type: String,
    required: true
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
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    },
    flickr: {
      type: String
    },
    deviantArt: {
      type: String
    },
    pinterest: {
      type: String
    }
  },
  services: {
    type: Boolean
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Creatives = mongoose.model('creatives', CreativesSchema);
