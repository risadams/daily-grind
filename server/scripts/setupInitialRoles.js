const mongoose = require('mongoose');
const Role = require('../models/role');
const connectToMongoDB = require('../config/mongodb/connection');

// Define standard agile roles
const standardRoles = [
  {
    name: 'Product Owner',
    description: 'Responsible for maximizing the value of the product by creating and managing the product backlog.'
  },
  {
    name: 'Scrum Master',
    description: 'Facilitates the Scrum process and helps remove impediments for the team.'
  },
  {
    name: 'Developer',
    description: 'Team member responsible for creating and delivering increments of the product.'
  },
  {
    name: 'QA Engineer',
    description: 'Responsible for ensuring product quality through testing and quality assurance processes.'
  },
  {
    name: 'UX Designer',
    description: 'Focuses on designing the user experience and interface of the product.'
  },
  {
    name: 'Business Analyst',
    description: 'Analyzes business needs and translates them into requirements and user stories.'
  },
  {
    name: 'Technical Lead',
    description: 'Provides technical guidance and leadership to the development team.'
  },
  {
    name: 'DevOps Engineer',
    description: 'Manages deployment, infrastructure, and continuous integration/continuous deployment processes.'
  },
  {
    name: 'Team Lead',
    description: 'Provides leadership and coordinates the team\'s efforts.'
  }
];

// Function to set up initial roles
async function setupInitialRoles() {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    console.log('Connected to MongoDB successfully');

    // Count existing roles
    const roleCount = await Role.countDocuments();
    console.log(`Current role count: ${roleCount}`);

    // Only add roles if none exist
    if (roleCount === 0) {
      console.log('No roles found, adding standard roles...');
      
      // Insert all standard roles
      const result = await Role.insertMany(standardRoles);
      console.log(`Successfully added ${result.length} standard roles`);
    } else {
      console.log('Roles already exist, skipping initial setup');
    }

    // Disconnect from MongoDB
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    
    return { success: true, message: 'Roles setup complete' };
  } catch (error) {
    console.error('Error setting up roles:', error);
    
    // Ensure MongoDB connection is closed even if there's an error
    try {
      await mongoose.connection.close();
      console.log('Disconnected from MongoDB');
    } catch (err) {
      console.error('Error disconnecting from MongoDB:', err);
    }
    
    return { success: false, error: error.message };
  }
}

// Run the setup function if this script is executed directly
if (require.main === module) {
  setupInitialRoles()
    .then(result => {
      if (result.success) {
        console.log(result.message);
        process.exit(0);
      } else {
        console.error(result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}

module.exports = setupInitialRoles;