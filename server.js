const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require("cookie-parser");
//const mongoSanitize = require('express-mongo-sanitize');
const helmet=require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

app.set('query parser', 'extended');

// Body parser
app.use(express.json());

// Sanitize data
//app.use(mongoSanitize());
function stripMongoOperators(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    stripMongoOperators(obj[key]);
  }
}

// Prevent XSS attacks
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});

app.use(limiter);


app.use((req, res, next) => {
  stripMongoOperators(req.body);
  stripMongoOperators(req.params);
  stripMongoOperators(req.query);
  next();
});

// Prevent http param pollutions
app.use(hpp());

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// //Swagger
// const swaggerOptions = {
//   swaggerDefinition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Library API',
//       version: '1.0.0',
//       description: 'A simple Express VacQ API'
//     }
//   },
//   apis: ['./routes/*.js'],
// };

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'A simple Express VacQ API'
    },
    servers: [
      { url: 'http://localhost:5003/api/v1' }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },

    // (ถ้าอยากให้ทุก route ต้องใส่ token โดย default)
    // security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Cookie parser
app.use(cookieParser());

// Route files
const campgrounds = require('./routes/campgrounds');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');

// Mount routers
app.use('/api/v1/campgrounds', campgrounds);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);

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
