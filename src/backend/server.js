const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directory exists
const dbDirectory = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory);
}

// File paths for JSON data
const ticketsFilePath = path.join(dbDirectory, 'tickets.json');
const usersFilePath = path.join(dbDirectory, 'users.json');
const statesFilePath = path.join(dbDirectory, 'states.json');
const typesFilePath = path.join(dbDirectory, 'types.json');
const ticketLinksFilePath = path.join(dbDirectory, 'ticketLinks.json');

// Simple JSON file-based DB handlers
const ticketsDb = {
  read: () => {
    if (!fs.existsSync(ticketsFilePath)) {
      return { tickets: [] };
    }
    const data = fs.readFileSync(ticketsFilePath, 'utf8');
    return data ? JSON.parse(data) : { tickets: [] };
  },
  write: (data) => {
    fs.writeFileSync(ticketsFilePath, JSON.stringify(data, null, 2), 'utf8');
  }
};

const usersDb = {
  read: () => {
    if (!fs.existsSync(usersFilePath)) {
      return { users: [] };
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return data ? JSON.parse(data) : { users: [] };
  },
  write: (data) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf8');
  }
};

const statesDb = {
  read: () => {
    if (!fs.existsSync(statesFilePath)) {
      return { states: [] };
    }
    const data = fs.readFileSync(statesFilePath, 'utf8');
    return data ? JSON.parse(data) : { states: [] };
  },
  write: (data) => {
    fs.writeFileSync(statesFilePath, JSON.stringify(data, null, 2), 'utf8');
  }
};

const typesDb = {
  read: () => {
    if (!fs.existsSync(typesFilePath)) {
      return { types: [] };
    }
    const data = fs.readFileSync(typesFilePath, 'utf8');
    return data ? JSON.parse(data) : { types: [] };
  },
  write: (data) => {
    fs.writeFileSync(typesFilePath, JSON.stringify(data, null, 2), 'utf8');
  }
};

const ticketLinksDb = {
  read: () => {
    if (!fs.existsSync(ticketLinksFilePath)) {
      return { ticketLinks: [] };
    }
    const data = fs.readFileSync(ticketLinksFilePath, 'utf8');
    return data ? JSON.parse(data) : { ticketLinks: [] };
  },
  write: (data) => {
    fs.writeFileSync(ticketLinksFilePath, JSON.stringify(data, null, 2), 'utf8');
  }
};

