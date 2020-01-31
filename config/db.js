const mongoose = require('mongoose');
require('dotenv').config();

//Get mongo credentials
const db = process.env.MONGO_URI;

//Connect to mongo
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('mongoDB connected....');
  } catch (err) {
    console.error(err.message);
    //This escapes from the whole process with a failure
    process.exit(1);
  }
};

module.exports = connectDB;
