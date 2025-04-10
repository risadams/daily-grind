const express = require('express');
const router = express.Router();
const Team = require('../models/team');
const User = require('../models/user');
const Role = require('../models/role');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Get all teams
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const teams = await Team.find()
      .populate({
        path: 'members.user',
        select: 'displayName email photoURL'
      })
      .populate('members.roles', 'name description');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific team by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate({
        path: 'members.user',
        select: 'displayName email photoURL'
      })
      .populate('members.roles', 'name description');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new team
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    // Check if team with this name already exists
    const existingTeam = await Team.findOne({ name: name.trim() });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team with this name already exists' });
    }

    // Process members if provided
    let teamMembers = [];
    if (members && Array.isArray(members)) {
      teamMembers = members.map(member => ({
        user: member.userId,
        roles: member.roleIds || []
      }));
    }

    const newTeam = new Team({
      name,
      description: description || '',
      members: teamMembers,
      createdBy: req.user._id
    });

    const savedTeam = await newTeam.save();
    res.status(201).json(savedTeam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an existing team
router.put('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    // Find team by ID
    let team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check for name uniqueness if name is being changed
    if (name && name !== team.name) {
      const existingTeam = await Team.findOne({ name: name.trim() });
      if (existingTeam && existingTeam._id.toString() !== req.params.id) {
        return res.status(400).json({ message: 'Team with this name already exists' });
      }
      team.name = name;
    }

    // Update description if provided
    if (description !== undefined) {
      team.description = description;
    }

    // Update members if provided
    if (members && Array.isArray(members)) {
      team.members = members.map(member => ({
        user: member.userId,
        roles: member.roleIds || [],
        ...(member.joinedAt ? { joinedAt: member.joinedAt } : {})
      }));
    }

    // Save updated team
    const updatedTeam = await team.save();
    
    // Populate and return the updated team
    const populatedTeam = await Team.findById(updatedTeam._id)
      .populate({
        path: 'members.user',
        select: 'displayName email photoURL'
      })
      .populate('members.roles', 'name description');
      
    res.json(populatedTeam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a user to a team
router.post('/:id/members/:userId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { roleIds } = req.body;
    
    // Find the team
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Find the user
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if roles exist if provided
    if (roleIds && roleIds.length > 0) {
      const roles = await Role.find({ _id: { $in: roleIds } });
      if (roles.length !== roleIds.length) {
        return res.status(400).json({ message: 'One or more roles not found' });
      }
    }

    // Check if user is already a member
    const existingMemberIndex = team.members.findIndex(
      member => member.user && member.user.toString() === req.params.userId
    );

    if (existingMemberIndex === -1) {
      // Add user to team with roles
      team.members.push({
        user: user._id,
        roles: roleIds || [],
        joinedAt: new Date()
      });
    } else {
      // Update existing member's roles if roleIds provided
      if (roleIds) {
        team.members[existingMemberIndex].roles = roleIds;
      }
    }

    await team.save();
    res.json({ message: 'User added to team successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update roles for a team member
router.put('/:id/members/:userId/roles', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { roleIds } = req.body;
    
    if (!roleIds || !Array.isArray(roleIds)) {
      return res.status(400).json({ message: 'Role IDs array is required' });
    }
    
    // Find the team
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if roles exist
    if (roleIds.length > 0) {
      const roles = await Role.find({ _id: { $in: roleIds } });
      if (roles.length !== roleIds.length) {
        return res.status(400).json({ message: 'One or more roles not found' });
      }
    }

    // Find the member in the team
    const memberIndex = team.members.findIndex(
      member => member.user && member.user.toString() === req.params.userId
    );
    
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'User is not a member of this team' });
    }
    
    // Update roles
    team.members[memberIndex].roles = roleIds;
    await team.save();
    
    res.json({ message: 'Member roles updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove a user from a team
router.delete('/:id/members/:userId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Find the team
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Remove user from team
    team.members = team.members.filter(
      member => !member.user || member.user.toString() !== req.params.userId
    );
    
    await team.save();
    res.json({ message: 'User removed from team successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a team
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all teams for a specific user
router.get('/user/:userId', authenticateJWT, async (req, res) => {
  try {
    const teams = await Team.find({ 'members.user': req.params.userId })
      .populate({
        path: 'members.user',
        select: 'displayName email photoURL'
      })
      .populate('members.roles', 'name description');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;