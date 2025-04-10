import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import useTasks from '../hooks/useTasks.js';
import Button from './Button.js';
import FormInput from './FormInput.js';
import FormSelect from './FormSelect.js';
import { FaSave, FaTimes, FaUser, FaSearch, FaLink } from 'react-icons/fa/index.js';

const TaskForm = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const { currentUser } = useAuth();
  const { 
    tasks, 
    types, 
    states, 
    priorities, 
    users, 
    getUserDisplayName 
  } = useTasks();
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    typeId: '',
    stateId: '',
    assignedToUserId: '',
    parentTaskId: '',
    linkedTasks: [],
    priorityId: ''
  });

  // Form validation state
  const [errors, setErrors] = useState({
    title: '',
    typeId: '',
    stateId: ''
  });
  
  // Search state - separate for parent and linked tasks
  const [parentSearchQuery, setParentSearchQuery] = useState('');
  const [linkedSearchQuery, setLinkedSearchQuery] = useState('');
  const [showParentSearchResults, setShowParentSearchResults] = useState(false);
  const [showLinkedSearchResults, setShowLinkedSearchResults] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set form initial values if editing
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        typeId: initialData.typeId || '',
        stateId: initialData.stateId || '',
        assignedToUserId: initialData.assignedToUserId || '',
        parentTaskId: initialData.parentTaskId || '',
        linkedTasks: initialData.linkedTasks || [],
        priorityId: initialData.priorityId || '',
      });
    } else {
      // Default values for new tasks
      const openState = states.find(s => s.name === 'Open');
      const mediumPriority = priorities.find(p => p.name === 'Medium');

      setFormData({
        title: '',
        description: '',
        typeId: '',
        stateId: openState ? openState.id : '',
        assignedToUserId: currentUser?.uid || '',
        parentTaskId: '',
        linkedTasks: [],
        priorityId: mediumPriority ? mediumPriority.id : '',
      });
    }
  }, [initialData, states, priorities, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for the field when user makes a change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Filter tasks based on search query for parent task
  const filteredParentTasks = tasks.filter(task => 
    (!initialData || task.id !== initialData.id) && // Don't include current task in results
    (task.title.toLowerCase().includes(parentSearchQuery.toLowerCase()) || 
     task.id.toLowerCase().includes(parentSearchQuery.toLowerCase()))
  );

  // Filter tasks based on search query for linked tasks
  const filteredLinkedTasks = tasks.filter(task => 
    (!initialData || task.id !== initialData.id) && // Don't include current task in results
    !formData.linkedTasks.some(t => t.id === task.id) && // Don't include already linked tasks
    (task.title.toLowerCase().includes(linkedSearchQuery.toLowerCase()) || 
     task.id.toLowerCase().includes(linkedSearchQuery.toLowerCase()))
  );

  // Add a linked task
  const addLinkedTask = (task) => {
    // Check if task is already linked
    if (!formData.linkedTasks.some(t => t.id === task.id)) {
      setFormData(prev => ({
        ...prev,
        linkedTasks: [
          ...prev.linkedTasks, 
          { 
            id: task.id, 
            title: task.title,
            linkType: 'Related' // Default link type
          }
        ]
      }));
    }
    setLinkedSearchQuery('');
    setShowLinkedSearchResults(false);
  };

  // Set a parent task
  const setParentTask = (task) => {
    setFormData(prev => ({ ...prev, parentTaskId: task.id }));
    setParentSearchQuery('');
    setShowParentSearchResults(false);
  };

  // Remove a linked task
  const removeLinkedTask = (taskId) => {
    setFormData(prev => ({
      ...prev,
      linkedTasks: prev.linkedTasks.filter(t => t.id !== taskId)
    }));
  };

  // Clear parent task
  const clearParentTask = () => {
    setFormData(prev => ({ ...prev, parentTaskId: '' }));
  };

  // Get parent task details
  const getParentTaskDetails = () => {
    if (!formData.parentTaskId) return null;
    return tasks.find(t => t.id === formData.parentTaskId);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.typeId) {
      newErrors.typeId = 'Task type is required';
    }
    
    if (!formData.stateId) {
      newErrors.stateId = 'Status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Make sure we have a priority
    if (!formData.priorityId && priorities.length > 0) {
      const mediumPriority = priorities.find(p => p.name === 'Medium');
      setFormData(prev => ({ 
        ...prev, 
        priorityId: mediumPriority ? mediumPriority.id : priorities[0].id 
      }));
    }
    
    setLoading(true);
    setError('');
    
    try {
      const taskData = {
        ...formData,
        lastModifiedDate: new Date().toISOString(),
        lastModifiedByUserId: currentUser?.uid, // Track who made the last modification
      };

      // Only set creation-related fields for new tasks
      if (!isEditing) {
        taskData.creationDate = new Date().toISOString();
        taskData.createdByUserId = currentUser?.uid;
      }
      
      await onSubmit(taskData);
    } catch (err) {
      setError('Error saving task: ' + err.message);
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
  
  // Convert types to options for FormSelect
  const typeOptions = types.map(type => ({
    value: type.id,
    label: type.name
  }));

  // Convert states to options for FormSelect
  const stateOptions = states.map(state => ({
    value: state.id,
    label: state.name
  }));

  // Convert priorities to options for FormSelect
  const priorityOptions = priorities.map(priority => ({
    value: priority.id,
    label: priority.name
  }));

  // Convert users to options for FormSelect
  const userOptions = users.map(user => ({
    value: user.id,
    label: getUserDisplayName(user.id)
  }));
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-coffee-accent px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <FormInput
        id="form-title"
        name="title"
        label="Title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="Enter task title"
        required={true}
        error={errors.title}
      />
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-coffee-dark mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full rounded-md border-coffee-cream focus:border-coffee-medium focus:ring focus:ring-coffee-light focus:ring-opacity-50"
          placeholder="Describe the task"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          id="typeId"
          name="typeId"
          label="Type"
          value={formData.typeId}
          onChange={handleInputChange}
          options={typeOptions}
          placeholder="Select a type"
          required={true}
          error={errors.typeId}
        />
        
        <FormSelect
          id="stateId"
          name="stateId"
          label="Status"
          value={formData.stateId}
          onChange={handleInputChange}
          options={stateOptions}
          placeholder="Select a status"
          required={true}
          error={errors.stateId}
        />
      </div>
      
      <div>
        <label htmlFor="assignedToUserId" className="block text-sm font-medium text-coffee-dark mb-1">
          Assigned To
        </label>
        <div className="relative">
          <div className="flex items-center w-full border border-coffee-cream rounded-md overflow-hidden">
            <div className="bg-coffee-cream p-2">
              <FaUser className="h-5 w-5 text-coffee-medium" />
            </div>
            <select
              id="assignedToUserId"
              name="assignedToUserId"
              value={formData.assignedToUserId}
              onChange={handleInputChange}
              className="flex-grow p-2 border-0 focus:ring-0 focus:outline-none"
            >
              <option value="">Select user...</option>
              {userOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-xs text-coffee-medium">
            Currently, tasks can only be assigned to yourself or left unassigned.
          </p>
        </div>
      </div>

      {/* Priority Field */}
      <FormSelect
        id="priorityId"
        name="priorityId"
        label="Priority"
        value={formData.priorityId}
        onChange={handleInputChange}
        options={priorityOptions}
        placeholder="Select a priority"
      />

      {/* Parent Task Selection */}
      <div>
        <label className="block text-sm font-medium text-coffee-dark mb-1">
          Parent Task
        </label>
        <div className="space-y-2">
          {formData.parentTaskId ? (
            <div className="flex items-center justify-between bg-coffee-light p-2 rounded-md">
              <div>
                <span className="font-medium text-coffee-dark">
                  {getParentTaskDetails()?.title || `Task #${formData.parentTaskId}`}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="small"
                onClick={clearParentTask}
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
                  placeholder="Search for a task to set as parent..."
                />
              </div>
              
              {showParentSearchResults && parentSearchQuery && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-coffee-cream rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredParentTasks.length === 0 ? (
                    <div className="p-3 text-coffee-medium">No tasks found</div>
                  ) : (
                    <ul className="divide-y divide-coffee-cream">
                      {filteredParentTasks.map(task => (
                        <li 
                          key={task.id}
                          className="p-2 hover:bg-coffee-light cursor-pointer"
                          onClick={() => setParentTask(task)}
                        >
                          <div className="font-medium text-coffee-dark">{task.title}</div>
                          <div className="text-xs text-coffee-medium">#{task.id}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-coffee-medium">
            Optionally set a parent task to create a hierarchy.
          </p>
        </div>
      </div>
      
      {/* Linked Tasks */}
      <div>
        <label className="block text-sm font-medium text-coffee-dark mb-1">
          Linked Tasks
        </label>
        <div className="space-y-2">
          {formData.linkedTasks.length > 0 && (
            <div className="space-y-2 mb-2">
              {formData.linkedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between bg-coffee-light p-2 rounded-md">
                  <div className="flex items-center">
                    <FaLink className="text-coffee-medium mr-2" />
                    <span className="font-medium text-coffee-dark">{task.title || `Task #${task.id}`}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={() => removeLinkedTask(task.id)}
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
                placeholder="Search for tasks to link..."
              />
            </div>
            
            {showLinkedSearchResults && linkedSearchQuery && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-coffee-cream rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredLinkedTasks.length === 0 ? (
                  <div className="p-3 text-coffee-medium">No tasks found</div>
                ) : (
                  <ul className="divide-y divide-coffee-cream">
                    {filteredLinkedTasks.map(task => (
                      <li 
                        key={task.id}
                        className="p-2 hover:bg-coffee-light cursor-pointer"
                        onClick={() => addLinkedTask(task)}
                      >
                        <div className="font-medium text-coffee-dark">{task.title}</div>
                        <div className="text-xs text-coffee-medium">#{task.id}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-coffee-medium">
            Link related tasks to this task.
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
          {loading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;