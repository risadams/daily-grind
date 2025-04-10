import React, { createContext, useState, useContext, useEffect } from 'react';
import databaseService from '../services/databaseService.js';

// Create context
export const DatabaseContext = createContext();

// Mock data for types, states, and priorities
const defaultTypes = [
  { id: '1', name: 'Bug' },
  { id: '2', name: 'Feature' },
  { id: '3', name: 'Task' },
  { id: '4', name: 'Improvement' }
];

const defaultStates = [
  { id: '1', name: 'To Do' },
  { id: '2', name: 'In Progress' },
  { id: '3', name: 'In Review' },
  { id: '4', name: 'Closed' },
  { id: '5', name: "Won't Fix" }
];

const defaultPriorities = [
  { id: '1', name: 'Low' },
  { id: '2', name: 'Medium' },
  { id: '3', name: 'High' }
];

// DatabaseProvider component
export const DatabaseProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [types, setTypes] = useState(defaultTypes);
  const [states, setStates] = useState(defaultStates);
  const [priorities, setPriorities] = useState(defaultPriorities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await fetchTickets();
        // If you have API endpoints for these, you would fetch them here
        // For now, we're using the default mock data
      } catch (err) {
        setError('Failed to initialize data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTickets = await databaseService.getTickets();
      setTickets(fetchedTickets);
      return fetchedTickets;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get ticket by ID
  const getTicket = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const ticket = await databaseService.getTicketById(id);
      return ticket;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create ticket
  const createTicket = async (ticketData) => {
    setLoading(true);
    setError(null);
    try {
      const newTicket = await databaseService.createTicket(ticketData);
      setTickets(prev => [newTicket, ...prev]);
      return { success: true, ticket: newTicket };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update ticket
  const updateTicket = async (id, ticketData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTicket = await databaseService.updateTicket(id, ticketData);
      setTickets(prev => 
        prev.map(ticket => ticket._id === id || ticket.id === id ? updatedTicket : ticket)
      );
      return { success: true, ticket: updatedTicket };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete ticket
  const deleteTicket = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await databaseService.deleteTicket(id);
      setTickets(prev => prev.filter(ticket => ticket._id !== id && ticket.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Add attachment to ticket
  const addAttachment = async (ticketId, file) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTicket = await databaseService.addAttachment(ticketId, file);
      setTickets(prev => 
        prev.map(ticket => ticket._id === ticketId || ticket.id === ticketId ? updatedTicket : ticket)
      );
      return updatedTicket;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove attachment from ticket
  const removeAttachment = async (ticketId, attachmentId) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTicket = await databaseService.removeAttachment(ticketId, attachmentId);
      setTickets(prev => 
        prev.map(ticket => ticket._id === ticketId || ticket.id === ticketId ? updatedTicket : ticket)
      );
      return updatedTicket;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user display name
  const getUserDisplayName = (userId) => {
    if (!userId) return '';
    const user = users.find(u => u.id === userId || u._id === userId);
    return user ? user.displayName : '';
  };

  // Context value
  const value = {
    tickets,
    types,
    states,
    priorities,
    users,
    loading,
    error,
    fetchTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    addAttachment,
    removeAttachment,
    getUserDisplayName
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Custom hook to use the database context
export const useDatabase = () => {
  return useContext(DatabaseContext);
};