const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const { authenticateJWT } = require('../middleware/auth');
const { upload, getFileUrl, deleteFile } = require('../utils/fileUpload');

// Get all tasks
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'displayName email photoURL')
      .populate('assignedTo', 'displayName email photoURL')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Get task by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'displayName email photoURL')
      .populate('assignedTo', 'displayName email photoURL');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
});

// Create new task
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    
    const newTask = new Task({
      title,
      description,
      priority: priority || 'medium',
      status: status || 'open',
      createdBy: req.user._id
    });
    
    await newTask.save();
    
    // Populate user data before returning
    const populatedTask = await Task.findById(newTask._id)
      .populate('createdBy', 'displayName email photoURL');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// Update task
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        priority,
        assignedTo,
        updatedAt: Date.now()
      },
      { new: true }
    )
    .populate('createdBy', 'displayName email photoURL')
    .populate('assignedTo', 'displayName email photoURL');
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete task
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Delete any attached files
    if (task.attachments && task.attachments.length > 0) {
      task.attachments.forEach(attachment => {
        const filename = attachment.fileUrl.split('/').pop();
        deleteFile(filename);
      });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

// Add attachment to task
router.post('/:id/attachments', authenticateJWT, upload.single('attachment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const fileUrl = getFileUrl(req.file.filename);
    
    // Add attachment to task
    task.attachments.push({
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      uploadedAt: Date.now()
    });
    
    task.updatedAt = Date.now();
    await task.save();
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error adding attachment', error: error.message });
  }
});

// Remove attachment from task
router.delete('/:id/attachments/:attachmentId', authenticateJWT, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Find attachment
    const attachment = task.attachments.id(req.params.attachmentId);
    
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    
    // Delete file
    const filename = attachment.fileUrl.split('/').pop();
    deleteFile(filename);
    
    // Remove attachment from task
    task.attachments.pull(req.params.attachmentId);
    task.updatedAt = Date.now();
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error removing attachment', error: error.message });
  }
});

module.exports = router;