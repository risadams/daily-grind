import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useDatabase } from '../context/DatabaseContext.js';
import Button from './Button.js';
import { FaSave, FaTimes, FaUser, FaCheck } from 'react-icons/fa/index.js';

const TicketForm = ({ onSubmit, onCancel, initialData = {}, isEditing = false }) => {
  const { currentUser } = useAuth();
  const { types, states, formatUserDisplayName } = useDatabase();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeId, setTypeId] = useState('');
  const [stateId, setStateId] = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState('');
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
    } else {
      // Default for new tickets
      const openState = states.find(s => s.name === 'Open');
      if (openState) setStateId(openState.id);
      
      // Assign to current user by default
      setAssignedToUserId(currentUser?.uid || '');
    }
  }, [initialData, states, currentUser]);
  
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
              <option value="">Unassigned</option>
              <option value={currentUser?.uid}>Me ({currentUser?.email})</option>
            </select>
          </div>
          <p className="mt-1 text-xs text-coffee-medium">
            Currently, tickets can only be assigned to yourself or left unassigned.
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