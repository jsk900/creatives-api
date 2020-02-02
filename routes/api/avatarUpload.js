const express = require('express');
// const { check, validationResult } = require('express-validator');

//Get the Categories Schema
// const Category = require('../../models/Categories');

//Create the router handler
const router = express.Router();

//...............................................................................................................

//@route   POST api/avatarUpload
//@desc    Post avatar path details
//@access  Public

// router.post(
//   '/avatarUpload',

//   async (req, res) => {
//     if (req.files === null) {
//       return res.status(400).json({ msg: 'No file was uploaded' });
//     }

//     const file = req.files.file;

//     file.mv(`${__dirname}/uploads/${file.name}`, err => {
//       if (err) {
//         console.log(err);
//         return res.status(500).send(err);
//       }

//       res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
//     });
//   }
// );

// module.exports = router;
