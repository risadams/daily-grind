const express = require('express');
const router = express.Router();
const Label = require('../models/label');
const Task = require('../models/task');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Get all labels
router.get('/', async (req, res) => {
  try {
    const labels = await Label.find().sort({ name: 1 });
    res.json(labels);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific label by ID
router.get('/:id', async (req, res) => {
  try {
    const label = await Label.findById(req.params.id);
    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }
    res.json(label);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tasks for a specific label
router.get('/:id/tasks', authenticateJWT, async (req, res) => {
  try {
    const tasks = await Task.find({ labels: req.params.id })
      .populate(['status', 'priority', 'assignedTo', 'labels'])
      .sort({ updatedAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new label
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, color, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Label name is required' });
    }

    // Convert name to lowercase for consistency
    const lowercaseName = name.trim().toLowerCase();

    // Check if label with this name already exists
    const existingLabel = await Label.findOne({ name: lowercaseName });
    if (existingLabel) {
      return res.status(400).json({ message: 'Label with this name already exists' });
    }

    const newLabel = new Label({
      name: lowercaseName,
      color: color || '#6B7280',
      description: description || '',
      createdBy: req.user._id
    });

    const savedLabel = await newLabel.save();
    res.status(201).json(savedLabel);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an existing label
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, color, description } = req.body;
    
    // Find label by ID
    let label = await Label.findById(req.params.id);
    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }

    // Check for name uniqueness if name is being changed
    if (name) {
      // Convert name to lowercase for consistency
      const lowercaseName = name.trim().toLowerCase();
      
      if (lowercaseName !== label.name) {
        const existingLabel = await Label.findOne({ name: lowercaseName });
        if (existingLabel && existingLabel._id.toString() !== req.params.id) {
          return res.status(400).json({ message: 'Label with this name already exists' });
        }
        
        // Update with lowercase name
        label.name = lowercaseName;
      }
    }

    // Update other fields if provided
    if (color) label.color = color;
    if (description !== undefined) label.description = description;

    // Save updated label
    const updatedLabel = await label.save();
    res.json(updatedLabel);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a label
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const label = await Label.findById(req.params.id);
    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }

    // Remove label reference from all associated tasks
    await Task.updateMany(
      { labels: req.params.id },
      { $pull: { labels: req.params.id } }
    );

    // Delete the label
    await Label.findByIdAndDelete(req.params.id);
    res.json({ message: 'Label deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add label to a task
router.post('/tasks/:taskId/add/:labelId', authenticateJWT, async (req, res) => {
  try {
    // Find the task
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find the label
    const label = await Label.findById(req.params.labelId);
    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }

    // Add label to task if not already added
    if (!task.labels.includes(label._id)) {
      task.labels.push(label._id);
      await task.save();
    }

    res.json({ message: 'Label added to task successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove label from a task
router.delete('/tasks/:taskId/remove/:labelId', authenticateJWT, async (req, res) => {
  try {
    // Update the task to remove the label reference
    const result = await Task.updateOne(
      { _id: req.params.taskId },
      { $pull: { labels: req.params.labelId } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Label removed from task successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;