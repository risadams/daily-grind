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
  const [users, setUsers] = useState([]);
  const [types, setTypes] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load reference data (types and states) when user is authenticated
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

  // Load user data when user is authenticated
  useEffect(() => {
    // Only load data if user is authenticated
    if (!currentUser) {
      return;
    }

    const loadUsers = async () => {
      try {
        const result = await dbService.getAllUsers();
        if (result.success) {
          setUsers(result.data);
        } else {
          console.error('Failed to load users', result.error);
          // Only log the error
        }
      } catch (err) {
        console.error('Error loading users:', err);
        // Only set an error if critical for the application
      }
    };

    loadUsers();
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
          setTickets(result.data);
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

    loadTickets();
  }, [currentUser]);

  // Ticket operations
  const createTicket = async (ticketData) => {
    if (!currentUser) return { success: false, error: 'User not authenticated' };
    
    try {
      // Add user info to ticket data
      const ticketWithUser = {
        ...ticketData,
        createdByUserId: currentUser.uid
      };
      
      const result = await dbService.createTicket(ticketWithUser);
      
      if (result.success) {
        // Update local state
        setTickets(prevTickets => [...prevTickets, result.data]);
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
      // Add last modified date
      const updatedTicketData = {
        ...ticketData,
        lastModifiedDate: new Date().toISOString()
      };
      
      const result = await dbService.updateTicket(ticketId, updatedTicketData);
      
      if (result.success) {
        // Update local state
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId ? { ...ticket, ...updatedTicketData } : ticket
          )
        );
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

  // Get a ticket type by ID
  const getTypeById = (typeId) => {
    return types.find(type => type.id === typeId) || null;
  };

  // Get a state by ID
  const getStateById = (stateId) => {
    return states.find(state => state.id === stateId) || null;
  };

  // Get a user by ID
  const getUserById = (userId) => {
    return users.find(user => user.id === userId) || null;
  };

  // Context value
  const value = {
    tickets,
    types,
    states,
    users,
    loading,
    error,
    createTicket,
    updateTicket,
    deleteTicket,
    getTypeById,
    getStateById,
    getUserById
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}