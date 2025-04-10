const mongoose = require('mongoose');
const Status = require('../models/status');
const Task = require('../models/task');
const connectToMongoDB = require('../config/mongodb/connection');

// Initial status definitions
const initialStatuses = [
  {
    name: 'To Do',
    disposition: 'open',
    icon: 'clipboard-list',
    color: '#6B7280' // Gray
  },
  {
    name: 'In Progress',
    disposition: 'open',
    icon: 'spinner',
    color: '#3B82F6' // Blue
  },
  {
    name: 'In Review',
    disposition: 'open',
    icon: 'search',
    color: '#8B5CF6' // Purple
  },
  {
    name: 'Closed',
    disposition: 'closed',
    icon: 'check-circle',
    color: '#10B981' // Green
  },
  {
    name: "Won't Fix",
    disposition: 'closed',
    icon: 'times-circle',
    color: '#EF4444' // Red
  }
];

// Define workflow transitions
const workflows = {
  'To Do': ['In Progress', 'Closed', "Won't Fix"],
  'In Progress': ['In Review', 'Closed', "Won't Fix", 'To Do'],
  'In Review': ['To Do', 'In Progress', 'Closed', "Won't Fix"],
  'Closed': ['To Do'], // Can reopen to "To Do"
  "Won't Fix": ['To Do'] // Can be reconsidered and moved to "To Do"
};

// Function to migrate status enum to Status collection
async function setupInitialStatuses() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('Connected to MongoDB');

    // Create statuses without workflow references first
    const statusMap = {};
    
    for (const statusData of initialStatuses) {
      const existingStatus = await Status.findOne({ name: statusData.name });
      
      if (!existingStatus) {
        console.log(`Creating status: ${statusData.name}`);
        const newStatus = new Status(statusData);
        const savedStatus = await newStatus.save();
        statusMap[statusData.name] = savedStatus._id;
      } else {
        console.log(`Status already exists: ${statusData.name}`);
        statusMap[statusData.name] = existingStatus._id;
      }
    }

    // Now update each status with workflow references
    for (const [statusName, workflowStatuses] of Object.entries(workflows)) {
      const statusId = statusMap[statusName];
      if (!statusId) {
        console.log(`Status not found for workflow update: ${statusName}`);
        continue;
      }

      const workflowIds = workflowStatuses
        .map(name => statusMap[name])
        .filter(id => id); // Filter out any undefined IDs
      
      console.log(`Updating workflow for ${statusName} with ${workflowIds.length} transitions`);
      await Status.findByIdAndUpdate(statusId, { workflow: workflowIds });
    }

    // Get default "To Do" status for updating existing tasks
    const defaultStatus = await Status.findOne({ name: 'To Do' });
    
    if (defaultStatus) {
      // Update any existing tasks with string statuses to use the new status reference
      const taskCount = await Task.countDocuments({ status: { $type: 'string' } });
      
      if (taskCount > 0) {
        console.log(`Updating ${taskCount} tasks with string status to use status reference`);
        
        const statusMappings = {
          'open': statusMap['To Do'],
          'todo': statusMap['To Do'],
          'to do': statusMap['To Do'],
          'in progress': statusMap['In Progress'],
          'inprogress': statusMap['In Progress'],
          'in review': statusMap['In Review'],
          'review': statusMap['In Review'],
          'closed': statusMap['Closed'],
          'won\'t fix': statusMap["Won't Fix"],
          'wontfix': statusMap["Won't Fix"]
        };

        // Update tasks with statusMappings if they exist, otherwise use default
        for (const [stringStatus, statusId] of Object.entries(statusMappings)) {
          if (statusId) {
            await Task.updateMany(
              { status: stringStatus },
              { $set: { status: statusId } }
            );
          }
        }
        
        // Update any remaining tasks with string status to default
        await Task.updateMany(
          { status: { $type: 'string' } },
          { $set: { status: defaultStatus._id } }
        );
      }
    }

    console.log('Status setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up statuses:', error);
    process.exit(1);
  }
}

// Run the script
setupInitialStatuses();