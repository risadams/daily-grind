const mongoose = require('mongoose');

const PrioritySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  icon: {
    type: String,
    default: 'flag' // Default font awesome icon name
  },
  color: {
    type: String,
    default: '#6B7280' // Default gray color
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
PrioritySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Priority = mongoose.model('Priority', PrioritySchema);

module.exports = Priority;