const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

//Get the users Schema
const User = require('../../models/User');

//Get the creatives Schema
const Creative = require('../../models/Creatives');

//Used to hide stuff in the .env file
require('dotenv').config();

//Create the router handler
const router = express.Router();

//...............................................................................................................................

//@route   POST api/login
//@desc    Post Authenticate user and get token - Login
//@access  Public

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //De-structure body
    const { email, password } = req.body;

    //Check incoming email and password in both the user and creatives collections
    try {
      let user = await User.findOne({ email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        //All ok add user_id to token payload
        const payload = {
          user: {
            id: user.id,
            creative: false
          }
        };

        //Create the token and return to the frontend.
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: 360000 },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } else {
        let creative = await Creative.findOne({ email });
        if (!creative) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        const isMatch = await bcrypt.compare(password, creative.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        //All ok add user_id to token payload
        const payload = {
          user: {
            id: creative.id,
            creative: true
          }
        };

        //Create the token and return to the frontend.
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: 360000 },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
