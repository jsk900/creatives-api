const express = require('express');
const { check, validationResult } = require('express-validator');

//Middleware, Authorize user token. Used on Private routes
const auth = require('../../middleware/auth');

//Get the messages Schema
const Message = require('../../models/Messages');

//Create the router handler
const router = express.Router();

//...............................................................................................................................

//@route   POST api/createMessage/:receivingUserId
//@desc    Create Message
//@access  Private

router.post(
  '/createMessage/:receivingUserId',
  [
    auth,
    [
      check('messageTitle', 'Message Title is required')
        .not()
        .isEmpty(),
      check('message', 'Message is required')
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
    let { messageTitle, message } = req.body;

    try {
      //Create the message object
      messageSave = new Message({
        sendingUser: req.user.id,
        receivingUser: req.params.receivingUserId,
        messageTitle,
        message
      });

      //Save the message to the Database
      await messageSave.save();

      res.json({ messageSave });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//.................................................................................................................

//@route   GET api/getReceivedMessages
//@desc    Get received messages of logged in user
//@access  Private

router.get('/getReceivedMessages', auth, async (req, res) => {
  try {
    const messages = await Messages.find({ receivingUser: req.user.id }).sort({
      date: -1
    });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//..................................................................................................................

//@route   GET api/getSentMessages
//@desc    Get sent messages of logged in user
//@access  Private

router.get('/getSentMessages', auth, async (req, res) => {
  try {
    const messages = await Messages.find({ sendingUser: req.user.id }).sort({
      date: -1
    });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//..................................................................................................................

module.exports = router;
