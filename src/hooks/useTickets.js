import { useState, useCallback, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext.js';
import { useToast } from '../context/ToastContext.js';
import { formatDate, STATUS } from '../utils/constants.js';

/**
 * Custom hook for ticket operations and data
 * Centralizes common ticket logic used across components
 * 
 * @returns {Object} Ticket operations and data
 */
export const useTickets = () => {
  const { 
    tickets, 
    types, 
    states, 
    priorities, 
    users, 
    loading, 
    error,
    createTicket: dbCreateTicket, 
    updateTicket: dbUpdateTicket, 
    deleteTicket: dbDeleteTicket,
    getUserDisplayName
  } = useDatabase();
  
  const { success, error: showError } = useToast();
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  /**
   * Get type name from typeId with type-safe comparison
   */
  const getTypeName = useCallback((typeId) => {
    const type = types.find(t => 
      t.id === typeId || 
      t.id === Number(typeId) || 
      String(t.id) === typeId
    );
    return type ? type.name : 'Unknown';
  }, [types]);

  /**
   * Get state name from stateId with type-safe comparison
   */
  const getStateName = useCallback((stateId) => {
    const state = states.find(s => 
      s.id === stateId || 
      s.id === Number(stateId) || 
      String(s.id) === stateId
    );
    return state ? state.name : 'Unknown';
  }, [states]);
  
  /**
   * Get priority name from priorityId with type-safe comparison
   */
  const getPriorityName = useCallback((priorityId) => {
    if (!priorityId || !priorities || priorities.length === 0) return 'Medium';
    const searchId = typeof priorityId === 'string' ? priorityId : String(priorityId);
    const priorityObj = priorities.find(priority => String(priority.id) === searchId);
    return priorityObj ? priorityObj.name : 'Medium';
  }, [priorities]);

  /**
   * Filter tickets by state name
   */
  const filterTicketsByState = useCallback((stateName) => {
    if (!tickets) return [];
    
    const normalizedState = stateName.toLowerCase().replace(/\s+/g, '');
    return tickets.filter(t => {
      const ticketState = getStateName(t.stateId).toLowerCase().replace(/\s+/g, '');
      return ticketState === normalizedState;
    });
  }, [tickets, getStateName]);
  
  /**
   * Get tickets assigned to the current user
   */
  const getMyTickets = useCallback((userId) => {
    if (!userId || !tickets) return [];
    return tickets.filter(t => String(t.assignedToUserId) === String(userId));
  }, [tickets]);
  
  /**
   * Create a ticket with error handling
   */
  const createTicket = useCallback(async (ticketData) => {
    try {
      const result = await dbCreateTicket(ticketData);
      
      if (result.success) {
        success('Ticket created successfully!');
        return result;
      } else {
        throw new Error(result.error || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      showError('Failed to create ticket. Please try again.');
      throw error;
    }
  }, [dbCreateTicket, success, showError]);

  /**
   * Update a ticket with error handling
   */
  const updateTicket = useCallback(async (ticketId, ticketData) => {
    try {
      const result = await dbUpdateTicket(ticketId, ticketData);
      
      if (result.success) {
        success('Ticket updated successfully!');
        return result;
      } else {
        throw new Error(result.error || 'Failed to update ticket');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      showError('Failed to update ticket. Please try again.');
      throw error;
    }
  }, [dbUpdateTicket, success, showError]);

  /**
   * Delete a ticket with error handling
   */
  const deleteTicket = useCallback(async (ticketId) => {
    try {
      const result = await dbDeleteTicket(ticketId);
      
      if (result.success) {
        success('Ticket deleted successfully!');
        setSelectedTicket(null);
        return result;
      } else {
        throw new Error(result.error || 'Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      showError('Failed to delete ticket. Please try again.');
      throw error;
    }
  }, [dbDeleteTicket, success, showError]);

  /**
   * Find a ticket by ID
   */
  const getTicketById = useCallback((ticketId) => {
    if (!ticketId || !tickets) return null;
    return tickets.find(t => String(t.id) === String(ticketId));
  }, [tickets]);
  
  /**
   * Mark a ticket as closed
   */
  const closeTicket = useCallback(async (ticket) => {
    const closedState = states.find(s => s.name.toLowerCase() === 'closed');
    if (!closedState) {
      showError('Could not find closed state');
      return null;
    }
    
    return updateTicket(ticket.id, {
      ...ticket,
      stateId: closedState.id
    });
  }, [states, updateTicket, showError]);
  
  /**
   * Get ticket statistics
   */
  const ticketStats = useMemo(() => {
    if (!tickets || !tickets.length) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        completionRate: 0,
        priorityDistribution: {
          high: 0,
          medium: 0, 
          low: 0
        }
      };
    }
    
    const completed = tickets.filter(t => getStateName(t.stateId).toLowerCase() === 'closed').length;
    const inProgress = tickets.filter(t => getStateName(t.stateId).toLowerCase().replace(/\s+/g, '') === 'inprogress').length;
    const todo = tickets.filter(t => getStateName(t.stateId).toLowerCase().replace(/\s+/g, '') === 'todo').length;
    
    const highPriority = tickets.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'high').length;
    const mediumPriority = tickets.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'medium').length;
    const lowPriority = tickets.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'low').length;
    
    return {
      total: tickets.length,
      completed,
      inProgress,
      todo,
      completionRate: Math.round((completed / tickets.length) * 100),
      priorityDistribution: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority
      }
    };
  }, [tickets, getStateName, getPriorityName]);

  return {
    // Data
    tickets,
    types,
    states,
    priorities,
    users,
    loading,
    error,
    selectedTicket,
    ticketStats,
    
    // Setters
    setSelectedTicket,
    
    // Getters
    getTypeName,
    getStateName,
    getPriorityName,
    getTicketById,
    getUserDisplayName,
    filterTicketsByState,
    getMyTickets,
    
    // Operations
    createTicket,
    updateTicket,
    deleteTicket,
    closeTicket,
    
    // Utils
    formatTicketDate: formatDate
  };
};

export default useTickets;