// Import Mongoose
const mongoose = require('mongoose');

// Load environment variables
// require('dotenv').config();

// MongoDB URI (from .env or hardcoded)
// const mongoURI = 'mongodb://localhost:27017/Passport';
const mongoURI = 'mongodb+srv://sajin:sjs123@passport.0st8y.mongodb.net/';


// Set up MongoDB connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// Get the default connection
// Mongoose maintains a default connection object representing the MongoDB connection.
const db = mongoose.connection;


// Define event listeners for database connection

db.on('connected', () => {
  console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Export the database connection
module.exports = db;








// // Connect to MongoDB
// const connectDB = async () => {
//   try {
//     await mongoose.connect(mongoURI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('Successfully connected to MongoDB');
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error.message);
//     process.exit(1); // Exit process if connection fails
//   }
// };

// // Export the connection function
// module.exports = connectDB;