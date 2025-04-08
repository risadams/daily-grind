const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const firebase = require('firebase-admin');
const dotenv = require('dotenv');
const { errorConverter, errorHandler } = require('./utils/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK
firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON request bodies

// Auth middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    const decodedToken = await firebase.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Daily Grind API is running' });
});

// Import route modules
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

// Apply routes
app.use('/api/tasks', authenticateUser, taskRoutes);
app.use('/api/users', authenticateUser, userRoutes);

// Convert errors to ApiError, if needed
app.use(errorConverter);

// Error handler middleware (should be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;