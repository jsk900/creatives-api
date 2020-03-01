const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

//Middleware, Authorize user token. Used on Private routes
const auth = require('../../middleware/auth');

//Get the users Schema
const User = require('../../models/User');

//Get the creatives Schema
const Creative = require('../../models/Creatives');

//Get the messages Schema
const Messages = require('../../models/Messages');

//Used to hide stuff in the .env file
require('dotenv').config();

//Create the router handler
const router = express.Router();

//...............................................................................................................................

//@route   POST api/userRegister
//@desc    Register User
//@access  Public

router.post(
  '/userRegister',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
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
      avatar
    } = req.body;

    //Check if email already exists as a user or as a creative
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Email already registered' }] });
      }

      let creative = await Creative.findOne({ email });
      if (creative) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Email already registered' }] });
      }

      //Create the user object
      user = new User({
        name,
        email,
        emailVisible,
        emailNotificationAllowed,
        subscribeToNewsletter,
        password,
        avatar,
        creative: 'false'
      });

      //Encrypt the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      //Save user to the Database
      await user.save();

      //Add certain saved fields to the token payload for use on the front end.
      const payload = {
        user: {
          id: user.id
        }
      };

      //Create the token and return to the frontend.
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//.................................................................................................................

//@route   GET api/getUserDetails
//@desc    Get details of logged in user
//@access  Private

router.get('/getUserDetails', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//..................................................................................................................

//@route   GET api/user/:user_id
//@desc    Get user by user id
//@access  Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id).select('-password');

    if (!user) return res.status(404).json({ msg: 'User not found' });

    //All good return user details to frontend
    res.json(user);
  } catch (err) {
    console.error(err.message);

    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

//.........................................................................................................................

//@route   PUT api/userUpdate/
//@desc    Update User
//@access  Private

router.put(
  '/userUpdate',
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
      ).isLength({ min: 6 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let {
      name,
      email,
      emailVisible,
      emailNotificationAllowed,
      subscribeToNewsletter,
      password,
      avatar
    } = req.body;

    try {
      const user = await User.findById(req.user.id);

      if (user) {
        if (password !== user.password) {
          //Re-encrypt password
          const salt = await bcrypt.genSalt(10);
          password = await bcrypt.hash(password, salt);
        }

        //Check if avatar has changed
        if (avatar !== user.avatar) {
          //At this point we need to remove the old avatar from cloudinary
        }

        //Check if the email has changed
        //Check if email already exists as a user or as a creative

        if (user.email !== email) {
          let emailFound = await User.findOne({ email });
          if (emailFound) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'Email already registered' }] });
          }

          let creative = await Creative.findOne({ email });
          if (creative) {
            return res.status(400).json({
              errors: [{ msg: 'Email already registered' }]
            });
          }
        }

        //Create update object
        let userUpdate = {
          name,
          email,
          emailVisible,
          emailNotificationAllowed,
          subscribeToNewsletter,
          password,
          avatar,
          creative: false
        };

        //update
        await User.findOneAndUpdate(
          { _id: user.id },
          { $set: userUpdate },
          { new: true }
        );

        return res.json(userUpdate);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//...........................................................................................................

//@route   DELETE api/deleteUser
//@desc    Delete user and associated messages
//@access  Private

router.delete('/deleteUser', auth, async (req, res) => {
  try {
    //Here we need to get all the images associated with the user
    //and delete from cloudinary.

    //Remove User
    const user = await User.findOneAndDelete({ _id: req.user.id });

    //Remove Messages
    await Messages.deleteMany({ sendingUser: req.user.id });

    res.json({
      msg: `User ${user.name} and related information have been deleted`
    });
  } catch (err) {
    console.error(err.message);

    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
