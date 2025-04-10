// Script to generate sample data for all models in the application
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const faker = require('faker');
const { program } = require('commander');
const path = require('path');
const fs = require('fs');

// Import models
const User = require('../models/user');
const Team = require('../models/team');
const Role = require('../models/role');
const Status = require('../models/status');
const Priority = require('../models/priority');
const Label = require('../models/label');
const LinkType = require('../models/linkType');
const Feature = require('../models/feature');
const Epic = require('../models/epic');
const Sprint = require('../models/sprint');
const Ticket = require('../models/ticket');
const Retrospective = require('../models/retrospective');

// Configuration
program
  .option('-c, --count <number>', 'number of sample items to generate for each model', 10)
  .option('-d, --delete', 'delete all existing data before generating new data', false)
  .option('--db <string>', 'MongoDB connection string', 'mongodb://localhost:27017/daily-grind')
  .parse(process.argv);

const options = program.opts();
const COUNT = parseInt(options.count);
const DELETE_EXISTING = options.delete;
const DB_URI = options.db;

// Store created entities for reference
const createdData = {
  users: [],
  teams: [],
  roles: [],
  statuses: [],
  priorities: [],
  labels: [],
  linkTypes: [],
  features: [],
  epics: [],
  sprints: [],
  tickets: [],
  retrospectives: []
};

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random items from array
const getRandomItems = (array, min = 0, max = 3) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to get date between range
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Connect to MongoDB
console.log(`Connecting to MongoDB at ${DB_URI}...`);
mongoose.connect(DB_URI)
  .then(() => {
    console.log('MongoDB connection successful');
    startDataGeneration();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Main function to start data generation
async function startDataGeneration() {
  try {
    if (DELETE_EXISTING) {
      console.log('Deleting all existing data...');
      await deleteAllData();
    }

    console.log(`Generating ${COUNT} sample items for each model...`);
    
    // Generate data for each model in the correct order to handle references
    await generateUsers();
    await generateTeams();
    await generateRoles();
    await generateStatuses();
    await generatePriorities();
    await generateLabels();
    await generateLinkTypes();
    await generateFeatures();
    await generateEpics();
    await generateSprints();
    await generateTickets();
    await generateRetrospectives();
    
    // Update sprint tickets
    await updateSprintTickets();
    
    console.log('Sample data generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating sample data:', error);
    process.exit(1);
  }
}

// Delete all data from all collections
async function deleteAllData() {
  await User.deleteMany({});
  await Team.deleteMany({});
  await Role.deleteMany({});
  await Status.deleteMany({});
  await Priority.deleteMany({});
  await Label.deleteMany({});
  await LinkType.deleteMany({});
  await Feature.deleteMany({});
  await Epic.deleteMany({});
  await Sprint.deleteMany({});
  await Ticket.deleteMany({});
  await Retrospective.deleteMany({});
}

// Generate Users
async function generateUsers() {
  console.log('Generating users...');
  
  // Create admin user
  const adminUser = new User({
    email: 'admin@dailygrind.com',
    password: await bcrypt.hash('admin123', 10),
    displayName: 'Admin User',
    photoURL: `https://i.pravatar.cc/150?u=admin@dailygrind.com`,
    emailVerified: true
  });
  createdData.users.push(await adminUser.save());
  
  // Create regular users
  for (let i = 0; i < COUNT; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName).toLowerCase();
    
    const user = new User({
      email,
      password: await bcrypt.hash('password123', 10),
      displayName: `${firstName} ${lastName}`,
      photoURL: `https://i.pravatar.cc/150?u=${email}`,
      emailVerified: Math.random() > 0.2
    });
    
    createdData.users.push(await user.save());
  }
  
  console.log(`Generated ${createdData.users.length} users`);
}

// Generate Teams
async function generateTeams() {
  console.log('Generating teams...');
  
  const teamNames = [
    'Coffee Crew', 'Espresso Express', 'Bean Believers', 
    'Latte Legends', 'Mocha Masters', 'Cappuccino Coders', 
    'Java Jedis', 'Brew Brigade', 'Grind Guild', 'Frappuccino Force'
  ];
  
  for (let i = 0; i < Math.min(COUNT, teamNames.length); i++) {
    // Get random users to be team members
    const randomUsers = getRandomItems(createdData.users.map(u => u._id), 3, 8);
    
    // Create proper team member objects with user field
    const members = randomUsers.map(userId => ({
      user: userId,
      roles: [] // Empty roles for now
    }));
    
    const team = new Team({
      name: teamNames[i],
      description: faker.lorem.sentence(),
      members: members,
      lead: getRandomItem(createdData.users)._id,
      createdBy: getRandomItem(createdData.users)._id
    });
    
    createdData.teams.push(await team.save());
  }
  
  console.log(`Generated ${createdData.teams.length} teams`);
}

// Generate Roles
async function generateRoles() {
  console.log('Generating roles...');
  
  const defaultRoles = [
    { name: 'Developer', description: 'Software developer who implements features' },
    { name: 'Product Owner', description: 'Represents the customer and manages the product backlog' },
    { name: 'Scrum Master', description: 'Facilitates the team and removes impediments' },
    { name: 'Designer', description: 'Creates UI/UX designs for features' },
    { name: 'QA Engineer', description: 'Tests features and ensures quality' },
    { name: 'DevOps Engineer', description: 'Manages infrastructure and CI/CD pipelines' },
    { name: 'Tech Lead', description: 'Provides technical guidance to the team' }
  ];
  
  for (let role of defaultRoles) {
    const newRole = new Role({
      name: role.name,
      description: role.description,
      createdBy: getRandomItem(createdData.users)._id
    });
    
    createdData.roles.push(await newRole.save());
  }
  
  console.log(`Generated ${createdData.roles.length} roles`);
}

// Generate Statuses
async function generateStatuses() {
  console.log('Generating statuses...');
  
  const defaultStatuses = [
    { name: 'Backlog', description: 'Not yet prioritized for work', color: '#6c757d', disposition: 'open' },
    { name: 'To Do', description: 'Prioritized for the current sprint', color: '#007bff', disposition: 'open' },
    { name: 'In Progress', description: 'Currently being worked on', color: '#ffc107', disposition: 'open' },
    { name: 'In Review', description: 'Code complete and in review', color: '#17a2b8', disposition: 'open' },
    { name: 'QA', description: 'In quality assurance testing', color: '#6f42c1', disposition: 'open' },
    { name: 'Done', description: 'Completed and ready for release', color: '#28a745', disposition: 'closed' }
  ];
  
  for (let status of defaultStatuses) {
    const newStatus = new Status({
      name: status.name,
      description: status.description,
      color: status.color,
      disposition: status.disposition,
      createdBy: getRandomItem(createdData.users)._id
    });
    
    createdData.statuses.push(await newStatus.save());
  }
  
  console.log(`Generated ${createdData.statuses.length} statuses`);
}

// Generate Priorities
async function generatePriorities() {
  console.log('Generating priorities...');
  
  const defaultPriorities = [
    { name: 'Critical', description: 'Must be fixed immediately', color: '#dc3545', level: 1 },
    { name: 'High', description: 'Important feature or bug with significant impact', color: '#fd7e14', level: 2 },
    { name: 'Medium', description: 'Standard priority for most work', color: '#ffc107', level: 3 },
    { name: 'Low', description: 'Nice to have, but not urgent', color: '#20c997', level: 4 },
    { name: 'Trivial', description: 'Minor improvements or non-essential tasks', color: '#6c757d', level: 5 }
  ];
  
  for (let priority of defaultPriorities) {
    const newPriority = new Priority({
      name: priority.name,
      description: priority.description,
      color: priority.color,
      level: priority.level,
      createdBy: getRandomItem(createdData.users)._id
    });
    
    createdData.priorities.push(await newPriority.save());
  }
  
  console.log(`Generated ${createdData.priorities.length} priorities`);
}

// Generate Labels
async function generateLabels() {
  console.log('Generating labels...');
  
  const defaultLabels = [
    { name: 'Bug', description: 'Something is not working correctly', color: '#dc3545' },
    { name: 'Feature', description: 'New functionality', color: '#28a745' },
    { name: 'Enhancement', description: 'Improvement to existing functionality', color: '#17a2b8' },
    { name: 'Documentation', description: 'Improvements to documentation', color: '#6c757d' },
    { name: 'UI', description: 'User interface related', color: '#fd7e14' },
    { name: 'API', description: 'API related work', color: '#6f42c1' },
    { name: 'Technical Debt', description: 'Code refactoring and improvements', color: '#007bff' },
    { name: 'Security', description: 'Security related issues', color: '#dc3545' }
  ];
  
  for (let label of defaultLabels) {
    const newLabel = new Label({
      name: label.name,
      description: label.description,
      color: label.color,
      createdBy: getRandomItem(createdData.users)._id
    });
    
    createdData.labels.push(await newLabel.save());
  }
  
  console.log(`Generated ${createdData.labels.length} labels`);
}

// Generate Link Types
async function generateLinkTypes() {
  console.log('Generating link types...');
  
  const defaultLinkTypes = [
    { name: 'Blocks', description: 'This ticket blocks another ticket', inward: 'is blocked by', outward: 'blocks' },
    { name: 'Relates to', description: 'Tickets are related', inward: 'relates to', outward: 'relates to' },
    { name: 'Duplicates', description: 'This is a duplicate of another ticket', inward: 'is duplicated by', outward: 'duplicates' },
    { name: 'Parent of', description: 'This ticket is a parent of another ticket', inward: 'is child of', outward: 'is parent of' }
  ];
  
  for (let linkType of defaultLinkTypes) {
    const newLinkType = new LinkType({
      name: linkType.name,
      description: linkType.description,
      inwardLabel: linkType.inward,
      outwardLabel: linkType.outward,
      createdBy: getRandomItem(createdData.users)._id
    });
    
    createdData.linkTypes.push(await newLinkType.save());
  }
  
  console.log(`Generated ${createdData.linkTypes.length} link types`);
}

// Generate Features
async function generateFeatures() {
  console.log('Generating features...');
  
  const featureTitles = [
    'User Authentication', 'Dashboard Analytics', 'Reporting Module',
    'Mobile Responsiveness', 'Notification System', 'Search Functionality',
    'Task Assignment', 'Comments System', 'File Uploads',
    'Export to PDF/Excel', 'Email Integration', 'Calendar View'
  ];
  
  for (let i = 0; i < Math.min(COUNT, featureTitles.length); i++) {
    const feature = new Feature({
      title: featureTitles[i],
      description: faker.lorem.paragraph(),
      priority: getRandomItem(createdData.priorities)._id,
      team: getRandomItem(createdData.teams)._id,
      status: getRandomItem(createdData.statuses)._id,
      createdBy: getRandomItem(createdData.users)._id
    });
    
    createdData.features.push(await feature.save());
  }
  
  console.log(`Generated ${createdData.features.length} features`);
}

// Generate Epics
async function generateEpics() {
  console.log('Generating epics...');
  
  const epicTitles = [
    'User Management', 'Reporting Dashboard', 'Sprint Planning',
    'Mobile App Support', 'Authentication System', 'Analytics Platform',
    'Team Collaboration Tools', 'API Integration', 'Performance Optimization'
  ];
  
  for (let i = 0; i < Math.min(COUNT, epicTitles.length); i++) {
    const epic = new Epic({
      title: epicTitles[i],
      description: faker.lorem.paragraphs(2),
      status: getRandomItem(createdData.statuses)._id,
      priority: getRandomItem(createdData.priorities)._id, // Add priority field
      features: getRandomItems(createdData.features.map(f => f._id), 1, 3),
      team: getRandomItem(createdData.teams)._id,
      createdBy: getRandomItem(createdData.users)._id
    });
    
    createdData.epics.push(await epic.save());
  }
  
  console.log(`Generated ${createdData.epics.length} epics`);
}

// Generate Sprints
async function generateSprints() {
  console.log('Generating sprints...');
  
  // Generate sprints for the past, present and future
  const today = new Date();
  
  // Past sprints (completed)
  for (let i = 0; i < Math.floor(COUNT / 2); i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (i + 1) * 14);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 13);
    
    const sprint = new Sprint({
      name: `Sprint ${COUNT - i}`,
      startDate,
      endDate,
      goal: faker.lorem.sentence(),
      capacity: Math.floor(Math.random() * 30) + 30,
      velocity: Math.floor(Math.random() * 30),
      status: 'completed',
      createdBy: getRandomItem(createdData.users)._id
    });
    
    createdData.sprints.push(await sprint.save());
  }
  
  // Current sprint (active)
  const currentStartDate = new Date(today);
  currentStartDate.setDate(today.getDate() - Math.floor(Math.random() * 7));
  const currentEndDate = new Date(currentStartDate);
  currentEndDate.setDate(currentStartDate.getDate() + 13);
  
  const activeSprint = new Sprint({
    name: 'Current Sprint',
    startDate: currentStartDate,
    endDate: currentEndDate,
    goal: 'Complete core functionality for the MVP release',
    capacity: Math.floor(Math.random() * 30) + 30,
    velocity: 0, // Will be calculated later
    status: 'active',
    createdBy: getRandomItem(createdData.users)._id
  });
  
  createdData.sprints.push(await activeSprint.save());
  
  // Future sprints (planning)
  for (let i = 0; i < Math.floor(COUNT / 2); i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + i * 14);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 13);
    
    const sprint = new Sprint({
      name: `Future Sprint ${i + 1}`,
      startDate,
      endDate,
      goal: faker.lorem.sentence(),
      capacity: Math.floor(Math.random() * 30) + 30,
      velocity: 0,
      status: 'planning',
      createdBy: getRandomItem(createdData.users)._id
    });
    
    createdData.sprints.push(await sprint.save());
  }
  
  console.log(`Generated ${createdData.sprints.length} sprints`);
}

