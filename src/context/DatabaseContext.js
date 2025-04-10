import React, { createContext, useState, useContext } from 'react';
import databaseService from '../services/databaseService.js';

// Create context
export const DatabaseContext = createContext();

// DatabaseProvider component
export const DatabaseProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      return newTicket;
    } catch (err) {
      setError(err.message);
      throw err;
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
        prev.map(ticket => ticket._id === id ? updatedTicket : ticket)
      );
      return updatedTicket;
    } catch (err) {
      setError(err.message);
      throw err;
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
      setTickets(prev => prev.filter(ticket => ticket._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
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
        prev.map(ticket => ticket._id === ticketId ? updatedTicket : ticket)
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
        prev.map(ticket => ticket._id === ticketId ? updatedTicket : ticket)
      );
      return updatedTicket;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    tickets,
    loading,
    error,
    fetchTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    addAttachment,
    removeAttachment
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