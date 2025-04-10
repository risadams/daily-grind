const mongoose = require('mongoose');

const LinkTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  // The inverse relationship (e.g., "Blocks" is the inverse of "Blocked by")
  inverse: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'link' // Default font awesome icon name
  },
  color: {
    type: String,
    default: '#6B7280' // Default gray color
  },
  createdAt: {
    type: Date,
    default: () => new Date(Date.now()).toISOString()
  },
  updatedAt: {
    type: Date,
    default: () => new Date(Date.now()).toISOString()
  }
});

// Update the updatedAt field before saving
LinkTypeSchema.pre('save', function(next) {
  this.updatedAt = new Date(Date.now()).toISOString();
  next();
});

const LinkType = mongoose.model('LinkType', LinkTypeSchema);

module.exports = LinkType;