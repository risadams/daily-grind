const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Epic = require('../models/epic');
const Feature = require('../models/feature');
const authMiddleware = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

// Get all epics
router.get('/', authMiddleware, async (req, res) => {
  try {
    const epics = await Epic.find()
      .populate('status')
      .populate('priority')
      .populate('labels')
      .populate('teams')
      .populate('createdBy', 'name email profileImage')
      .populate('owner', 'name email profileImage');
    
    res.json(epics);
  } catch (error) {
    console.error('Error fetching epics:', error);
    res.status(500).json({ message: 'Failed to fetch epics', error: error.message });
  }
});

// Get a specific epic by ID with associated features
router.get('/:id', [authMiddleware, validateObjectId('id')], async (req, res) => {
  try {
    const epic = await Epic.findById(req.params.id)
      .populate('status')
      .populate('priority')
      .populate('labels')
      .populate('teams')
      .populate('createdBy', 'name email profileImage')
      .populate('owner', 'name email profileImage');
    
    if (!epic) {
      return res.status(404).json({ message: 'Epic not found' });
    }
    
    // Get associated features
    const features = await Feature.find({ epic: req.params.id })
      .populate('status')
      .populate('priority');
    
    res.json({
      epic,
      features
    });
  } catch (error) {
    console.error('Error fetching epic:', error);
    res.status(500).json({ message: 'Failed to fetch epic', error: error.message });
  }
});

// Create a new epic
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      summary,
      status,
      priority,
      labels,
      startDate,
      targetDate,
      teams,
      owner
    } = req.body;

    const newEpic = new Epic({
      title,
      description,
      summary,
      status,
      priority,
      labels: labels || [],
      startDate,
      targetDate,
      teams: teams || [],
      owner,
      createdBy: req.user.id
    });

    const savedEpic = await newEpic.save();
    
    res.status(201).json(savedEpic);
  } catch (error) {
    console.error('Error creating epic:', error);
    res.status(500).json({ message: 'Failed to create epic', error: error.message });
  }
});

// Update an epic
router.put('/:id', [authMiddleware, validateObjectId('id')], async (req, res) => {
  try {
    const {
      title,
      description,
      summary,
      status,
      priority,
      labels,
      startDate,
      targetDate,
      teams,
      owner
    } = req.body;

    const epicToUpdate = await Epic.findById(req.params.id);
    
    if (!epicToUpdate) {
      return res.status(404).json({ message: 'Epic not found' });
    }

    // Update fields
    epicToUpdate.title = title || epicToUpdate.title;
    epicToUpdate.description = description || epicToUpdate.description;
    epicToUpdate.summary = summary || epicToUpdate.summary;
    epicToUpdate.status = status || epicToUpdate.status;
    epicToUpdate.priority = priority || epicToUpdate.priority;
    epicToUpdate.labels = labels || epicToUpdate.labels;
    epicToUpdate.startDate = startDate || epicToUpdate.startDate;
    epicToUpdate.targetDate = targetDate || epicToUpdate.targetDate;
    epicToUpdate.teams = teams || epicToUpdate.teams;
    epicToUpdate.owner = owner || epicToUpdate.owner;

    const updatedEpic = await epicToUpdate.save();
    
    res.json(updatedEpic);
  } catch (error) {
    console.error('Error updating epic:', error);
    res.status(500).json({ message: 'Failed to update epic', error: error.message });
  }
});

// Delete an epic
router.delete('/:id', [authMiddleware, validateObjectId('id')], async (req, res) => {
  try {
    // Check if epic has any associated features
    const relatedFeatures = await Feature.find({ epic: req.params.id });
    
    if (relatedFeatures.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete epic with associated features. Please reassign or delete the features first.',
        featureCount: relatedFeatures.length 
      });
    }

    const deletedEpic = await Epic.findByIdAndDelete(req.params.id);
    
    if (!deletedEpic) {
      return res.status(404).json({ message: 'Epic not found' });
    }
    
    res.json({ message: 'Epic deleted successfully', deletedEpic });
  } catch (error) {
    console.error('Error deleting epic:', error);
    res.status(500).json({ message: 'Failed to delete epic', error: error.message });
  }
});

module.exports = router;