// Generate Tickets
async function generateTickets() {
  console.log('Generating tickets...');
  
  const ticketTypes = [
    'Bug', 'Feature', 'Task', 'Improvement', 'Technical Debt', 'Documentation'
  ];
  
  for (let i = 0; i < COUNT * 3; i++) {
    const type = getRandomItem(ticketTypes);
    const title = `[${type}] ${faker.company.bs()}`;
    
    const ticket = new Ticket({
      title,
      description: faker.lorem.paragraphs(Math.floor(Math.random() * 3) + 1),
      status: getRandomItem(createdData.statuses)._id,
      priority: getRandomItem(createdData.priorities)._id,
      storyPoints: [0, 1, 2, 3, 5, 8, 13][Math.floor(Math.random() * 7)],
      labels: getRandomItems(createdData.labels.map(l => l._id), 0, 3),
      feature: Math.random() > 0.3 ? getRandomItem(createdData.features)._id : null,
      createdBy: getRandomItem(createdData.users)._id,
      assignedTo: Math.random() > 0.2 ? getRandomItem(createdData.users)._id : null,
      reviewedBy: Math.random() > 0.7 ? getRandomItem(createdData.users)._id : null,
    });
    
    // Add attachments to some tickets
    if (Math.random() > 0.7) {
      ticket.attachments = [{
        fileName: `attachment-${faker.lorem.word()}.pdf`,
        fileUrl: `https://example.com/files/attachment-${i}.pdf`,
        uploadedAt: new Date()
      }];
    }
    
    createdData.tickets.push(await ticket.save());
  }
  
  // Set up some ticket links
  const linkCount = Math.min(COUNT * 2, createdData.tickets.length / 2);
  for (let i = 0; i < linkCount; i++) {
    const sourceTicket = getRandomItem(createdData.tickets);
    let targetTicket;
    
    // Make sure we don't link a ticket to itself
    do {
      targetTicket = getRandomItem(createdData.tickets);
    } while (targetTicket._id.equals(sourceTicket._id));
    
    const linkType = getRandomItem(createdData.linkTypes);
    
    // Only add the link if it doesn't already exist
    if (!sourceTicket.links.some(l => 
      l.linkedTicket.equals(targetTicket._id) && 
      l.linkType.equals(linkType._id))) {
      
      sourceTicket.links.push({
        linkedTicket: targetTicket._id,
        linkType: linkType._id,
        createdAt: new Date()
      });
      
      await sourceTicket.save();
    }
  }
  
  console.log(`Generated ${createdData.tickets.length} tickets and ${linkCount} ticket links`);
}

