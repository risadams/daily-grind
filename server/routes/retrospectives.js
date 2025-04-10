const express = require('express');
const router = express.Router();
const Retrospective = require('../models/retrospective');
const Sprint = require('../models/sprint');
const { authenticateJWT } = require('../middleware/auth');

// Get all retrospectives
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const retrospectives = await Retrospective.find()
      .populate('sprint', 'name startDate endDate')
      .populate('facilitator', 'displayName email photoURL')
      .sort({ date: -1 });
    res.json(retrospectives);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific retrospective by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const retrospective = await Retrospective.findById(req.params.id)
      .populate('sprint', 'name startDate endDate')
      .populate('facilitator', 'displayName email photoURL')
      .populate('participants', 'displayName email photoURL');
    
    if (!retrospective) {
      return res.status(404).json({ message: 'Retrospective not found' });
    }
    
    res.json(retrospective);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get retrospective for a specific sprint
router.get('/sprint/:sprintId', authenticateJWT, async (req, res) => {
  try {
    const retrospective = await Retrospective.findOne({ sprint: req.params.sprintId })
      .populate('facilitator', 'displayName email photoURL')
      .populate('participants', 'displayName email photoURL');
    
    if (!retrospective) {
      return res.status(404).json({ message: 'No retrospective found for this sprint' });
    }
    
    res.json(retrospective);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new retrospective
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { 
      highlights, 
      improvements, 
      actions, 
      sprintId, 
      facilitatorId, 
      participantIds,
      date 
    } = req.body;

    // Validate sprint
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    // Check if a retrospective already exists for this sprint
    const existingRetro = await Retrospective.findOne({ sprint: sprintId });
    if (existingRetro) {
      return res.status(400).json({ 
        message: 'A retrospective already exists for this sprint',
        existingRetroId: existingRetro._id 
      });
    }

    // Create new retrospective
    const newRetrospective = new Retrospective({
      highlights: highlights || [],
      improvements: improvements || [],
      actions: actions || [],
      sprint: sprintId,
      facilitator: facilitatorId,
      participants: participantIds || [],
      date: date || new Date(),
      createdBy: req.user._id
    });

    const savedRetrospective = await newRetrospective.save();

    // Update the sprint with the retrospective reference
    sprint.retrospective = savedRetrospective._id;
    await sprint.save();

    res.status(201).json(savedRetrospective);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an existing retrospective
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { 
      highlights, 
      improvements, 
      actions, 
      facilitatorId, 
      participantIds,
      date 
    } = req.body;
    
    // Find retrospective by ID
    const retrospective = await Retrospective.findById(req.params.id);
    if (!retrospective) {
      return res.status(404).json({ message: 'Retrospective not found' });
    }

    // Update fields
    if (highlights !== undefined) retrospective.highlights = highlights;
    if (improvements !== undefined) retrospective.improvements = improvements;
    if (actions !== undefined) retrospective.actions = actions;
    if (facilitatorId) retrospective.facilitator = facilitatorId;
    if (participantIds) retrospective.participants = participantIds;
    if (date) retrospective.date = date;

    // Save updated retrospective
    const updatedRetrospective = await retrospective.save();
    res.json(updatedRetrospective);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a retrospective
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const retrospective = await Retrospective.findById(req.params.id);
    if (!retrospective) {
      return res.status(404).json({ message: 'Retrospective not found' });
    }

    // Remove retrospective reference from the sprint
    await Sprint.findByIdAndUpdate(
      retrospective.sprint,
      { $set: { retrospective: null } }
    );

    // Delete the retrospective
    await Retrospective.findByIdAndDelete(req.params.id);
    res.json({ message: 'Retrospective deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;