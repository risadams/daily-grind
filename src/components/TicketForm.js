import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useDatabase } from '../context/DatabaseContext.js';
import Button from './Button.js';
import { FaSave, FaTimes, FaUser, FaSearch, FaLink } from 'react-icons/fa/index.js';

const TicketForm = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const { currentUser } = useAuth();
  const { tickets, types, states, priorities, formatUserDisplayName, users, getUserDisplayName, loadUserDisplayName } = useDatabase();
  
  // Form data state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeId, setTypeId] = useState('');
  const [stateId, setStateId] = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [parentTicketId, setParentTicketId] = useState('');
  const [linkedTickets, setLinkedTickets] = useState([]);
  const [priorityId, setPriorityId] = useState(''); // Changed from priority to priorityId
  
  // Search state - separate for parent and linked tickets
  const [parentSearchQuery, setParentSearchQuery] = useState('');
  const [linkedSearchQuery, setLinkedSearchQuery] = useState('');
  const [showParentSearchResults, setShowParentSearchResults] = useState(false);
  const [showLinkedSearchResults, setShowLinkedSearchResults] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Set form initial values if editing
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTypeId(initialData.typeId || '');
      setStateId(initialData.stateId || '');
      setAssignedToUserId(initialData.assignedToUserId || '');
      setParentTicketId(initialData.parentTicketId || '');
      setLinkedTickets(initialData.linkedTickets || []);
      setPriorityId(initialData.priorityId || ''); // Changed from priority to priorityId
    } else {
      // Default for new tickets
      const openState = states.find(s => s.name === 'Open');
      if (openState) setStateId(openState.id);
      
      // Assign to current user by default
      setAssignedToUserId(currentUser?.uid || '');
      
      // Set Medium priority by default
      const mediumPriority = priorities.find(p => p.name === 'Medium');
      if (mediumPriority) setPriorityId(mediumPriority.id);
    }
  }, [initialData, states, priorities, currentUser]);
  
  // Filter tickets based on search query for parent ticket
  const filteredParentTickets = tickets.filter(ticket => 
    ticket.id !== initialData.id && // Don't include current ticket in results
    (ticket.title.toLowerCase().includes(parentSearchQuery.toLowerCase()) || 
     ticket.id.toLowerCase().includes(parentSearchQuery.toLowerCase()))
  );

  // Filter tickets based on search query for linked tickets
  const filteredLinkedTickets = tickets.filter(ticket => 
    ticket.id !== initialData.id && // Don't include current ticket in results
    !linkedTickets.some(t => t.id === ticket.id) && // Don't include already linked tickets
    (ticket.title.toLowerCase().includes(linkedSearchQuery.toLowerCase()) || 
     ticket.id.toLowerCase().includes(linkedSearchQuery.toLowerCase()))
  );

  // Add a linked ticket
  const addLinkedTicket = (ticket) => {
    // Check if ticket is already linked
    if (!linkedTickets.some(t => t.id === ticket.id)) {
      setLinkedTickets([...linkedTickets, { 
        id: ticket.id, 
        title: ticket.title,
        linkType: 'Related' // Default link type
      }]);
    }
    setLinkedSearchQuery('');
    setShowLinkedSearchResults(false);
  };

  // Set a parent ticket
  const setParentTicket = (ticket) => {
    setParentTicketId(ticket.id);
    setParentSearchQuery('');
    setShowParentSearchResults(false);
  };

  // Remove a linked ticket
  const removeLinkedTicket = (ticketId) => {
    setLinkedTickets(linkedTickets.filter(t => t.id !== ticketId));
  };

  // Clear parent ticket
  const clearParentTicket = () => {
    setParentTicketId('');
  };

  // Get parent ticket details
  const getParentTicketDetails = () => {
    if (!parentTicketId) return null;
    return tickets.find(t => t.id === parentTicketId);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!typeId) {
      setError('Ticket type is required');
      return;
    }
    
    if (!stateId) {
      setError('Status is required');
      return;
    }
    
    // Make sure we have a priority
    if (!priorityId && priorities.length > 0) {
      const mediumPriority = priorities.find(p => p.name === 'Medium');
      setPriorityId(mediumPriority ? mediumPriority.id : priorities[0].id);
    }
    
    setLoading(true);
    setError('');
    
    try {
      const ticketData = {
        title,
        description,
        typeId,
        stateId,
        assignedToUserId,
        parentTicketId,
        linkedTickets,
        priorityId, // Changed from priority to priorityId
        createdByUserId: currentUser?.uid,
        lastModifiedDate: new Date().toISOString(),
      };

      // Only set creation date for new tickets
      if (!isEditing) {
        ticketData.creationDate = new Date().toISOString();
      }
      
      await onSubmit(ticketData);
    } catch (err) {
      setError('Error saving ticket: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if user clicked outside parent search dropdown
      if (showParentSearchResults && !event.target.closest('[data-parent-search]')) {
        setShowParentSearchResults(false);
      }
      
      // Check if user clicked outside linked search dropdown
      if (showLinkedSearchResults && !event.target.closest('[data-linked-search]')) {
        setShowLinkedSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showParentSearchResults, showLinkedSearchResults]);

  // Preload user display names for select options
  useEffect(() => {
    users.forEach(user => loadUserDisplayName(user.id));
  }, [users, loadUserDisplayName]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-coffee-accent px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-coffee-dark mb-1">
          Title <span className="text-coffee-accent">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border-coffee-cream focus:border-coffee-medium focus:ring focus:ring-coffee-light focus:ring-opacity-50"
          placeholder="Enter ticket title"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-coffee-dark mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border-coffee-cream focus:border-coffee-medium focus:ring focus:ring-coffee-light focus:ring-opacity-50"
          placeholder="Describe the ticket"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-coffee-dark mb-1">
            Type <span className="text-coffee-accent">*</span>
          </label>
          <select
            id="type"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="w-full rounded-md border-coffee-cream focus:border-coffee-medium focus:ring focus:ring-coffee-light focus:ring-opacity-50"
            required
          >
            <option value="">Select a type</option>
            {types.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-coffee-dark mb-1">
            Status <span className="text-coffee-accent">*</span>
          </label>
          <select
            id="state"
            value={stateId}
            onChange={(e) => setStateId(e.target.value)}
            className="w-full rounded-md border-coffee-cream focus:border-coffee-medium focus:ring focus:ring-coffee-light focus:ring-opacity-50"
            required
          >
            <option value="">Select a status</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="assignee" className="block text-sm font-medium text-coffee-dark mb-1">
          Assigned To
        </label>
        <div className="relative">
          <div className="flex items-center w-full border border-coffee-cream rounded-md overflow-hidden">
            <div className="bg-coffee-cream p-2">
              <FaUser className="h-5 w-5 text-coffee-medium" />
            </div>
            <select
              id="assignee"
              value={assignedToUserId}
              onChange={(e) => setAssignedToUserId(e.target.value)}
              className="flex-grow p-2 border-0 focus:ring-0 focus:outline-none"
            >
              <option value="">Select user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {getUserDisplayName(user.id)}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-xs text-coffee-medium">
            Currently, tickets can only be assigned to yourself or left unassigned.
          </p>
        </div>
      </div>

      {/* Priority Field */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-coffee-dark mb-1">
          Priority
        </label>
        <select
          id="priority"
          value={priorityId}
          onChange={(e) => setPriorityId(e.target.value)}
          className="w-full rounded-md border-coffee-cream focus:border-coffee-medium focus:ring focus:ring-coffee-light focus:ring-opacity-50"
        >
          <option value="">Select a priority</option>
          {priorities.map(priority => (
            <option key={priority.id} value={priority.id}>
              {priority.name}
            </option>
          ))}
        </select>
      </div>

      {/* Parent Ticket Selection */}
      <div>
        <label className="block text-sm font-medium text-coffee-dark mb-1">
          Parent Ticket
        </label>
        <div className="space-y-2">
          {parentTicketId ? (
            <div className="flex items-center justify-between bg-coffee-light p-2 rounded-md">
              <div>
                <span className="font-medium text-coffee-dark">
                  {getParentTicketDetails()?.title || `Ticket #${parentTicketId}`}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="small"
                onClick={clearParentTicket}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="relative" data-parent-search>
              <div className="flex items-center w-full border border-coffee-cream rounded-md overflow-hidden">
                <div className="bg-coffee-cream p-2">
                  <FaSearch className="h-5 w-5 text-coffee-medium" />
                </div>
                <input
                  type="text"
                  value={parentSearchQuery}
                  onChange={(e) => {
                    setParentSearchQuery(e.target.value);
                    setShowParentSearchResults(true);
                  }}
                  onFocus={() => setShowParentSearchResults(true)}
                  className="flex-grow p-2 border-0 focus:ring-0 focus:outline-none"
                  placeholder="Search for a ticket to set as parent..."
                />
              </div>
              
              {showParentSearchResults && parentSearchQuery && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-coffee-cream rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredParentTickets.length === 0 ? (
                    <div className="p-3 text-coffee-medium">No tickets found</div>
                  ) : (
                    <ul className="divide-y divide-coffee-cream">
                      {filteredParentTickets.map(ticket => (
                        <li 
                          key={ticket.id}
                          className="p-2 hover:bg-coffee-light cursor-pointer"
                          onClick={() => setParentTicket(ticket)}
                        >
                          <div className="font-medium text-coffee-dark">{ticket.title}</div>
                          <div className="text-xs text-coffee-medium">#{ticket.id}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-coffee-medium">
            Optionally set a parent ticket to create a hierarchy.
          </p>
        </div>
      </div>
      
      {/* Linked Tickets */}
      <div>
        <label className="block text-sm font-medium text-coffee-dark mb-1">
          Linked Tickets
        </label>
        <div className="space-y-2">
          {linkedTickets.length > 0 && (
            <div className="space-y-2 mb-2">
              {linkedTickets.map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between bg-coffee-light p-2 rounded-md">
                  <div className="flex items-center">
                    <FaLink className="text-coffee-medium mr-2" />
                    <span className="font-medium text-coffee-dark">{ticket.title || `Ticket #${ticket.id}`}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    onClick={() => removeLinkedTicket(ticket.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="relative" data-linked-search>
            <div className="flex items-center w-full border border-coffee-cream rounded-md overflow-hidden">
              <div className="bg-coffee-cream p-2">
                <FaSearch className="h-5 w-5 text-coffee-medium" />
              </div>
              <input
                type="text"
                value={linkedSearchQuery}
                onChange={(e) => {
                  setLinkedSearchQuery(e.target.value);
                  setShowLinkedSearchResults(true);
                }}
                onFocus={() => setShowLinkedSearchResults(true)}
                className="flex-grow p-2 border-0 focus:ring-0 focus:outline-none"
                placeholder="Search for tickets to link..."
              />
            </div>
            
            {showLinkedSearchResults && linkedSearchQuery && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-coffee-cream rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredLinkedTickets.length === 0 ? (
                  <div className="p-3 text-coffee-medium">No tickets found</div>
                ) : (
                  <ul className="divide-y divide-coffee-cream">
                    {filteredLinkedTickets.map(ticket => (
                      <li 
                        key={ticket.id}
                        className="p-2 hover:bg-coffee-light cursor-pointer"
                        onClick={() => addLinkedTicket(ticket)}
                      >
                        <div className="font-medium text-coffee-dark">{ticket.title}</div>
                        <div className="text-xs text-coffee-medium">#{ticket.id}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-coffee-medium">
            Link related tickets to this ticket.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          icon={<FaTimes />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          icon={<FaSave />}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Ticket' : 'Create Ticket'}
        </Button>
      </div>
    </form>
  );
};

export default TicketForm;