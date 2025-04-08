import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useDatabase } from '../context/DatabaseContext.js';
import Button from './Button.js';
import { FaSave, FaTimes, FaSearch, FaUser, FaCheck } from 'react-icons/fa/index.js';

const TicketForm = ({ onSubmit, onCancel, initialData = {}, isEditing = false }) => {
  const { currentUser } = useAuth();
  const { types, states, users } = useDatabase();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeId, setTypeId] = useState('');
  const [stateId, setStateId] = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // User search state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Set form initial values if editing
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTypeId(initialData.typeId || '');
      setStateId(initialData.stateId || '');
      setAssignedToUserId(initialData.assignedToUserId || '');
    } else {
      // Default for new tickets
      const openState = states.find(s => s.name === 'Open');
      if (openState) setStateId(openState.id);
      
      // Assign to current user by default
      setAssignedToUserId(currentUser?.uid || '');
    }
  }, [initialData, states, currentUser]);
  
  // Filter users based on search query
  useEffect(() => {
    if (userSearchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = userSearchQuery.toLowerCase();
      const filtered = users.filter(user => {
        const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim();
        return (
          user.email?.toLowerCase().includes(query) ||
          fullName.toLowerCase().includes(query)
        );
      });
      setFilteredUsers(filtered);
    }
  }, [userSearchQuery, users]);
  
  // Handle user selection
  const handleUserSelect = (userId) => {
    setAssignedToUserId(userId);
    setShowUserDropdown(false);
    
    // Clear search when a user is selected
    if (userId === '') {
      setUserSearchQuery('');
    } else {
      const selectedUser = users.find(u => u.id === userId);
      if (selectedUser) {
        const displayName = selectedUser.firstname && selectedUser.lastname 
          ? `${selectedUser.firstname} ${selectedUser.lastname}`
          : selectedUser.email;
        setUserSearchQuery(displayName);
      }
    }
  };
  
  // Format user display name
  const formatUserName = (user) => {
    if (!user) return 'Unassigned';
    return user.firstname && user.lastname 
      ? `${user.firstname} ${user.lastname}`
      : user.email;
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
    
    setLoading(true);
    setError('');
    
    try {
      const ticketData = {
        title,
        description,
        typeId,
        stateId,
        assignedToUserId,
        createdByUserId: currentUser?.uid,
        creationDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
      };
      
      await onSubmit(ticketData);
    } catch (err) {
      setError('Error saving ticket: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
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
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-coffee-medium" />
            </div>
            <input
              type="text"
              id="assignee"
              placeholder="Search for a user or leave empty for unassigned"
              value={userSearchQuery}
              onChange={(e) => {
                setUserSearchQuery(e.target.value);
                setShowUserDropdown(true);
              }}
              onClick={() => setShowUserDropdown(true)}
              className="w-full pl-10 pr-4 py-2 border border-coffee-cream rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-light focus:border-coffee-medium"
              autoComplete="off"
            />
            {assignedToUserId && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => {
                  setAssignedToUserId('');
                  setUserSearchQuery('');
                }}
              >
                <FaTimes className="h-4 w-4 text-coffee-medium hover:text-coffee-dark" />
              </button>
            )}
          </div>
          
          {showUserDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
              <div 
                className="cursor-pointer select-none relative py-2 px-4 text-coffee-dark hover:bg-coffee-light"
                onClick={() => handleUserSelect('')}
              >
                <div className="flex items-center">
                  <span className="bg-coffee-cream rounded-full h-6 w-6 flex items-center justify-center mr-2">
                    <FaUser className="text-coffee-medium h-3 w-3" />
                  </span>
                  <span className="font-normal">Unassigned</span>
                </div>
              </div>
              
              {filteredUsers.length === 0 ? (
                <div className="text-sm py-2 px-4 text-coffee-medium">
                  No users found
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div 
                    key={user.id}
                    className="cursor-pointer select-none relative py-2 px-4 text-coffee-dark hover:bg-coffee-light"
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <div className="flex items-center">
                      <span className="bg-coffee-medium rounded-full h-6 w-6 flex items-center justify-center text-white mr-2">
                        {user.firstname ? user.firstname.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-normal">{formatUserName(user)}</span>
                    </div>
                    {user.id === assignedToUserId && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-coffee-accent">
                        <FaCheck className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Hidden input to store the actual user ID value */}
        <input type="hidden" name="assignedToUserId" value={assignedToUserId} />
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