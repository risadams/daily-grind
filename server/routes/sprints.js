const express = require('express');
const router = express.Router();
const Sprint = require('../models/sprint');
const Ticket = require('../models/ticket');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Get all sprints
router.get('/', async (req, res) => {
  try {
    const sprints = await Sprint.find().sort({ startDate: -1 });
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific sprint by ID
router.get('/:id', async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tickets for a specific sprint
router.get('/:id/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find({ sprints: req.params.id })
      .populate(['status', 'priority', 'assignedTo'])
      .sort({ updatedAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new sprint
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, startDate, endDate, goal, capacity, status } = req.body;

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'Name, start date, and end date are required' });
    }

    // Create the new sprint
    const newSprint = new Sprint({
      name,
      startDate,
      endDate,
      goal: goal || '',
      capacity: capacity || 0,
      status: status || 'planning',
      createdBy: req.user._id
    });

    const savedSprint = await newSprint.save();
    res.status(201).json(savedSprint);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an existing sprint
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, startDate, endDate, goal, capacity, status } = req.body;
    
    // Find sprint by ID
    let sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    // Update fields
    if (name) sprint.name = name;
    if (startDate) sprint.startDate = startDate;
    if (endDate) sprint.endDate = endDate;
    if (goal !== undefined) sprint.goal = goal;
    if (capacity !== undefined) sprint.capacity = capacity;
    if (status) sprint.status = status;

    // Save updated sprint
    const updatedSprint = await sprint.save();
    res.json(updatedSprint);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add ticket to a sprint
router.post('/:id/tickets/:ticketId', authenticateJWT, async (req, res) => {
  try {
    // Find the sprint
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    // Find the ticket
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Update the ticket with the sprint reference if not already included
    if (!ticket.sprints.includes(sprint._id)) {
      ticket.sprints.push(sprint._id);
      await ticket.save();
    }

    // Update the sprint's tickets array if not already included
    if (!sprint.tickets.includes(ticket._id)) {
      sprint.tickets.push(ticket._id);
      await sprint.save();
    }

    res.json({ message: 'Ticket added to sprint successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove ticket from a sprint
router.delete('/:id/tickets/:ticketId', authenticateJWT, async (req, res) => {
  try {
    // Find the sprint
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    // Find the ticket
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Update the ticket to remove this sprint reference
    ticket.sprints = ticket.sprints.filter(sprintId => 
      sprintId.toString() !== req.params.id
    );
    await ticket.save();

    // Update the sprint's tickets array
    sprint.tickets = sprint.tickets.filter(id => id.toString() !== req.params.ticketId);
    await sprint.save();

    res.json({ message: 'Ticket removed from sprint successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a sprint (admin only)
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    // Remove sprint reference from all associated tickets
    await Ticket.updateMany(
      { sprints: req.params.id },
      { $pull: { sprints: req.params.id } }
    );

    // Delete the sprint
    await Sprint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;