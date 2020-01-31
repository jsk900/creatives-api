const express = require('express');
const { check, validationResult } = require('express-validator');

//Get the users Schema
const Language = require('../../models/Language');

//Create the router handler
const router = express.Router();

//...............................................................................................................

//@route   POST api/createLanguage
//@desc    Post language details
//@access  Public

router.post(
  '/createLanguage',
  [
    check('languageCode', 'The Language Code is required')
      .not()
      .isEmpty(),
    check('languageName', 'The Language name is required')
      .not()
      .isEmpty(),
    check('component', 'Component is required')
      .not()
      .isEmpty(),
    check('element', 'Element is required')
      .not()
      .isEmpty(),
    check('elementText', 'The element text is required')
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
      languageCode,
      languageName,
      component,
      element,
      elementText
    } = req.body;

    try {
      //Create the language object
      language = new Language({
        languageCode,
        languageName,
        component,
        element,
        elementText
      });

      //Save language to the Database
      await language.save();
      res.json(language);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//.........................................................................................................

//@route   GET api/getLanguage:languageCode
//@desc    Get language details by language code
//@access  Public

router.get(
  '/getLanguage/:languageCode',

  async (req, res) => {
    try {
      const language = await Language.find({
        languageCode: req.params.languageCode
      });

      if (!language) return res.status(404).json({ msg: 'Language not found' });

      //All good return language details to frontend
      res.json(language);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//.........................................................................................................

//@route   DELETE api/deleteLanguage:language_Id
//@desc    Delete language details by language code
//@access  Public

router.delete(
  '/deleteLanguage/:language_Id',

  async (req, res) => {
    try {
      const language = await Language.findByIdAndDelete({
        _id: req.params.language_Id
      });

      if (!language) return res.status(404).json({ msg: 'Language not found' });

      res.json({
        msg: `${language.languageName} information has been deleted`
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