// Generate Retrospectives
async function generateRetrospectives() {
  console.log('Generating retrospectives...');
  
  // Generate retrospectives for completed sprints
  const completedSprints = createdData.sprints.filter(s => s.status === 'completed');
  
  for (let sprint of completedSprints) {
    const retrospective = new Retrospective({
      sprint: sprint._id,
      highlights: [
        faker.lorem.sentence(),
        faker.lorem.sentence(),
        faker.lorem.sentence()
      ],
      improvements: [
        faker.lorem.sentence(),
        faker.lorem.sentence()
      ],
      actions: [
        "Update the sprint planning process",
        "Schedule more regular code reviews", 
        "Improve documentation practices"
      ],
      facilitator: getRandomItem(createdData.users)._id,
      participants: getRandomItems(createdData.users.map(u => u._id), 3, 7),
      createdBy: getRandomItem(createdData.users)._id
    });
    
    const savedRetro = await retrospective.save();
    createdData.retrospectives.push(savedRetro);
    
    // Update the sprint with the retrospective
    sprint.retrospective = savedRetro._id;
    await sprint.save();
  }
  
  console.log(`Generated ${createdData.retrospectives.length} retrospectives`);
}

// Update Sprint Tickets
async function updateSprintTickets() {
  console.log('Updating sprint tickets...');
  
  // Assign tickets to sprints
  for (let sprint of createdData.sprints) {
    // Different distribution of tickets based on sprint status
    let ticketsToAssign = [];
    
    switch (sprint.status) {
      case 'completed':
        // For completed sprints, mostly done tickets 
        ticketsToAssign = createdData.tickets
          .filter(t => !t.sprints.length && 
                Math.random() > 0.7 && 
                (t.status.toString() === createdData.statuses.find(s => s.name === 'Done')._id.toString()))
          .slice(0, Math.floor(Math.random() * 10) + 5);
        break;
      
      case 'active':
        // For active sprint, tickets in various statuses
        ticketsToAssign = createdData.tickets
          .filter(t => !t.sprints.length && Math.random() > 0.5)
          .slice(0, Math.floor(Math.random() * 15) + 10);
        break;
      
      case 'planning':
        // For future sprints, mostly backlog and todo tickets
        ticketsToAssign = createdData.tickets
          .filter(t => !t.sprints.length && 
                Math.random() > 0.8 && 
                (t.status.toString() === createdData.statuses.find(s => s.name === 'Backlog')?._id.toString() ||
                 t.status.toString() === createdData.statuses.find(s => s.name === 'To Do')?._id.toString()))
          .slice(0, Math.floor(Math.random() * 8) + 3);
        break;
    }
    
    // Add tickets to sprint
    for (let ticket of ticketsToAssign) {
      ticket.sprints.push(sprint._id);
      await ticket.save();
    }
    
    // Update sprint tickets array and velocity for completed sprints
    const sprintTickets = createdData.tickets.filter(t => 
      t.sprints.some(s => s.toString() === sprint._id.toString())
    );
    
    sprint.tickets = sprintTickets.map(t => t._id);
    
    if (sprint.status === 'completed') {
      // Calculate sprint velocity based on completed tickets
      const doneStatus = createdData.statuses.find(s => s.name === 'Done')?._id.toString();
      const completedTickets = sprintTickets.filter(t => 
        t.status.toString() === doneStatus
      );
      sprint.velocity = completedTickets.reduce((total, ticket) => total + (ticket.storyPoints || 0), 0);
    }
    
    await sprint.save();
  }
  
  console.log('Updated sprint tickets and velocity');
}

// Run the script
console.log('Starting sample data generation script...');