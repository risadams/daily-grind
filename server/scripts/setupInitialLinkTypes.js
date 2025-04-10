const mongoose = require('mongoose');
const LinkType = require('../models/linkType');
const Ticket = require('../models/ticket');
const connectToMongoDB = require('../config/mongodb/connection');

// Initial link type definitions
const initialLinkTypes = [
  {
    name: 'Related',
    description: 'Tickets are generally related or connected',
    inverse: 'Related',
    icon: 'link',
    color: '#6B7280' // Gray
  },
  {
    name: 'Blocks',
    description: 'This ticket blocks another ticket from proceeding',
    inverse: 'Blocked by',
    icon: 'ban',
    color: '#EF4444' // Red
  },
  {
    name: 'Blocked by',
    description: 'This ticket is blocked by another ticket',
    inverse: 'Blocks',
    icon: 'lock',
    color: '#EF4444' // Red
  },
  {
    name: 'Duplicates',
    description: 'This ticket duplicates another ticket',
    inverse: 'Duplicated by',
    icon: 'copy',
    color: '#8B5CF6' // Purple
  },
  {
    name: 'Duplicated by',
    description: 'This ticket is duplicated by another ticket',
    inverse: 'Duplicates',
    icon: 'clone',
    color: '#8B5CF6' // Purple
  },
  {
    name: 'Depends on',
    description: 'This ticket depends on another ticket',
    inverse: 'Required by',
    icon: 'arrow-right',
    color: '#3B82F6' // Blue
  },
  {
    name: 'Required by',
    description: 'This ticket is required by another ticket',
    inverse: 'Depends on',
    icon: 'arrow-left',
    color: '#3B82F6' // Blue
  },
  {
    name: 'Causes',
    description: 'This ticket causes another issue',
    inverse: 'Caused by',
    icon: 'exclamation-triangle',
    color: '#F59E0B' // Amber
  },
  {
    name: 'Caused by',
    description: 'This ticket is caused by another issue',
    inverse: 'Causes',
    icon: 'exclamation-circle',
    color: '#F59E0B' // Amber
  },
  {
    name: 'Child of',
    description: 'This ticket is a child of another ticket',
    inverse: 'Parent of',
    icon: 'level-up-alt',
    color: '#10B981' // Green
  },
  {
    name: 'Parent of',
    description: 'This ticket is a parent of another ticket',
    inverse: 'Child of',
    icon: 'level-down-alt',
    color: '#10B981' // Green
  }
];

// Function to set up initial link types
async function setupInitialLinkTypes() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('Connected to MongoDB');

    // Create link types
    const linkTypeMap = {};
    let relatedLinkTypeId = null;
    
    for (const linkTypeData of initialLinkTypes) {
      const existingLinkType = await LinkType.findOne({ name: linkTypeData.name });
      
      if (!existingLinkType) {
        console.log(`Creating link type: ${linkTypeData.name}`);
        const newLinkType = new LinkType(linkTypeData);
        const savedLinkType = await newLinkType.save();
        linkTypeMap[linkTypeData.name] = savedLinkType._id;
        
        // Store the 'Related' link type ID for default links
        if (linkTypeData.name === 'Related') {
          relatedLinkTypeId = savedLinkType._id;
        }
      } else {
        console.log(`Link type already exists: ${linkTypeData.name}`);
        linkTypeMap[linkTypeData.name] = existingLinkType._id;
        
        // Store the 'Related' link type ID for default links
        if (linkTypeData.name === 'Related') {
          relatedLinkTypeId = existingLinkType._id;
        }
      }
    }

    console.log('Link types setup complete!');
    console.log('Default "Related" link type ID:', relatedLinkTypeId);
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up link types:', error);
    process.exit(1);
  }
}

// Run the script
setupInitialLinkTypes();