const mongoose = require('mongoose');

const TaskLinkSchema = new mongoose.Schema({
  linkedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  linkType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LinkType',
    required: true
  },
  createdAt: {
    type: Date,
    default: () => new Date(Date.now()).toISOString()
  }
});

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Status',
    required: false
  },
  priority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Priority',
    required: false
  },
  storyPoints: {
    type: Number,
    min: 0,
    default: 0
  },
  sprints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint'
  }],
  labels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Label'
  }],
  feature: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature',
    default: null
  },
  links: [TaskLinkSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedBy: {
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

// Calculate the splash count - number of times a task has "splashed" from one sprint to another
TaskSchema.virtual('splashCount').get(function() {
  // If the task is in 0 or 1 sprints, splashCount is 0
  // Otherwise, splashCount is (number of sprints - 1)
  const sprintCount = this.sprints ? this.sprints.length : 0;
  return sprintCount <= 1 ? 0 : sprintCount - 1;
});

// Update the updatedAt field before saving and set default status and priority if not provided
TaskSchema.pre('save', async function(next) {
  this.updatedAt = new Date(Date.now()).toISOString();
  
  try {
    // If no status is provided, set to default "To Do" or "Backlog" status
    if (!this.status) {
      const Status = mongoose.model('Status');
      // Try to find "To Do" status first, then "Backlog", then just use first status
      const defaultStatus = await Status.findOne({ name: { $in: ['To Do', 'ToDo', 'Backlog'] } })
        || await Status.findOne();
        
      if (defaultStatus) {
        this.status = defaultStatus._id;
      }
    }
    
    // If no priority is provided, set to default "Medium" priority
    if (!this.priority) {
      const Priority = mongoose.model('Priority');
      const defaultPriority = await Priority.findOne({ name: 'Medium' })
        || await Priority.findOne();
        
      if (defaultPriority) {
        this.priority = defaultPriority._id;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;