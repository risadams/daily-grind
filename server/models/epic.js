const mongoose = require('mongoose');

const EpicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    trim: true
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Status',
    required: true
  },
  priority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Priority',
    required: true
  },
  labels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Label'
  }],
  storyPoints: {
    type: Number,
    min: 0,
    default: 0
  },
  startDate: {
    type: Date,
    default: null
  },
  targetDate: {
    type: Date,
    default: null
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: () => new Date(Date.now()).toISOString()
  },
  updatedAt: {
    type: Date,
    default: () => new Date(Date.now()).toISOString()
  },
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: () => new Date(Date.now()).toISOString()
      }
    }
  ]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for progress tracking - calculated based on associated features
EpicSchema.virtual('progress').get(function() {
  return {
    planned: 0, // to be calculated dynamically
    completed: 0, // to be calculated dynamically
    percentage: 0 // to be calculated dynamically
  };
});

// Update the updatedAt field before saving
EpicSchema.pre('save', function(next) {
  this.updatedAt = new Date(Date.now()).toISOString();
  next();
});

const Epic = mongoose.model('Epic', EpicSchema);

module.exports = Epic;