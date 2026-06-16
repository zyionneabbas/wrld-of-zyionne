require('dotenv').config(); // Load environment variables from .env file

const express = require('express'); // Express framework for building the server
const mongoose = require('mongoose'); // Mongoose for MongoDB object modeling
const cors = require('cors'); // CORS middleware to allow cross-origin requests

const authRoutes = require('./routes/auth'); // Import authentication routes
const auth = require('./middleware/auth'); // Import authentication middleware

const app = express(); // Create an instance of the Express application
const port = process.env.PORT || 3000; // Define the port to run the server on, defaulting to 3000 if not specified in environment variables

app.use(express.json()); // Middleware to parse JSON bodies from incoming requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies from incoming requests
app.use(cors()); // Enable CORS for all routes, allowing requests from any origin

mongoose.connect(process.env.MONGO_URI) // Connect to MongoDB using the connection string from environment variables
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.get('/', (req, res) => { // Define a simple route for the root URL that sends a welcome message
  res.send('WRLD OF ZYIONNE server is running!');
});

// Routes
app.use('/api/auth', authRoutes); // Use the authentication routes for any requests to /api/auth

app.listen(port, () => { // Start the server and listen on the defined port
  console.log(`Server is running on port ${port}`);
});