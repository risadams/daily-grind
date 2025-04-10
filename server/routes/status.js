const express = require('express');
const router = express.Router();
const Status = require('../models/status');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Get all statuses
router.get('/', async (req, res) => {
  try {
    const statuses = await Status.find().populate('workflow');
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific status by ID
router.get('/:id', async (req, res) => {
  try {
    const status = await Status.findById(req.params.id).populate('workflow');
    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new status - admin only
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, disposition, icon, color, workflow } = req.body;

    // Validate required fields
    if (!name || !disposition) {
      return res.status(400).json({ message: 'Name and disposition are required' });
    }

    // Check if status with this name already exists
    const existingStatus = await Status.findOne({ name: name.trim() });
    if (existingStatus) {
      return res.status(400).json({ message: 'Status with this name already exists' });
    }

    const newStatus = new Status({
      name,
      disposition,
      icon: icon || 'circle',
      color: color || '#6B7280',
      workflow: workflow || []
    });

    const savedStatus = await newStatus.save();
    res.status(201).json(savedStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an existing status - admin only
router.put('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, disposition, icon, color, workflow } = req.body;
    
    // Find status by ID
    let status = await Status.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    // Check for name uniqueness if name is being changed
    if (name && name !== status.name) {
      const existingStatus = await Status.findOne({ name: name.trim() });
      if (existingStatus && existingStatus._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Status with this name already exists' });
      }
    }

    // Update fields if provided
    if (name) status.name = name;
    if (disposition) status.disposition = disposition;
    if (icon) status.icon = icon;
    if (color) status.color = color;
    if (workflow) status.workflow = workflow;

    // Save updated status
    const updatedStatus = await status.save();
    res.json(updatedStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a status - admin only
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    // Check if this status is referenced by other statuses in workflow
    const referencedBy = await Status.find({ workflow: req.params.id });
    if (referencedBy.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete: this status is referenced in workflow by other statuses',
        referencedBy: referencedBy.map(s => s.name)
      });
    }

    // Check if any tickets are using this status
    const Ticket = require('../models/ticket');
    const ticketsUsingStatus = await Ticket.countDocuments({ status: req.params.id });
    if (ticketsUsingStatus > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete: this status is being used by tickets',
        ticketCount: ticketsUsingStatus
      });
    }

    await Status.findByIdAndDelete(req.params.id);
    res.json({ message: 'Status deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;