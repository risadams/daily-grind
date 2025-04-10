const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  disposition: {
    type: String,
    enum: ['open', 'closed'],
    required: true
  },
  icon: {
    type: String,
    default: 'circle' // Default font awesome icon name
  },
  color: {
    type: String,
    default: '#6B7280' // Default gray color
  },
  workflow: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Status'
  }],
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
StatusSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Status = mongoose.model('Status', StatusSchema);

module.exports = Status;