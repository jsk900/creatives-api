const express = require('express');
const connectDB = require('./config/db');

const app = express();

//Connect Database
connectDB();

//Initialize middleware.
//Express 4.16 and later has it's own body parser. Activated with the below code.
//Eliminating the need to use the body-parser library
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('Server running'));

//Define routes

app.use('/api', require('./routes/api/users'));
app.use('/api', require('./routes/api/creatives'));
app.use('/api', require('./routes/api/login'));
app.use('/api', require('./routes/api/language'));
app.use('/api', require('./routes/api/categories'));
app.use('/api', require('./routes/api/messages'));
app.use('/api', require('./routes/api/works'));
app.use('/api', require('./routes/api/searches'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
