const express = require('express');
const router = express.Router();
const LinkType = require('../models/linkType');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Get all link types
router.get('/', async (req, res) => {
  try {
    const linkTypes = await LinkType.find();
    res.json(linkTypes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific link type by ID
router.get('/:id', async (req, res) => {
  try {
    const linkType = await LinkType.findById(req.params.id);
    if (!linkType) {
      return res.status(404).json({ message: 'Link type not found' });
    }
    res.json(linkType);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new link type - admin only
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, description, inverse, icon, color } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Check if link type with this name already exists
    const existingLinkType = await LinkType.findOne({ name: name.trim() });
    if (existingLinkType) {
      return res.status(400).json({ message: 'Link type with this name already exists' });
    }

    const newLinkType = new LinkType({
      name,
      description,
      inverse,
      icon: icon || 'link',
      color: color || '#6B7280'
    });

    const savedLinkType = await newLinkType.save();
    res.status(201).json(savedLinkType);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an existing link type - admin only
router.put('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, description, inverse, icon, color } = req.body;
    
    // Find link type by ID
    let linkType = await LinkType.findById(req.params.id);
    if (!linkType) {
      return res.status(404).json({ message: 'Link type not found' });
    }

    // Check for name uniqueness if name is being changed
    if (name && name !== linkType.name) {
      const existingLinkType = await LinkType.findOne({ name: name.trim() });
      if (existingLinkType && existingLinkType._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Link type with this name already exists' });
      }
    }

    // Update fields if provided
    if (name) linkType.name = name;
    if (description !== undefined) linkType.description = description;
    if (inverse !== undefined) linkType.inverse = inverse;
    if (icon) linkType.icon = icon;
    if (color) linkType.color = color;

    // Save updated link type
    const updatedLinkType = await linkType.save();
    res.json(updatedLinkType);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a link type - admin only
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const linkType = await LinkType.findById(req.params.id);
    if (!linkType) {
      return res.status(404).json({ message: 'Link type not found' });
    }

    // Check if any tickets are using this link type
    const Ticket = require('../models/ticket');
    const ticketsUsingLinkType = await Ticket.countDocuments({ 'links.linkType': req.params.id });
    if (ticketsUsingLinkType > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete: this link type is being used in ticket links',
        ticketCount: ticketsUsingLinkType
      });
    }

    await LinkType.findByIdAndDelete(req.params.id);
    res.json({ message: 'Link type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;