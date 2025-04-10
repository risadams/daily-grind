const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const connectToMongoDB = require('./config/mongodb/connection');
const passport = require('./config/auth/passport');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const statusRoutes = require('./routes/status');
const priorityRoutes = require('./routes/priority');
const linkTypeRoutes = require('./routes/linkTypes');
const sprintRoutes = require('./routes/sprints');
const teamRoutes = require('./routes/teams');
const retrospectiveRoutes = require('./routes/retrospectives');
const labelRoutes = require('./routes/labels');
const roleRoutes = require('./routes/roles');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectToMongoDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'daily-grind-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/tickets', taskRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/priorities', priorityRoutes);
app.use('/api/link-types', linkTypeRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/retrospectives', retrospectiveRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/roles', roleRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;