const express = require('express');

//Get the work Schema
const Work = require('../../models/Works');

//Get the categories Schema
const Creative = require('../../models/Creatives');

//Create the router handler
const router = express.Router();

//...............................................................................................................................

//@route   GET api/search
//@desc    Get search results
//@access  Public

router.get(
  '/search',

  async (req, res) => {
    //De-structure body
    const { type, category, city, text, tags = [] } = req.body;

    //If the user has selected to search by creator. Get all creators and all the associated works.

    try {
      if (type === 'creatives') {
        const creativesCollection = await Creative.aggregate([
          {
            $match: {
              ...(city && { city }),
              ...(text && { name: text }),
              ...(category && { category: { $in: ['$category', category] } })
            }
          },
          {
            $lookup: {
              from: 'works',
              as: 'works',
              let: {
                id: '$_id'
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$$id', '$user']
                        },
                        ...(category
                          ? [
                              {
                                $eq: ['$fileCategory', category]
                              }
                            ]
                          : []),
                        ...(tags.length
                          ? [
                              {
                                $size: {
                                  $setIntersection: ['$tags', tags]
                                }
                              }
                            ]
                          : [])
                      ]
                    }
                  }
                }
              ]
            }
          },
          ...(category && tags.length
            ? [
                {
                  $match: {
                    'works.0': { $exists: true }
                  }
                }
              ]
            : [])
        ]);

        res.json(creativesCollection);
      } else if (type === 'creations') {
        const worksCollection = await Creative.aggregate([
          {
            $match: {
              ...(city && { city }),
              ...(category && { category: { $in: ['$category', category] } })
            }
          },
          {
            $lookup: {
              from: 'works',
              as: 'works',
              let: {
                id: '$_id'
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$$id', '$user']
                        },
                        ...(category
                          ? [
                              {
                                $eq: ['$fileCategory', category]
                              }
                            ]
                          : []),
                        ...(text
                          ? [
                              {
                                $eq: ['$fileTitle', text]
                              }
                            ]
                          : []),
                        ...(tags.length
                          ? [
                              {
                                $size: {
                                  $setIntersection: ['$tags', tags]
                                }
                              }
                            ]
                          : [])
                      ]
                    }
                  }
                }
              ]
            }
          },
          {
            $match: {
              'works.0': { $exists: true }
            }
          }
        ]);

        res.json(worksCollection);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
