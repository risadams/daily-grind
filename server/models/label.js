const mongoose = require('mongoose');

const LabelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    set: value => value.toLowerCase() // Automatically convert label names to lowercase
  },
  color: {
    type: String,
    default: '#6B7280' // Default gray color
  },
  description: {
    type: String,
    trim: true
  },
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
LabelSchema.pre('save', function(next) {
  this.updatedAt = new Date(Date.now()).toISOString();
  next();
});

const Label = mongoose.model('Label', LabelSchema);

module.exports = Label;