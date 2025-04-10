const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticket');
const { authenticateJWT } = require('../middleware/auth');
const { upload, getFileUrl, deleteFile } = require('../utils/fileUpload');

// Get all tickets
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('createdBy', 'displayName email photoURL')
      .populate('assignedTo', 'displayName email photoURL')
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
});

// Get ticket by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'displayName email photoURL')
      .populate('assignedTo', 'displayName email photoURL');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
});

// Create new ticket
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    
    const newTicket = new Ticket({
      title,
      description,
      priority: priority || 'medium',
      status: status || 'open',
      createdBy: req.user._id
    });
    
    await newTicket.save();
    
    // Populate user data before returning
    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('createdBy', 'displayName email photoURL');
    
    res.status(201).json(populatedTicket);
  } catch (error) {
    res.status(500).json({ message: 'Error creating ticket', error: error.message });
  }
});

// Update ticket
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;
    
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        priority,
        assignedTo,
        updatedAt: Date.now()
      },
      { new: true }
    )
    .populate('createdBy', 'displayName email photoURL')
    .populate('assignedTo', 'displayName email photoURL');
    
    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket', error: error.message });
  }
});

// Delete ticket
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Delete any attached files
    if (ticket.attachments && ticket.attachments.length > 0) {
      ticket.attachments.forEach(attachment => {
        const filename = attachment.fileUrl.split('/').pop();
        deleteFile(filename);
      });
    }
    
    await Ticket.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ticket', error: error.message });
  }
});

// Add attachment to ticket
router.post('/:id/attachments', authenticateJWT, upload.single('attachment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    const fileUrl = getFileUrl(req.file.filename);
    
    // Add attachment to ticket
    ticket.attachments.push({
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      uploadedAt: Date.now()
    });
    
    ticket.updatedAt = Date.now();
    await ticket.save();
    
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error adding attachment', error: error.message });
  }
});

// Remove attachment from ticket
router.delete('/:id/attachments/:attachmentId', authenticateJWT, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Find attachment
    const attachment = ticket.attachments.id(req.params.attachmentId);
    
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    
    // Delete file
    const filename = attachment.fileUrl.split('/').pop();
    deleteFile(filename);
    
    // Remove attachment from ticket
    ticket.attachments.pull(req.params.attachmentId);
    ticket.updatedAt = Date.now();
    await ticket.save();
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error removing attachment', error: error.message });
  }
});

module.exports = router;