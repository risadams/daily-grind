const express = require('express');
const router = express.Router();
const Label = require('../models/label');
const Ticket = require('../models/ticket');
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

// Get tickets for a specific label
router.get('/:id/tickets', authenticateJWT, async (req, res) => {
  try {
    const tickets = await Ticket.find({ labels: req.params.id })
      .populate(['status', 'priority', 'assignedTo', 'labels'])
      .sort({ updatedAt: -1 });
    
    res.json(tickets);
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

    // Remove label reference from all associated tickets
    await Ticket.updateMany(
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

// Add label to a ticket
router.post('/tickets/:ticketId/add/:labelId', authenticateJWT, async (req, res) => {
  try {
    // Find the ticket
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Find the label
    const label = await Label.findById(req.params.labelId);
    if (!label) {
      return res.status(404).json({ message: 'Label not found' });
    }

    // Add label to ticket if not already added
    if (!ticket.labels.includes(label._id)) {
      ticket.labels.push(label._id);
      await ticket.save();
    }

    res.json({ message: 'Label added to ticket successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove label from a ticket
router.delete('/tickets/:ticketId/remove/:labelId', authenticateJWT, async (req, res) => {
  try {
    // Update the ticket to remove the label reference
    const result = await Ticket.updateOne(
      { _id: req.params.ticketId },
      { $pull: { labels: req.params.labelId } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ message: 'Label removed from ticket successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;