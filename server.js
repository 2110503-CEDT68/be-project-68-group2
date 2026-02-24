// const express = require('express');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');

// // Load env vars
// dotenv.config({ path: './config/config.env' });

// // Connect to database
// connectDB();

// // Route files
// const hospitals = require('./routes/hospitals');

// const app = express();

// //add body parser
// app.use(express.json());

// // Body parser
// app.use(express.json());

// app.use('/api/v1/hospitals', hospitals);

// const PORT = process.env.PORT || 5003;

// const server = app.listen(
//   PORT,
//   console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT)
// );

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.log(`Error: ${err.message}`);

//   // Close server & exit process
//   server.close(() => process.exit(1));
// });

// // Route files
// const hospitals = require('./routes/hospitals');
// const auth = require('./routes/auth');

// app.use('/api/v1/hospitals', hospitals);
// app.use('/api/v1/auth', auth);

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require("cookie-parser");


// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

app.set('query parser', 'extended');

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());


// Route files
const hospitals = require('./routes/hospitals');
const auth = require('./routes/auth');
const appointments = require('./routes/appointments');

// Mount routers
app.use('/api/v1/hospitals', hospitals);
app.use('/api/v1/auth', auth);
app.use('/api/v1/appointments', appointments);

const PORT = process.env.PORT || 5003;

const server = app.listen(
  PORT,
  () => console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);

  // Close server & exit process
  server.close(() => process.exit(1));
});
