const express = require('express');
const nodemailer = require('nodemailer');

//Create the router handler
const router = express.Router();

//...............................................................................................................

//@route   POST api/sendmail
//@desc    Post email to creatives@goldencat.co.uk
//@access  Public

router.post(
  '/sendmail',

  async (req, res) => {
    //De-structure body
    const { name, email, message } = req.body;

    //Make sure there are no duplicate categories
    try {
      let transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.de',
        port: 587,
        secure: false,
        auth: {
          user: 'creatives@goldencat.co.uk',
          pass: 'creatives'
        }
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: name,
        email, //
        to: 'creatives@goldencat.co.uk',
        subject: 'Contact from Creatives site ✔',
        text: message
      });

      res.json({ message: 'Email sent' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
