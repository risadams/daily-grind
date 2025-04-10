const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
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
RoleSchema.pre('save', function(next) {
  this.updatedAt = new Date(Date.now()).toISOString();
  next();
});

const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;