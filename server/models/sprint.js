const mongoose = require('mongoose');

const SprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  goal: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    min: 0,
    default: 0
  },
  velocity: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Total story points actually completed during the sprint'
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  retrospective: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retrospective',
    default: null
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
SprintSchema.pre('save', function(next) {
  this.updatedAt = new Date(Date.now()).toISOString();
  next();
});

// Add validation to ensure endDate is after startDate
SprintSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate) {
    if (this.endDate < this.startDate) {
      this.invalidate('endDate', 'End date must be after start date');
    }
  }
  next();
});

const Sprint = mongoose.model('Sprint', SprintSchema);

module.exports = Sprint;