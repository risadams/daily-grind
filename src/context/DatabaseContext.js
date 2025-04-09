import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.js';
import * as dbService from '../services/databaseService.js';

// Create database context
const DatabaseContext = createContext();

export function useDatabase() {
  return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }) {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]); // Store all tickets, not just user's tickets
  const [types, setTypes] = useState([]);
  const [states, setStates] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [users, setUsers] = useState([]); // Add users state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDisplayNames, setUserDisplayNames] = useState({});

  // Load reference data (types, states, and priorities) when user is authenticated
  useEffect(() => {
    // Only load data if user is authenticated
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadReferenceData = async () => {
      try {
        // Fetch ticket types
        const typesResult = await dbService.getAllTypes();
        if (typesResult.success) {
          setTypes(typesResult.data);
        } else {
          console.error('Failed to load ticket types', typesResult.error);
          // Instead of setting an error immediately, just log it - we'll show a UI error only if all data fails to load
        }
        
        // Fetch ticket states
        const statesResult = await dbService.getAllStates();
        if (statesResult.success) {
          setStates(statesResult.data);
        } else {
          console.error('Failed to load ticket states', statesResult.error);
          // Only log the error
        }
        
        // Fetch priorities
        const prioritiesResult = await dbService.getAllPriorities();
        if (prioritiesResult.success) {
          setPriorities(prioritiesResult.data);
        } else {
          console.error('Failed to load priorities', prioritiesResult.error);
        }
      } catch (err) {
        console.error('Error loading reference data:', err);
        // Only set error if both types and states failed to load
        if (types.length === 0 && states.length === 0) {
          setError('Error loading application data. Please try again later.');
        }
      }
    };

    loadReferenceData();
  }, [currentUser]); // Add currentUser dependency

  // Load tickets for current user
  useEffect(() => {
    const loadTickets = async () => {
      if (!currentUser) {
        setTickets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await dbService.getTicketsByUser(currentUser.uid);
        if (result.success) {
          // Ensure all tickets have a priorityId field
          // Default to Medium priority if not set
          const mediumPriority = priorities.find(p => p.name === 'Medium');
          const defaultPriorityId = mediumPriority ? mediumPriority.id : 'priority-3';
          
          const updatedTickets = result.data.map(ticket => ({
            ...ticket,
            priorityId: ticket.priorityId || defaultPriorityId
          }));
          
          setTickets(updatedTickets);
        } else {
          console.error('Failed to load tickets', result.error);
          // Only set error if it's a non-permission issue
          if (result.error !== 'Missing or insufficient permissions.') {
            setError('Failed to load tickets');
          }
        }
      } catch (err) {
        console.error('Error loading tickets:', err);
        // Only set error if it's a non-permission issue
        if (!err.message?.includes('permissions')) {
          setError('Error loading tickets. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Only load tickets if priorities are available
    if (priorities.length > 0) {
      loadTickets();
    }
  }, [currentUser, priorities]);

  // Load all tickets for the All Tickets view
  useEffect(() => {
    const loadAllTickets = async () => {
      if (!currentUser) {
        setAllTickets([]);
        return;
      }

      try {
        const result = await dbService.getAllTickets();
        if (result.success) {
          // Ensure all tickets have a priorityId field
          // Default to Medium priority if not set
          const mediumPriority = priorities.find(p => p.name === 'Medium');
          const defaultPriorityId = mediumPriority ? mediumPriority.id : 'priority-3';
          
          const updatedTickets = result.data.map(ticket => ({
            ...ticket,
            priorityId: ticket.priorityId || defaultPriorityId
          }));
          
          setAllTickets(updatedTickets);
        } else {
          console.error('Failed to load all tickets', result.error);
        }
      } catch (err) {
        console.error('Error loading all tickets:', err);
      }
    };

    // Only load tickets if priorities are available
    if (priorities.length > 0) {
      loadAllTickets();
    }
  }, [currentUser, priorities]);

  // Load users data
  useEffect(() => {
    const loadUsers = async () => {
      if (!currentUser) {
        setUsers([]);
        return;
      }

      try {
        console.log("Loading users...");
        const result = await dbService.getAllUsers();
        if (result.success) {
          console.log("Loaded users:", result.data);
          
          // Add current user if not already in the list
          const currentUserInList = result.data.some(user => user.id === currentUser.uid);
          
          if (!currentUserInList) {
            const updatedUsers = [...result.data, {
              id: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email
            }];
            setUsers(updatedUsers);
            console.log("Added current user to users list:", updatedUsers);
          } else {
            setUsers(result.data);
          }
        } else {
          console.error('Failed to load users', result.error);
          
          // At minimum, add current user to the list
          setUsers([{
            id: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email
          }]);
        }
      } catch (err) {
        console.error('Error loading users:', err);
        
        // At minimum, add current user to the list
        setUsers([{
          id: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email
        }]);
      }
    };

    loadUsers();
  }, [currentUser]);

  // Format user display name synchronously using cache
  const getUserDisplayName = (userId) => {
    if (!userId) return 'Unassigned';
    return userDisplayNames[userId] || `User (${userId.slice(0, 6)}...)`;
  };

  // Load user display name asynchronously and cache it
  const loadUserDisplayName = async (userId) => {
    if (!userId || userDisplayNames[userId]) return;

    const existingUser = users.find(u => u.id === userId);
    if (existingUser) {
      setUserDisplayNames(prev => ({
        ...prev,
        [userId]: existingUser.displayName || existingUser.email || `User (${userId.slice(0, 6)}...)`
      }));
      return;
    }

    try {
      const result = await dbService.getUserById(userId);
      if (result.success && result.data) {
        setUserDisplayNames(prev => ({
          ...prev,
          [userId]: result.data.displayName || result.data.email || `User (${userId.slice(0, 6)}...)`
        }));
        setUsers(prevUsers => [...prevUsers, result.data]);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // Preload display names when tickets change
  useEffect(() => {
    const userIds = new Set();
    [...tickets, ...allTickets].forEach(ticket => {
      if (ticket.assignedToUserId) userIds.add(ticket.assignedToUserId);
      if (ticket.createdByUserId) userIds.add(ticket.createdByUserId);
    });
    
    userIds.forEach(userId => {
      loadUserDisplayName(userId);
    });
  }, [tickets, allTickets]);

  // Ticket operations
  const createTicket = async (ticketData) => {
    if (!currentUser) return { success: false, error: 'User not authenticated' };
    
    try {
      // Set medium priority as default if not provided
      if (!ticketData.priorityId) {
        const mediumPriority = priorities.find(p => p.name === 'Medium');
        ticketData.priorityId = mediumPriority ? mediumPriority.id : 'priority-3';
      }

      // Add user info to ticket data
      const ticketWithUser = {
        ...ticketData,
        createdByUserId: currentUser.uid
      };
      
      // Handle linked tickets - store them separately to avoid circular references
      const linkedTickets = ticketWithUser.linkedTickets || [];
      delete ticketWithUser.linkedTickets;
      
      // Create the ticket first
      const result = await dbService.createTicket(ticketWithUser);
      
      if (result.success) {
        // Create ticket links
        if (linkedTickets.length > 0) {
          for (const link of linkedTickets) {
            await dbService.createTicketLink({
              sourceTicketId: result.data.id,
              targetTicketId: link.id,
              linkType: link.linkType || 'Related'
            });
          }
        }
        
        // Update local state with the newly created ticket
        const newTicket = { 
          ...result.data, 
          linkedTickets 
        };
        
        setTickets(prevTickets => [...prevTickets, newTicket]);
        
        return { success: true, data: newTicket };
      }
      
      return result;
    } catch (err) {
      console.error('Error creating ticket:', err);
      return { success: false, error: err.message };
    }
  };

  const updateTicket = async (ticketId, ticketData) => {
    if (!currentUser) return { success: false, error: 'User not authenticated' };
    
    try {
      // Convert ticketId to string to ensure consistency
      const stringTicketId = String(ticketId);
      
      // Set medium priority as default if not provided
      if (!ticketData.priorityId && !ticketData.stateId) {
        const mediumPriority = priorities.find(p => p.name === 'Medium');
        ticketData.priorityId = mediumPriority ? mediumPriority.id : 'priority-3';
      }
      
      console.log(`Updating ticket ${stringTicketId} with data:`, ticketData);
      
      // Extract linked tickets from the data
      const linkedTickets = ticketData.linkedTickets || [];
      const ticketDataForUpdate = { ...ticketData };
      delete ticketDataForUpdate.linkedTickets;
      
      // Add last modified date
      ticketDataForUpdate.lastModifiedDate = new Date().toISOString();
      
      // Update the ticket
      const result = await dbService.updateTicket(stringTicketId, ticketDataForUpdate);
      
      if (result.success) {
        // First get existing links and delete them
        const existingLinks = await dbService.getTicketLinksByTicketId(stringTicketId);
        if (existingLinks.success) {
          for (const link of existingLinks.data) {
            await dbService.deleteTicketLink(link.id);
          }
        }
        
        // Create new links
        for (const link of linkedTickets) {
          await dbService.createTicketLink({
            sourceTicketId: stringTicketId,
            targetTicketId: link.id,
            linkType: link.linkType || 'Related'
          });
        }
        
        // Update local state
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === stringTicketId ? { 
              ...ticket, 
              ...ticketDataForUpdate,
              linkedTickets
            } : ticket
          )
        );
        
        // Also update allTickets state to keep it in sync
        setAllTickets(prevAllTickets => 
          prevAllTickets.map(ticket => 
            ticket.id === stringTicketId ? { 
              ...ticket, 
              ...ticketDataForUpdate,
              linkedTickets
            } : ticket
          )
        );
        
        return { 
          success: true, 
          data: { 
            id: stringTicketId, 
            ...ticketDataForUpdate,
            linkedTickets
          } 
        };
      }
      
      return result;
    } catch (err) {
      console.error('Error updating ticket:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!currentUser) return { success: false, error: 'User not authenticated' };
    
    try {
      // Delete all links associated with this ticket
      const existingLinks = await dbService.getTicketLinksByTicketId(ticketId);
      if (existingLinks.success) {
        for (const link of existingLinks.data) {
          await dbService.deleteTicketLink(link.id);
        }
      }
      
      // Delete the ticket
      const result = await dbService.deleteTicket(ticketId);
      
      if (result.success) {
        // Update local state
        setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId));
      }
      
      return result;
    } catch (err) {
      console.error('Error deleting ticket:', err);
      return { success: false, error: err.message };
    }
  };

  // Get a ticket's children (tickets that have this ticket as parent)
  const getTicketChildren = (ticketId) => {
    return tickets.filter(ticket => ticket.parentTicketId === ticketId);
  };

  // Get linked tickets for a specific ticket
  const getLinkedTickets = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    return ticket?.linkedTickets || [];
  };

  // Get a ticket type by ID
  const getTypeById = (typeId) => {
    return types.find(type => type.id === typeId) || null;
  };

  // Get a state by ID
  const getStateById = (stateId) => {
    return states.find(state => state.id === stateId) || null;
  };
  
  // Get a priority by ID
  const getPriorityById = (priorityId) => {
    return priorities.find(priority => priority.id === priorityId) || null;
  };
  
  // Get priority name by ID
  const getPriorityNameById = (priorityId) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority ? priority.name : 'Medium'; // Default to Medium if not found
  };
  
  // Get priority color by ID
  const getPriorityColorById = (priorityId) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority ? priority.color : 'yellow'; // Default to yellow if not found
  };

  // Format user display name from Firebase user
  const formatUserDisplayName = async (userId) => {
    if (!userId) return 'Unassigned';

    // Check if user exists in current users list
    const existingUser = users.find(u => u.id === userId);
    if (existingUser) {
      return existingUser.displayName || existingUser.email || `User (${userId.slice(0, 6)}...)`;
    }

    // If not found, try to load the user directly
    try {
      const result = await dbService.getUserById(userId);
      if (result.success && result.data) {
        // Add to users list
        setUsers(prevUsers => [...prevUsers, result.data]);
        return result.data.displayName || result.data.email || `User (${userId.slice(0, 6)}...)`;
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }

    // Fallback for users not found
    return `User (${userId.slice(0, 6)}...)`;
  };

  // Context value
  const value = {
    tickets,
    allTickets,
    types,
    states,
    priorities,
    users,
    loading,
    error,
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketChildren,
    getLinkedTickets,
    getTypeById,
    getStateById,
    getPriorityById,
    getPriorityNameById,
    getPriorityColorById,
    formatUserDisplayName,
    getUserDisplayName,
    loadUserDisplayName
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}