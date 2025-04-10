const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  joinedAt: {
    type: Date,
    default: () => new Date(Date.now()).toISOString()
  }
});

const TeamSchema = new mongoose.Schema({
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
  members: [TeamMemberSchema],
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
TeamSchema.pre('save', function(next) {
  this.updatedAt = new Date(Date.now()).toISOString();
  next();
});

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;