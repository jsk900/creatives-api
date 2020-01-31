const express = require('express');
const { check, validationResult } = require('express-validator');

//Middleware, Authorize user token. Used on Private routes
const auth = require('../../middleware/auth');

//Get the work Schema
const Work = require('../../models/Works');

//Get the categories Schema
const Category = require('../../models/Categories');

//Create the router handler
const router = express.Router();

//...............................................................................................................................

//@route   POST api/createWork
//@desc    Create Work
//@access  Private

router.post(
  '/createWork',
  [
    auth,
    [
      check('fileCategory', 'The category is required')
        .not()
        .isEmpty(),
      check('fileTitle', 'The Title is required')
        .not()
        .isEmpty(),
      check('fileDescription', 'The description is required')
        .not()
        .isEmpty(),
      check('creationDate', 'The creation date is required')
        .not()
        .isEmpty(),
      check('tags', 'At least one tag is required')
        .not()
        .isEmpty(),
      check('filePath', 'The file path is required')
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
      fileCategory,
      fileTitle,
      fileDescription,
      creationDate,
      tags,
      filePath,
      thumbnailPath
    } = req.body;

    try {
      //Create the works object
      work = new Work({
        user: req.user.id,
        fileCategory,
        fileTitle,
        fileDescription,
        creationDate,
        tags,
        filePath,
        thumbnailPath
      });

      //Grab the category info from the Category collection
      const category = await Category.findOne({
        categoryName: work.fileCategory
      });

      //Check to see if any new tags have been added to this category. If so update the Categories collection.
      if (category) {
        work.tags.map(tag => {
          let found = category.categoryTags.includes(tag);
          if (!found) {
            category.categoryTags.push(tag);
          }
        });

        //update
        await Category.findOneAndUpdate(
          { categoryName: work.fileCategory },
          { $set: category },
          { new: true }
        );
      }

      //Save the message to the Database
      await work.save();

      res.json({ work });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//.................................................................................................................

//@route   GET api/getWorks
//@desc    Get all works of logged in user
//@access  Private

router.get('/getWorks', auth, async (req, res) => {
  try {
    const works = await Work.find({ user: req.user.id }).sort({
      date: -1
    });
    res.json(works);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//..................................................................................................................

//@route   GET api/getWork/workId
//@desc    Get work by work Id
//@access  Public

router.get('/getWork/:workId', async (req, res) => {
  try {
    const work = await Work.find({ _id: req.params.workId });
    res.json(work);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//..................................................................................................................

//@route   PUT api/workUpdate/:workId
//@desc    Update work by work Id
//@access  Private

router.put(
  '/workUpdate/:workId',
  [
    auth,
    [
      check('fileCategory', 'The category is required')
        .not()
        .isEmpty(),
      check('fileTitle', 'The Title is required')
        .not()
        .isEmpty(),
      check('fileDescription', 'The description is required')
        .not()
        .isEmpty(),
      check('creationDate', 'The creation date is required')
        .not()
        .isEmpty(),
      check('tags', 'At least one tag is required')
        .not()
        .isEmpty(),
      check('filePath', 'The file path is required')
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
      fileCategory,
      fileTitle,
      fileDescription,
      creationDate,
      tags,
      filePath,
      thumbnailPath
    } = req.body;

    try {
      const work = await Work.findById(req.params.workId);

      if (work) {
        //Create update object
        let workUpdate = {
          fileCategory,
          fileTitle,
          fileDescription,
          creationDate,
          tags,
          filePath,
          thumbnailPath
        };

        //Grab the category info from the Category collection
        const category = await Category.findOne({
          categoryName: work.fileCategory
        });

        //Check to see if any new tags have been added to this category. If so update the Categories collection.
        if (category) {
          work.tags.map(tag => {
            let found = category.categoryTags.includes(tag);
            if (!found) {
              category.categoryTags.push(tag);
            }
          });

          //update
          await Category.findOneAndUpdate(
            { categoryName: work.fileCategory },
            { $set: category },
            { new: true }
          );
        }

        //update
        await Work.findOneAndUpdate(
          { _id: req.params.workId },
          { $set: workUpdate },
          { new: true }
        );

        return res.json(workUpdate);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//..................................................................................................................

//@route   DELETE api/deleteWork/workId
//@desc    Delete work by work Id
//@access  Public

//We have to remember to kill this work from Cloudinary

router.delete('/deleteWork/:workId', async (req, res) => {
  try {
    const work = await Work.findByIdAndDelete(req.params.workId);
    res.send(`The work titled ${work.fileTitle} has been deleted`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//..................................................................................................................

module.exports = router;