// Initialize the databases with default data if they don't exist
function initializeDb() {
  // Initialize types if needed
  let typesData = typesDb.read();
  if (!typesData.types || typesData.types.length === 0) {
    typesData.types = [
      { id: 1, name: "Story", description: "User story representing customer value" },
      { id: 2, name: "Bug", description: "Software defect requiring correction" },
      { id: 3, name: "Task", description: "General work item" },
      { id: 4, name: "Feature", description: "Product feature" },
      { id: 5, name: "Epic", description: "Large body of work that can be broken down" }
    ];
    typesDb.write(typesData);
  }
  
  // Initialize states if needed
  let statesData = statesDb.read();
  if (!statesData.states || statesData.states.length === 0) {
    statesData.states = [
      { id: 1, name: "Created", active: true },
      { id: 2, name: "ToDo", active: true },
      { id: 3, name: "InProgress", active: true },
      { id: 4, name: "InReview", active: true },
      { id: 5, name: "Closed", active: false },
      { id: 6, name: "WontFix", active: false },
      { id: 7, name: "Duplicate", active: false }
    ];
    statesDb.write(statesData);
  }
  
  // Initialize users if needed
  let userData = usersDb.read();
  if (!userData.users || userData.users.length === 0) {
    userData.users = [
      {
        id: 1,
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com"
      },
      {
        id: 2,
        firstname: "Jane",
        lastname: "Smith",
        email: "jane.smith@example.com"
      },
      {
        id: 3,
        firstname: "Alex",
        lastname: "Johnson",
        email: "alex.johnson@example.com"
      }
    ];
    usersDb.write(userData);
  }
  
  // Initialize tickets if needed
  let ticketsData = ticketsDb.read();
  if (!ticketsData.tickets || ticketsData.tickets.length === 0) {
    ticketsData.tickets = [
      { 
        id: 1, 
        title: 'Fix login bug', 
        description: 'Users are unable to log in using social media accounts.',
        typeId: 2, // Bug
        stateId: 3, // InProgress
        priority: 'high',
        creationDate: new Date().toISOString(),
        createdByUserId: 1, // John Doe
        assignedToUserId: 2, // Jane Smith
        estimatedStoryPoints: 5,
        actualStoryPoints: 0,
        parentTicketId: null
      },
      { 
        id: 2, 
        title: 'Update documentation', 
        description: 'Add new API endpoints to the developer documentation.',
        typeId: 3, // Task
        stateId: 2, // ToDo
        priority: 'medium',
        creationDate: new Date().toISOString(),
        createdByUserId: 2, // Jane Smith
        assignedToUserId: null,
        estimatedStoryPoints: 2,
        actualStoryPoints: 0,
        parentTicketId: 1
      },
      { 
        id: 3, 
        title: 'Refactor code', 
        description: 'Improve code quality in the authentication module.',
        typeId: 3, // Task
        stateId: 5, // Closed
        priority: 'low',
        creationDate: new Date().toISOString(),
        createdByUserId: 3, // Alex Johnson
        assignedToUserId: 3, // Alex Johnson
        estimatedStoryPoints: 8,
        actualStoryPoints: 10,
        parentTicketId: null
      }
    ];
    ticketsDb.write(ticketsData);
  }

  // Initialize ticket links if needed
  let ticketLinksData = ticketLinksDb.read();
  if (!ticketLinksData.ticketLinks || ticketLinksData.ticketLinks.length === 0) {
    ticketLinksData.ticketLinks = [
      { id: 1, sourceTicketId: 2, targetTicketId: 1, type: "related" },
      { id: 2, sourceTicketId: 3, targetTicketId: 1, type: "blocks" }
    ];
    ticketLinksDb.write(ticketLinksData);
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// User routes
app.get('/api/users', (req, res) => {
  const data = usersDb.read();
  res.json(data.users);
});

app.get('/api/users/:id', (req, res) => {
  const data = usersDb.read();
  const user = data.users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/users', (req, res) => {
  const data = usersDb.read();
  const newId = data.users.length > 0 
    ? Math.max(...data.users.map(u => u.id)) + 1 
    : 1;
  
  const newUser = {
    id: newId,
    firstname: req.body.firstname || '',
    lastname: req.body.lastname || '',
    email: req.body.email || ''
  };
  
  data.users.push(newUser);
  usersDb.write(data);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const data = usersDb.read();
  const userId = parseInt(req.params.id);
  const userIndex = data.users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    const currentUser = data.users[userIndex];
    const updatedUser = {
      ...currentUser,
      firstname: req.body.firstname !== undefined ? req.body.firstname : currentUser.firstname,
      lastname: req.body.lastname !== undefined ? req.body.lastname : currentUser.lastname,
      email: req.body.email !== undefined ? req.body.email : currentUser.email
    };
    
    data.users[userIndex] = updatedUser;
    usersDb.write(data);
    res.json(updatedUser);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const data = usersDb.read();
  const userId = parseInt(req.params.id);
  const userIndex = data.users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    // Check if user is referenced in any tickets
    const ticketsData = ticketsDb.read();
    const isReferenced = ticketsData.tickets.some(
      t => t.createdByUserId === userId || t.assignedToUserId === userId
    );
    
    if (isReferenced) {
      res.status(409).json({ 
        error: 'Cannot delete user that is referenced in tickets. Reassign tickets first.' 
      });
    } else {
      data.users.splice(userIndex, 1);
      usersDb.write(data);
      res.status(204).end();
    }
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Add state routes
app.get('/api/states', (req, res) => {
  const data = statesDb.read();
  res.json(data.states);
});

app.get('/api/states/:id', (req, res) => {
  const data = statesDb.read();
  const state = data.states.find(s => s.id === parseInt(req.params.id));
  if (state) {
    res.json(state);
  } else {
    res.status(404).json({ error: 'State not found' });
  }
});

// Type routes
app.get('/api/types', (req, res) => {
  const data = typesDb.read();
  res.json(data.types);
});

app.get('/api/types/:id', (req, res) => {
  const data = typesDb.read();
  const type = data.types.find(t => t.id === parseInt(req.params.id));
  if (type) {
    res.json(type);
  } else {
    res.status(404).json({ error: 'Type not found' });
  }
});

// Ticket routes
app.get('/api/tickets', (req, res) => {
  const ticketsData = ticketsDb.read();
  const usersData = usersDb.read();
  const statesData = statesDb.read();
  const typesData = typesDb.read();
  const linksData = ticketLinksDb.read();
  
  // Enrich tickets with user, state, type details and add child/linked ticket info
  const enrichedTickets = ticketsData.tickets.map(ticket => {
    const createdByUser = usersData.users.find(u => u.id === ticket.createdByUserId) || null;
    const assignedToUser = usersData.users.find(u => u.id === ticket.assignedToUserId) || null;
    const state = statesData.states.find(s => s.id === ticket.stateId) || null;
    const type = typesData.types.find(t => t.id === ticket.typeId) || null;
    const parentTicket = ticket.parentTicketId ? 
      ticketsData.tickets.find(t => t.id === ticket.parentTicketId) : null;
    
    // Find child tickets (tickets that have this ticket as parent)
    const childTickets = ticketsData.tickets
      .filter(t => t.parentTicketId === ticket.id)
      .map(t => ({ id: t.id, title: t.title }));
    
    // Find linked tickets
    const linkedTickets = linksData.ticketLinks
      .filter(l => l.sourceTicketId === ticket.id || l.targetTicketId === ticket.id)
      .map(l => {
        const linkedTicketId = l.sourceTicketId === ticket.id ? l.targetTicketId : l.sourceTicketId;
        const linkedTicket = ticketsData.tickets.find(t => t.id === linkedTicketId);
        const direction = l.sourceTicketId === ticket.id ? 'outgoing' : 'incoming';
        
        return {
          linkId: l.id,
          ticketId: linkedTicketId,
          title: linkedTicket ? linkedTicket.title : 'Unknown',
          type: l.type,
          direction: direction
        };
      });
    
    return {
      ...ticket,
      createdByUser: createdByUser ? `${createdByUser.firstname} ${createdByUser.lastname}` : 'Unknown',
      assignedToUser: assignedToUser ? `${assignedToUser.firstname} ${assignedToUser.lastname}` : null,
      state: state ? state.name : 'Unknown',
      active: state ? state.active : null,
      type: type ? type.name : 'Unknown',
      parentTicket: parentTicket ? {
        id: parentTicket.id,
        title: parentTicket.title
      } : null,
      childTickets: childTickets,
      linkedTickets: linkedTickets
    };
  });
  
  res.json(enrichedTickets);
});

app.get('/api/tickets/:id', (req, res) => {
  const ticketsData = ticketsDb.read();
  const usersData = usersDb.read();
  const statesData = statesDb.read();
  const typesData = typesDb.read();
  const linksData = ticketLinksDb.read();
  
  const ticket = ticketsData.tickets.find(t => t.id === parseInt(req.params.id));
  
  if (ticket) {
    const createdByUser = usersData.users.find(u => u.id === ticket.createdByUserId) || null;
    const assignedToUser = usersData.users.find(u => u.id === ticket.assignedToUserId) || null;
    const state = statesData.states.find(s => s.id === ticket.stateId) || null;
    const type = typesData.types.find(t => t.id === ticket.typeId) || null;
    const parentTicket = ticket.parentTicketId ? 
      ticketsData.tickets.find(t => t.id === ticket.parentTicketId) : null;
    
    // Find child tickets (tickets that have this ticket as parent)
    const childTickets = ticketsData.tickets
      .filter(t => t.parentTicketId === ticket.id)
      .map(t => ({ id: t.id, title: t.title }));
    
    // Find linked tickets
    const linkedTickets = linksData.ticketLinks
      .filter(l => l.sourceTicketId === ticket.id || l.targetTicketId === ticket.id)
      .map(l => {
        const linkedTicketId = l.sourceTicketId === ticket.id ? l.targetTicketId : l.sourceTicketId;
        const linkedTicket = ticketsData.tickets.find(t => t.id === linkedTicketId);
        const direction = l.sourceTicketId === ticket.id ? 'outgoing' : 'incoming';
        
        return {
          linkId: l.id,
          ticketId: linkedTicketId,
          title: linkedTicket ? linkedTicket.title : 'Unknown',
          type: l.type,
          direction: direction
        };
      });
    
    const enrichedTicket = {
      ...ticket,
      createdByUser: createdByUser ? `${createdByUser.firstname} ${createdByUser.lastname}` : 'Unknown',
      assignedToUser: assignedToUser ? `${assignedToUser.firstname} ${assignedToUser.lastname}` : null,
      state: state ? state.name : 'Unknown',
      active: state ? state.active : null,
      type: type ? type.name : 'Unknown',
      parentTicket: parentTicket ? {
        id: parentTicket.id,
        title: parentTicket.title
      } : null,
      childTickets: childTickets,
      linkedTickets: linkedTickets
    };
    
    res.json(enrichedTicket);
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

app.post('/api/tickets', (req, res) => {
  const ticketsData = ticketsDb.read();
  const usersData = usersDb.read();
  const statesData = statesDb.read();
  const typesData = typesDb.read();
  
  // Validate user IDs if provided
  if (req.body.createdByUserId && !usersData.users.some(u => u.id === parseInt(req.body.createdByUserId))) {
    return res.status(400).json({ error: 'Created by user not found' });
  }
  
  if (req.body.assignedToUserId && !usersData.users.some(u => u.id === parseInt(req.body.assignedToUserId))) {
    return res.status(400).json({ error: 'Assigned to user not found' });
  }
  
  // Validate state ID if provided
  const stateId = req.body.stateId ? parseInt(req.body.stateId) : 1; // Default to "Created" state
  if (!statesData.states.some(s => s.id === stateId)) {
    return res.status(400).json({ error: 'Invalid state' });
  }
  
  // Validate type ID if provided
  const typeId = req.body.typeId ? parseInt(req.body.typeId) : 3; // Default to "Task"
  if (!typesData.types.some(t => t.id === typeId)) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  // Validate parent ticket ID if provided
  if (req.body.parentTicketId) {
    const parentTicketId = parseInt(req.body.parentTicketId);
    if (!ticketsData.tickets.some(t => t.id === parentTicketId)) {
      return res.status(400).json({ error: 'Parent ticket not found' });
    }
  }
  
  const newId = ticketsData.tickets.length > 0 
    ? Math.max(...ticketsData.tickets.map(t => t.id)) + 1 
    : 1;
  
  const newTicket = {
    id: newId,
    title: req.body.title || 'Untitled Ticket',
    description: req.body.description || '',
    typeId: typeId,
    stateId: stateId,
    priority: req.body.priority || 'medium',
    creationDate: new Date().toISOString(),
    createdByUserId: req.body.createdByUserId ? parseInt(req.body.createdByUserId) : null,
    assignedToUserId: req.body.assignedToUserId ? parseInt(req.body.assignedToUserId) : null,
    estimatedStoryPoints: req.body.estimatedStoryPoints !== undefined ? Number(req.body.estimatedStoryPoints) : 0,
    actualStoryPoints: req.body.actualStoryPoints !== undefined ? Number(req.body.actualStoryPoints) : 0,
    parentTicketId: req.body.parentTicketId ? parseInt(req.body.parentTicketId) : null
  };
  
  ticketsData.tickets.push(newTicket);
  ticketsDb.write(ticketsData);
  
  // Find user, state, and type details for response
  const createdByUser = usersData.users.find(u => u.id === newTicket.createdByUserId) || null;
  const assignedToUser = usersData.users.find(u => u.id === newTicket.assignedToUserId) || null;
  const state = statesData.states.find(s => s.id === newTicket.stateId) || null;
  const type = typesData.types.find(t => t.id === newTicket.typeId) || null;
  
  const enrichedTicket = {
    ...newTicket,
    createdByUser: createdByUser ? `${createdByUser.firstname} ${createdByUser.lastname}` : 'Unknown',
    assignedToUser: assignedToUser ? `${assignedToUser.firstname} ${assignedToUser.lastname}` : null,
    state: state ? state.name : 'Unknown',
    active: state ? state.active : null,
    type: type ? type.name : 'Unknown'
  };
  
  res.status(201).json(enrichedTicket);
});

app.put('/api/tickets/:id', (req, res) => {
  const ticketsData = ticketsDb.read();
  const usersData = usersDb.read();
  const statesData = statesDb.read();
  const typesData = typesDb.read();
  
  const ticketId = parseInt(req.params.id);
  const ticketIndex = ticketsData.tickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  // Validate user IDs if provided
  if (req.body.assignedToUserId && !usersData.users.some(u => u.id === parseInt(req.body.assignedToUserId))) {
    return res.status(400).json({ error: 'Assigned to user not found' });
  }
  
  // Validate state ID if provided
  if (req.body.stateId) {
    const stateId = parseInt(req.body.stateId);
    if (!statesData.states.some(s => s.id === stateId)) {
      return res.status(400).json({ error: 'Invalid state' });
    }
  }
  
  // Validate type ID if provided
  if (req.body.typeId) {
    const typeId = parseInt(req.body.typeId);
    if (!typesData.types.some(t => t.id === typeId)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
  }

  // Validate parent ticket ID if provided
  if (req.body.parentTicketId) {
    const parentTicketId = parseInt(req.body.parentTicketId);
    
    // Check if parent ticket exists
    if (!ticketsData.tickets.some(t => t.id === parentTicketId)) {
      return res.status(400).json({ error: 'Parent ticket not found' });
    }
    
    // Prevent circular references
    if (parentTicketId === ticketId) {
      return res.status(400).json({ error: 'A ticket cannot be its own parent' });
    }
    
    // Check for deeper circular references (grandparent -> parent -> child cycle)
    let currentParentId = parentTicketId;
    let visitedParentIds = new Set();
    
    while (currentParentId !== null) {
      if (visitedParentIds.has(currentParentId)) {
        return res.status(400).json({ error: 'Circular parent reference detected' });
      }
      
      visitedParentIds.add(currentParentId);
      
      const currentParent = ticketsData.tickets.find(t => t.id === currentParentId);
      if (!currentParent) break;
      
      if (currentParent.parentTicketId === ticketId) {
        return res.status(400).json({ error: 'This would create a circular reference' });
      }
      
      currentParentId = currentParent.parentTicketId;
    }
  }
  
  const currentTicket = ticketsData.tickets[ticketIndex];
  
  // Update ticket, handling empty/undefined values properly
  const updatedTicket = {
    ...currentTicket,
    title: req.body.title !== undefined ? req.body.title : currentTicket.title,
    description: req.body.description !== undefined ? req.body.description : currentTicket.description,
    typeId: req.body.typeId !== undefined ? parseInt(req.body.typeId) : currentTicket.typeId,
    stateId: req.body.stateId !== undefined ? parseInt(req.body.stateId) : currentTicket.stateId,
    priority: req.body.priority !== undefined ? req.body.priority : currentTicket.priority,
    assignedToUserId: req.body.assignedToUserId !== undefined ? 
      (req.body.assignedToUserId === null ? null : parseInt(req.body.assignedToUserId)) : 
      currentTicket.assignedToUserId,
    estimatedStoryPoints: req.body.estimatedStoryPoints !== undefined ? 
      Number(req.body.estimatedStoryPoints) : currentTicket.estimatedStoryPoints,
    actualStoryPoints: req.body.actualStoryPoints !== undefined ? 
      Number(req.body.actualStoryPoints) : currentTicket.actualStoryPoints,
    updated: new Date().toISOString(),
    parentTicketId: req.body.parentTicketId !== undefined ? 
      (req.body.parentTicketId === null ? null : parseInt(req.body.parentTicketId)) : 
      currentTicket.parentTicketId
  };
  
  ticketsData.tickets[ticketIndex] = updatedTicket;
  ticketsDb.write(ticketsData);
  
  // Find user, state, and type details for response
  const createdByUser = usersData.users.find(u => u.id === updatedTicket.createdByUserId) || null;
  const assignedToUser = usersData.users.find(u => u.id === updatedTicket.assignedToUserId) || null;
  const state = statesData.states.find(s => s.id === updatedTicket.stateId) || null;
  const type = typesData.types.find(t => t.id === updatedTicket.typeId) || null;
  
  const enrichedTicket = {
    ...updatedTicket,
    createdByUser: createdByUser ? `${createdByUser.firstname} ${createdByUser.lastname}` : 'Unknown',
    assignedToUser: assignedToUser ? `${assignedToUser.firstname} ${assignedToUser.lastname}` : null,
    state: state ? state.name : 'Unknown',
    active: state ? state.active : null,
    type: type ? type.name : 'Unknown'
  };
  
  res.json(enrichedTicket);
});

app.delete('/api/tickets/:id', (req, res) => {
  const data = ticketsDb.read();
  const ticketId = parseInt(req.params.id);
  const ticketIndex = data.tickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex !== -1) {
    data.tickets.splice(ticketIndex, 1);
    ticketsDb.write(data);
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Ticket not found' });
  }
});

// Ticket link routes
app.get('/api/ticket-links', (req, res) => {
  const data = ticketLinksDb.read();
  res.json(data.ticketLinks);
});

app.get('/api/ticket-links/:id', (req, res) => {
  const data = ticketLinksDb.read();
  const ticketLink = data.ticketLinks.find(l => l.id === parseInt(req.params.id));
  if (ticketLink) {
    res.json(ticketLink);
  } else {
    res.status(404).json({ error: 'Ticket link not found' });
  }
});

app.get('/api/tickets/:id/links', (req, res) => {
  const ticketId = parseInt(req.params.id);
  const ticketsData = ticketsDb.read();
  const linksData = ticketLinksDb.read();
  
  // Check if ticket exists
  if (!ticketsData.tickets.some(t => t.id === ticketId)) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  
  // Find all links where this ticket is either source or target
  const links = linksData.ticketLinks.filter(
    l => l.sourceTicketId === ticketId || l.targetTicketId === ticketId
  );
  
  res.json(links);
});

app.post('/api/ticket-links', (req, res) => {
  const ticketsData = ticketsDb.read();
  const linksData = ticketLinksDb.read();
  
  // Validate that both source and target tickets exist
  const sourceTicketId = parseInt(req.body.sourceTicketId);
  const targetTicketId = parseInt(req.body.targetTicketId);
  
  if (!ticketsData.tickets.some(t => t.id === sourceTicketId)) {
    return res.status(400).json({ error: 'Source ticket not found' });
  }
  
  if (!ticketsData.tickets.some(t => t.id === targetTicketId)) {
    return res.status(400).json({ error: 'Target ticket not found' });
  }
  
  // Prevent self-linking
  if (sourceTicketId === targetTicketId) {
    return res.status(400).json({ error: 'Cannot link a ticket to itself' });
  }
  
  // Validate link type
  const validTypes = ['related', 'blocks', 'duplicate', 'depends-on'];
  if (!validTypes.includes(req.body.type)) {
    return res.status(400).json({ 
      error: `Invalid link type. Valid types are: ${validTypes.join(', ')}` 
    });
  }
  
  const newId = linksData.ticketLinks.length > 0 
    ? Math.max(...linksData.ticketLinks.map(l => l.id)) + 1 
    : 1;
  
  const newLink = {
    id: newId,
    sourceTicketId: sourceTicketId,
    targetTicketId: targetTicketId,
    type: req.body.type
  };
  
  linksData.ticketLinks.push(newLink);
  ticketLinksDb.write(linksData);
  
  res.status(201).json(newLink);
});

app.delete('/api/ticket-links/:id', (req, res) => {
  const data = ticketLinksDb.read();
  const linkId = parseInt(req.params.id);
  const linkIndex = data.ticketLinks.findIndex(l => l.id === linkId);
  
  if (linkIndex !== -1) {
    data.ticketLinks.splice(linkIndex, 1);
    ticketLinksDb.write(data);
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Ticket link not found' });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Initialize the database and start the server
initializeDb();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Tickets database initialized at ${ticketsFilePath}`);
  console.log(`Users database initialized at ${usersFilePath}`);
  console.log(`States database initialized at ${statesFilePath}`);
  console.log(`Types database initialized at ${typesFilePath}`);
});