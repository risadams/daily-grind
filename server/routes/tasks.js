const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { validateTaskInput, rateLimiter } = require('../middleware/validation');

// Get all tasks for the authenticated user
router.get('/', rateLimiter, async (req, res) => {
  try {
    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef.where('userId', '==', req.user.uid).get();
    
    if (snapshot.empty) {
      return res.json([]);
    }

    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get a specific task by ID
router.get('/:id', rateLimiter, async (req, res) => {
  try {
    const taskRef = db.collection('tasks').doc(req.params.id);
    const doc = await taskRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = doc.data();
    
    // Ensure user can only access their own tasks
    if (task.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized access to this task' });
    }
    
    res.json({ id: doc.id, ...task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create a new task
router.post('/', rateLimiter, validateTaskInput, async (req, res) => {
  try {
    const { title, description, dueDate, status, priority } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const newTask = {
      title,
      description: description || '',
      dueDate: dueDate || null,
      status: status || 'pending',
      priority: priority || 'medium',
      userId: req.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await db.collection('tasks').add(newTask);
    
    res.status(201).json({
      id: docRef.id,
      ...newTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task
router.put('/:id', rateLimiter, validateTaskInput, async (req, res) => {
  try {
    const { title, description, dueDate, status, priority } = req.body;
    const taskRef = db.collection('tasks').doc(req.params.id);
    const doc = await taskRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = doc.data();
    
    // Ensure user can only update their own tasks
    if (task.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized access to this task' });
    }
    
    const updatedTask = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(dueDate !== undefined && { dueDate }),
      ...(status && { status }),
      ...(priority && { priority }),
      updatedAt: new Date()
    };
    
    await taskRef.update(updatedTask);
    
    res.json({
      id: doc.id,
      ...task,
      ...updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/:id', rateLimiter, async (req, res) => {
  try {
    const taskRef = db.collection('tasks').doc(req.params.id);
    const doc = await taskRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = doc.data();
    
    // Ensure user can only delete their own tasks
    if (task.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized access to this task' });
    }
    
    await taskRef.delete();
    
    res.json({ id: req.params.id, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;