const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      // Only require password for local auth (not for OAuth users)
      return !this.googleId;
    }
  },
  displayName: {
    type: String,
    required: true
  },
  photoURL: {
    type: String,
    default: ''
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  emailVerified: {
    type: Boolean,
    default: false
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

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it exists and was modified
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check password validity
UserSchema.methods.isValidPassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;