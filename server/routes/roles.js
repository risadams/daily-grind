const express = require('express');
const router = express.Router();
const Role = require('../models/role');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific role by ID
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new role (admin only)
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    // Check if role with this name already exists
    const existingRole = await Role.findOne({ name: name.trim() });
    if (existingRole) {
      return res.status(400).json({ message: 'Role with this name already exists' });
    }

    const newRole = new Role({
      name: name.trim(),
      description: description || ''
    });

    const savedRole = await newRole.save();
    res.status(201).json(savedRole);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an existing role (admin only)
router.put('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Find role by ID
    let role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Check for name uniqueness if name is being changed
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name: name.trim() });
      if (existingRole && existingRole._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Role with this name already exists' });
      }
    }

    // Update fields if provided
    if (name) role.name = name.trim();
    if (description !== undefined) role.description = description;

    // Save updated role
    const updatedRole = await role.save();
    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a role (admin only)
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Check if role is in use (consider a separate query to check if this role is used by any team)
    // For now, we allow deleting roles even if they're in use

    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;