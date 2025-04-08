const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      // User exists in Firebase Auth but not in Firestore
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Create or update user profile
router.post('/profile', async (req, res) => {
  try {
    const { displayName, photoURL, preferences } = req.body;
    const userRef = db.collection('users').doc(req.user.uid);
    
    // Check if user document exists
    const doc = await userRef.get();
    
    const userData = {
      uid: req.user.uid,
      email: req.user.email,
      ...(displayName && { displayName }),
      ...(photoURL && { photoURL }),
      ...(preferences && { preferences }),
      updatedAt: new Date()
    };
    
    if (!doc.exists) {
      // Create new user document with creation timestamp
      userData.createdAt = new Date();
      await userRef.set(userData);
    } else {
      // Update existing user document
      await userRef.update(userData);
    }
    
    // Update Firebase Auth user profile if display name or photo URL provided
    if (displayName || photoURL) {
      const updateParams = {};
      if (displayName) updateParams.displayName = displayName;
      if (photoURL) updateParams.photoURL = photoURL;
      
      await admin.auth().updateUser(req.user.uid, updateParams);
    }
    
    res.json({
      id: req.user.uid,
      ...userData
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get user stats
router.get('/stats', async (req, res) => {
  try {
    // Get tasks count by status
    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef.where('userId', '==', req.user.uid).get();
    
    if (snapshot.empty) {
      return res.json({
        totalTasks: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        overdue: 0
      });
    }

    let stats = {
      totalTasks: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0
    };

    const now = new Date();
    
    snapshot.forEach(doc => {
      const task = doc.data();
      stats.totalTasks++;
      
      // Count by status
      if (task.status === 'completed') {
        stats.completed++;
      } else if (task.status === 'in-progress') {
        stats.inProgress++;
      } else if (task.status === 'pending') {
        stats.pending++;
      }
      
      // Check if task is overdue
      if (task.dueDate && task.status !== 'completed') {
        const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
        if (dueDate < now) {
          stats.overdue++;
        }
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

module.exports = router;