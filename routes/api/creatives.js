const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

//Middleware, Authorize user token. Used on Private routes
const auth = require('../../middleware/auth');

//Get the creatives Schema
const Creative = require('../../models/Creatives');

//Get the users Schema
const User = require('../../models/User');

//Get the messages Schema
const Messages = require('../../models/Messages');

//Used to hide stuff in the .env file
require('dotenv').config();

//Create the router handler
const router = express.Router();

//...............................................................................................................................

//@route   POST api/creativeRegister
//@desc    Register creative
//@access  Public

router.post(
  '/creativeRegister',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
    check('city', 'City is required')
      .not()
      .isEmpty(),
    check('category', 'At least one category is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //De-structure body
    const {
      name,
      email,
      emailVisible,
      emailNotificationAllowed,
      subscribeToNewsletter,
      password,
      avatar,
      city,
      website,
      category,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
      flickr,
      deviantArt,
      pinterest,
      services
    } = req.body;

    //Check if email already exists as a user or as a creative
    try {
      let creative = await Creative.findOne({ email });
      if (creative) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Email already registered' }] });
      }

      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Email already registered' }] });
      }

      //Create the creative object
      creative = new Creative({
        name,
        email,
        emailVisible,
        emailNotificationAllowed,
        subscribeToNewsletter,
        password,
        avatar,
        city,
        website,
        category,
        youtube,
        twitter,
        facebook,
        linkedin,
        instagram,
        flickr,
        deviantArt,
        pinterest,
        services,
        creative: 'true'
      });

      //Encrypt the password
      const salt = await bcrypt.genSalt(10);
      creative.password = await bcrypt.hash(password, salt);

      //Check that there is at least one category entered
      if (category.length <= 0) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Please select at least one category' }] });
      }

      //Build social object
      creative.social = {};
      creative.social.youtube = youtube;
      creative.social.facebook = facebook;
      creative.social.twitter = twitter;
      creative.social.instagram = instagram;
      creative.social.linkedin = linkedin;
      creative.social.flickr = flickr;
      creative.social.deviantArt = deviantArt;
      creative.social.pinterest = pinterest;

      //Save user to the Database
      await creative.save();

      //Add certain saved fields to the token payload for use on the front end.
      const payload = {
        user: {
          id: creative.id
        }
      };

      //Create the token and return to the frontend.
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token, creative });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//.................................................................................................................

//@route   GET api/getCreativeDetails
//@desc    Get details of logged in creative
//@access  Private

router.get('/getCreativeDetails', auth, async (req, res) => {
  try {
    const creative = await Creative.findOne({
      _id: req.user.id
    }).select('-password');
    res.json(creative);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//..................................................................................................................

//@route   GET api/creative/:creative_id
//@desc    Get creative by creative id
//@access  Public

router.get('/creative/:creative_id', async (req, res) => {
  try {
    const creative = await Creative.findById(req.params.creative_id).select(
      '-password'
    );

    if (!creative) return res.status(404).json({ msg: 'Creative not found' });

    //All good return creative details to frontend
    res.json(creative);
  } catch (err) {
    console.error(err.message);

    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Creative not found' });
    }
    res.status(500).send('Server error');
  }
});

//.........................................................................................................................

//@route   PUT api/creativeUpdate/
//@desc    Put Update Creative
//@access  Private

router.put(
  '/creativeUpdate',
  [
    auth,
    [
      check('name', 'Name is required')
        .not()
        .isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check(
        'password',
        'Please enter a password with 6 or more characters'
      ).isLength({ min: 6 }),
      check('city', 'City is required')
        .not()
        .isEmpty(),
      check('category', 'At least one category is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //De-structure body
    let {
      name,
      email,
      emailVisible,
      emailNotificationAllowed,
      subscribeToNewsletter,
      password,
      avatar,
      city,
      website,
      category,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
      flickr,
      deviantArt,
      pinterest,
      services
    } = req.body;

    try {
      const creative = await Creative.findById(req.user.id);

      if (creative) {
        //Re-encrypt password
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        //Check if avatar has changed
        if (avatar !== creative.avatar) {
          //At this point we need to remove the old avatar from cloudinary
        }

        //Check if the email has changed
        //Check if email already exists as a user or as a creative
        if (creative.email !== email) {
          let emailFound = await Creative.findOne({ email });
          if (emailFound) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'Email already exists' }] });
          }

          emailFound = await User.findOne({ email });
          if (emailFound) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'Email already exists as a User' }] });
          }
        }

        //Check that there is at least one category entered
        if (category.length <= 0) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Please select at least one category' }] });
        }

        //Category is an array of strings so we need to trim.
        if (category.length > 1) {
          creative.category = category.split(',').map(cat => cat.trim());
        }

        //Build social object
        creative.social = {};
        creative.social.youtube = youtube;
        creative.social.facebook = facebook;
        creative.social.twitter = twitter;
        creative.social.instagram = instagram;
        creative.social.linkedin = linkedin;
        creative.social.flickr = flickr;
        creative.social.deviantArt = deviantArt;
        creative.social.pinterest = pinterest;

        //Create update object
        let creativeUpdate = {
          name,
          email,
          emailVisible,
          emailNotificationAllowed,
          subscribeToNewsletter,
          password,
          avatar,
          city,
          website,
          category,
          youtube,
          twitter,
          facebook,
          linkedin,
          instagram,
          flickr,
          deviantArt,
          pinterest,
          services,
          creative: 'true'
        };

        //update
        await Creative.findOneAndUpdate(
          { _id: creative.id },
          { $set: creativeUpdate },
          { new: true }
        );

        return res.json(creativeUpdate);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//..............................................................................................................

//@route   DELETE api/deleteCreative
//@desc    Delete creative and messages
//@access  Private

router.delete('/deleteCreative', auth, async (req, res) => {
  try {
    //Here we need to get all the images associated with the creative
    //and delete from cloudinary.

    //Remove Creative
    const creative = await Creative.findOneAndDelete({ _id: req.user.id });

    //Remove Messages
    await Messages.deleteMany({ sendingUser: req.user.id });

    res.json({
      msg: `Creative ${creative.name} and related information have been deleted`
    });
  } catch (err) {
    console.error(err.message);

    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Creative not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
