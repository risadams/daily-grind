const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const { generateToken, authenticateJWT, isCurrentUser } = require('../middleware/auth');
const { upload, getFileUrl, deleteFile } = require('../utils/fileUpload');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create new user
    const newUser = new User({
      email,
      password,
      displayName
    });
    
    // Save user to database
    await newUser.save();
    
    // Generate JWT token
    const token = generateToken(newUser);
    
    // Return user info and token
    res.status(201).json({
      user: {
        id: newUser._id,
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: newUser.photoURL
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message || 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user info and token
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      },
      token
    });
  })(req, res, next);
});

// Google OAuth authentication routes
// Initiate Google OAuth authentication
router.get('/auth/google', 
  passport.authenticate('google', { 
    session: false,
    scope: ['profile', 'email']
  })
);

// Google OAuth callback
router.get('/auth/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login' 
  }),
  (req, res) => {
    // Generate JWT token for the authenticated Google user
    const token = generateToken(req.user);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

// Get all users
router.get('/all', authenticateJWT, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/:userId', authenticateJWT, isCurrentUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/:userId', authenticateJWT, isCurrentUser, async (req, res) => {
  try {
    const { displayName } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { 
        displayName,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload profile picture
router.post('/:userId/profile-picture', authenticateJWT, isCurrentUser, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const fileUrl = getFileUrl(req.file.filename);
    
    // Update user with new photo URL
    const user = await User.findById(req.params.userId);
    
    // Delete old profile picture if exists
    if (user.photoURL) {
      const oldFilename = user.photoURL.split('/').pop();
      deleteFile(oldFilename);
    }
    
    // Update user with new photo URL
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { 
        photoURL: fileUrl,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;