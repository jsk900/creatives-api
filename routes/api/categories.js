const express = require('express');
const { check, validationResult } = require('express-validator');

//Get the Categories Schema
const Category = require('../../models/Categories');

//Create the router handler
const router = express.Router();

//...............................................................................................................

//@route   POST api/createCategory
//@desc    Post category details
//@access  Public

router.post(
  '/createCategory',
  [
    check('categoryName', 'The Category Name is required')
      .not()
      .isEmpty(),
    check('categoryIconPath', 'The Category Icon path is required')
      .not()
      .isEmpty(),
    check('categoryTags', 'At least one tag is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    //If there are errors from our checks above then return to the front end
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //De-structure body
    const { categoryName, categoryIconPath, categoryTags } = req.body;

    //Make sure there are no duplicate categories
    try {
      let category = await Category.findOne({ categoryName });
      if (category) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Category already exists' }] });
      }

      //Create the Category object
      category = new Category({
        categoryName,
        categoryIconPath,
        categoryTags
      });

      //Check that there is at least one tag entered
      if (categoryTags.length <= 0) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Please select at least one tag' }] });
      }

      //Save category to the Database
      await category.save();
      res.json(category);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//.........................................................................................................

//@route   GET api/getAllCategories
//@desc    Get all Categories
//@access  Public

//Get all the categories from the Categories collection and sort by date order
router.get('/getAllCategories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ date: -1 });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

//.........................................................................................................

//@route   GET api/getCategoryId:category_Id
//@desc    Get category details by category ID
//@access  Public

//Get category by Id
router.get(
  '/getCategoryId/:category_Id',

  async (req, res) => {
    try {
      const category = await Category.findById({
        _id: req.params.category_Id
      });

      if (!category) return res.status(404).json({ msg: 'Category not found' });

      //All good return category details to frontend
      res.json(category);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//.........................................................................................................

//@route   GET api/getCategoryName:categoryName
//@desc    Get category details by categoryName
//@access  Public

//Get category by category name
router.get(
  '/getCategoryName/:categoryName',

  async (req, res) => {
    try {
      const category = await Category.findOne({
        categoryName: req.params.categoryName
      });

      if (!category) return res.status(404).json({ msg: 'Category not found' });

      //All good return category details to frontend
      res.json(category);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//.........................................................................................................

//@route   PUT api/categoryUpdate/
//@desc    Update category tags
//@access  Public

router.put(
  '/categoryUpdate',

  async (req, res) => {
    //De-structure the body
    let { categoryName, categoryIconPath, categoryTags } = req.body;

    try {
      const category = await Category.findOne({ categoryName: categoryName });

      if (category) {
        //The tags coming from the frontend will only ever be added.
        //Make sure there is at least one entry and merge with original.
        if (categoryTags.length >= 1) {
          categoryTags = [...category.categoryTags, ...categoryTags];
        }

        //Create update object
        let categoryUpdate = {
          categoryName,
          categoryIconPath,
          categoryTags
        };

        //update
        await Category.findOneAndUpdate(
          { categoryName: categoryName },
          { $set: categoryUpdate },
          { new: true }
        );

        return res.json(categoryUpdate);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//.........................................................................................................

//@route   DELETE api/deleteCategoryName:categoryName
//@desc    Delete category by category name
//@access  Public

router.delete(
  '/deleteCategoryName/:categoryName',

  async (req, res) => {
    try {
      const category = await Category.findOneAndDelete({
        categoryName: req.params.categoryName
      });

      if (!category) return res.status(404).json({ msg: 'Category not found' });

      res.json({ msg: `Category ${req.params.categoryName} has been deleted` });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
