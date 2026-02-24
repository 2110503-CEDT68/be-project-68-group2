// const mongoose = require('mongoose');

// const connectDB = async () => {
//   const uri = process.env.MONGO_URI;

//   console.log('MONGO_URI loaded?', !!uri);
//   if (!uri) {
//     throw new Error('MONGO_URI is missing. Check config/config.env and dotenv path.');
//   }

//   try {
//     mongoose.set('strictQuery', true);

//     const conn = await mongoose.connect(uri, {
//       serverSelectionTimeoutMS: 8000, // รอเลือก server ไม่เกิน 8 วิ
//       connectTimeoutMS: 8000,
//     });

//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (err) {
//     console.error('MongoDB connection error:', err.message);
//     throw err; // ให้ unhandledRejection ใน server.js จับต่อ
//   }
// };

// module.exports = connectDB;

console.log('*** LOADED config/db.js ***');

const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('*** connectDB() called ***');
  console.log('MONGO_URI loaded?', !!process.env.MONGO_URI);

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

module.exports = connectDB;