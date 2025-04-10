const express = require('express');
const router = express.Router();
const Priority = require('../models/priority');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Get all priorities
router.get('/', async (req, res) => {
  try {
    const priorities = await Priority.find().sort({ level: 1 });
    res.json(priorities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific priority by ID
router.get('/:id', async (req, res) => {
  try {
    const priority = await Priority.findById(req.params.id);
    if (!priority) {
      return res.status(404).json({ message: 'Priority not found' });
    }
    res.json(priority);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new priority - admin only
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, level, icon, color } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Check if priority with this name already exists
    const existingPriority = await Priority.findOne({ name: name.trim() });
    if (existingPriority) {
      return res.status(400).json({ message: 'Priority with this name already exists' });
    }

    const newPriority = new Priority({
      name,
      level: level || 0,
      icon: icon || 'flag',
      color: color || '#6B7280'
    });

    const savedPriority = await newPriority.save();
    res.status(201).json(savedPriority);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an existing priority - admin only
router.put('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, level, icon, color } = req.body;
    
    // Find priority by ID
    let priority = await Priority.findById(req.params.id);
    if (!priority) {
      return res.status(404).json({ message: 'Priority not found' });
    }

    // Check for name uniqueness if name is being changed
    if (name && name !== priority.name) {
      const existingPriority = await Priority.findOne({ name: name.trim() });
      if (existingPriority && existingPriority._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Priority with this name already exists' });
      }
    }

    // Update fields if provided
    if (name) priority.name = name;
    if (level !== undefined) priority.level = level;
    if (icon) priority.icon = icon;
    if (color) priority.color = color;

    // Save updated priority
    const updatedPriority = await priority.save();
    res.json(updatedPriority);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a priority - admin only
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const priority = await Priority.findById(req.params.id);
    if (!priority) {
      return res.status(404).json({ message: 'Priority not found' });
    }

    // Check if any tickets are using this priority
    const Ticket = require('../models/ticket');
    const ticketsUsingPriority = await Ticket.countDocuments({ priority: req.params.id });
    if (ticketsUsingPriority > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete: this priority is being used by tickets',
        ticketCount: ticketsUsingPriority
      });
    }

    await Priority.findByIdAndDelete(req.params.id);
    res.json({ message: 'Priority deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;