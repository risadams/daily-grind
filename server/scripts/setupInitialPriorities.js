const mongoose = require('mongoose');
const Priority = require('../models/priority');
const Ticket = require('../models/ticket');
const connectToMongoDB = require('../config/mongodb/connection');

// Initial priority definitions
const initialPriorities = [
  {
    name: 'Low',
    level: 0,
    icon: 'flag',
    color: '#10B981' // Green
  },
  {
    name: 'Medium',
    level: 1,
    icon: 'flag',
    color: '#F59E0B' // Yellow/Amber
  },
  {
    name: 'High',
    level: 2,
    icon: 'exclamation',
    color: '#EF4444' // Red
  },
  {
    name: 'Urgent',
    level: 3,
    icon: 'exclamation-triangle',
    color: '#7F1D1D' // Dark Red
  }
];

// Function to migrate priority enum to Priority collection
async function setupInitialPriorities() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('Connected to MongoDB');

    // Create priorities
    const priorityMap = {};
    
    for (const priorityData of initialPriorities) {
      const existingPriority = await Priority.findOne({ name: priorityData.name });
      
      if (!existingPriority) {
        console.log(`Creating priority: ${priorityData.name}`);
        const newPriority = new Priority(priorityData);
        const savedPriority = await newPriority.save();
        priorityMap[priorityData.name.toLowerCase()] = savedPriority._id;
      } else {
        console.log(`Priority already exists: ${priorityData.name}`);
        priorityMap[priorityData.name.toLowerCase()] = existingPriority._id;
      }
    }

    // Get default "Medium" priority for updating existing tickets
    const defaultPriority = await Priority.findOne({ name: 'Medium' });
    
    if (defaultPriority) {
      // Update any existing tickets with string priorities to use the new priority reference
      const ticketCount = await Ticket.countDocuments({ priority: { $type: 'string' } });
      
      if (ticketCount > 0) {
        console.log(`Updating ${ticketCount} tickets with string priority to use priority reference`);
        
        const priorityMappings = {
          'low': priorityMap['low'],
          'medium': priorityMap['medium'],
          'high': priorityMap['high'],
          'urgent': priorityMap['urgent']
        };

        // Update tickets with priorityMappings if they exist, otherwise use default
        for (const [stringPriority, priorityId] of Object.entries(priorityMappings)) {
          if (priorityId) {
            await Ticket.updateMany(
              { priority: stringPriority },
              { $set: { priority: priorityId } }
            );
          }
        }
        
        // Update any remaining tickets with string priority to default
        await Ticket.updateMany(
          { priority: { $type: 'string' } },
          { $set: { priority: defaultPriority._id } }
        );
      }
    }

    console.log('Priority setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up priorities:', error);
    process.exit(1);
  }
}

// Run the script
setupInitialPriorities();