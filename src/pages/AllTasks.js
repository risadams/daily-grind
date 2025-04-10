import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext.js';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaEdit, FaEye, FaCheckCircle, FaPlus, FaFilter, FaTimes } from 'react-icons/fa/index.js';
import Modal from '../components/Modal.js';
import TaskDetail from '../components/TaskDetail.js';
import TaskFormDialog from '../components/TaskFormDialog.js';
import PageHeader from '../components/PageHeader.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';

export default function AllTasksPage() {
  const { 
    tasks, 
    types, 
    states, 
    priorities, 
    users, 
    loading, 
    error, 
    createTask, 
    updateTask, 
    deleteTask, 
    getUserDisplayName 
  } = useDatabase();
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    storyPoints: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // State for task modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskActionSuccess, setTaskActionSuccess] = useState({ show: false, message: '' });

  // Filter and sort tasks when dependencies change
  useEffect(() => {
    // Make sure tasks is an array
    let result = Array.isArray(tasks) ? [...tasks] : [];

    // Apply search term filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(task =>
        task.title?.toLowerCase().includes(lowercasedTerm) ||
        (task.description && task.description.toLowerCase().includes(lowercasedTerm))
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter(task => {
        if (!task.status) return false;

        const taskStatusId = typeof task.status === 'object' && task.status._id 
          ? task.status._id.toString() 
          : task.status.toString();
          
        return taskStatusId === filters.status;
      });
    }

    // Apply type filter (optional in our model)
    if (filters.type) {
      result = result.filter(task => {
        if (!task.type && !task.feature) return false;
        
        // Check type field if exists
        if (task.type) {
          const taskTypeId = typeof task.type === 'object' && task.type._id 
            ? task.type._id.toString() 
            : task.type.toString();
          
          if (taskTypeId === filters.type) return true;
        }
        
        // Check feature field if exists
        if (task.feature) {
          const taskFeatureId = typeof task.feature === 'object' && task.feature._id 
            ? task.feature._id.toString() 
            : task.feature.toString();
          
          if (taskFeatureId === filters.type) return true;
        }
        
        return false;
      });
    }

    // Apply priority filter
    if (filters.priority) {
      result = result.filter(task => {
        if (!task.priority) return false;

        const taskPriorityId = typeof task.priority === 'object' && task.priority._id 
          ? task.priority._id.toString() 
          : task.priority.toString();
          
        return taskPriorityId === filters.priority;
      });
    }
    
    // Apply story points filter
    if (filters.storyPoints) {
      result = result.filter(task => {
        const taskPoints = task.storyPoints || 0;
        return taskPoints === Number(filters.storyPoints);
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // For dates
        if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // For other fields
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle object references
        if (sortConfig.key === 'status' && a.status && b.status) {
          aValue = getStatusName(a.status);
          bValue = getStatusName(b.status);
        } else if (sortConfig.key === 'priority' && a.priority && b.priority) {
          aValue = getPriorityName(a.priority);
          bValue = getPriorityName(b.priority);
        } else if (sortConfig.key === 'assignedTo' && a.assignedTo && b.assignedTo) {
          aValue = getUserDisplayName(a.assignedTo);
          bValue = getUserDisplayName(b.assignedTo);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredTasks(result);
  }, [tasks, searchTerm, filters, sortConfig]);

  // Table sorting handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper function to display sort direction indicator
  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return <FaSort className="inline ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc' ?
      <FaSortUp className="inline ml-1 text-coffee-dark" /> :
      <FaSortDown className="inline ml-1 text-coffee-dark" />;
  };

  // Helper functions for displaying task data with MongoDB references
  const getStatusName = (status) => {
    if (!status) return 'Unknown';
    
    try {
      // If status is an object with a name property (already populated reference)
      if (typeof status === 'object' && status.name) {
        return status.name;
      }
      
      // Get status ID string
      const statusIdStr = typeof status === 'object' && status._id 
        ? status._id.toString() 
        : String(status);
      
      // Check if states array exists
      if (!states || !Array.isArray(states)) {
        console.log('States array is invalid:', states);
        return 'Unknown';
      }
      
      // Try to find a matching state
      // First, try to find by MongoDB ObjectID (_id property)
      const stateByMongoId = states.find(s => 
        s && s._id && String(s._id) === statusIdStr
      );
      if (stateByMongoId) {
        return stateByMongoId.name;
      }
      
      // Then, try to find by legacy ID (id property from mock data)
      const stateByLegacyId = states.find(s => 
        s && s.id && String(s.id) === statusIdStr
      );
      if (stateByLegacyId) {
        return stateByLegacyId.name;
      }
      
      // If no match found, check if statusIdStr itself is a status name
      if (typeof statusIdStr === 'string' && statusIdStr.length < 24) {
        // This might be a status name rather than an ID
        return statusIdStr.charAt(0).toUpperCase() + statusIdStr.slice(1);
      }
      
      console.log('No matching status found for:', statusIdStr);
      return 'Unknown';
    } catch (error) {
      console.error('Error in getStatusName:', error);
      return 'Unknown';
    }
  };

  const getPriorityName = (priority) => {
    if (!priority) return 'Medium';
    
    try {
      // If priority is an object with a name property (already populated reference)
      if (typeof priority === 'object' && priority.name) {
        return priority.name;
      }
      
      // Get priority ID string
      const priorityIdStr = typeof priority === 'object' && priority._id 
        ? priority._id.toString() 
        : String(priority);
      
      // Check if priorities array exists
      if (!priorities || !Array.isArray(priorities)) {
        console.log('Priorities array is invalid:', priorities);
        return 'Medium';
      }
      
      // Try to find a matching priority
      // First, try to find by MongoDB ObjectID (_id property)
      const priorityByMongoId = priorities.find(p => 
        p && p._id && String(p._id) === priorityIdStr
      );
      if (priorityByMongoId) {
        return priorityByMongoId.name;
      }
      
      // Then, try to find by legacy ID (id property from mock data)
      const priorityByLegacyId = priorities.find(p => 
        p && p.id && String(p.id) === priorityIdStr
      );
      if (priorityByLegacyId) {
        return priorityByLegacyId.name;
      }
      
      // If no match found, check if priorityIdStr itself is a priority name
      if (typeof priorityIdStr === 'string' && priorityIdStr.length < 24) {
        // This might be a priority name rather than an ID
        return priorityIdStr.charAt(0).toUpperCase() + priorityIdStr.slice(1);
      }
      
      console.log('No matching priority found for:', priorityIdStr);
      return 'Medium';
    } catch (error) {
      console.error('Error in getPriorityName:', error);
      return 'Medium';
    }
  };

  const getFeatureName = (feature) => {
    if (!feature) return 'None';
    
    // If it's already a string name, return it
    if (typeof feature === 'string' && feature.length < 24) {
      return feature;
    }
    
    // If it's a populated MongoDB reference
    if (feature.name) {
      return feature.name;
    }
    
    // We'd need to fetch or lookup the feature by ID
    return `Feature ${feature.toString().substring(0, 6)}`;
  };

  const getAssigneeName = (assignedTo) => {
    if (!assignedTo) return 'Unassigned';
    
    // If it's already a user object with a displayName
    if (typeof assignedTo === 'object' && assignedTo.displayName) {
      return assignedTo.displayName;
    }
    
    // If it's already a user object with an email but no displayName
    if (typeof assignedTo === 'object' && assignedTo.email) {
      return assignedTo.email.split('@')[0];
    }
    
    // If it's an ID, use getUserDisplayName which we improved in DatabaseContext
    return getUserDisplayName(assignedTo) || 'Unknown User';
  };
  
  const getPriorityColorClass = (priority) => {
    const priorityName = getPriorityName(priority).toLowerCase();
    
    switch (priorityName) {
      case 'critical':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'trivial':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusColorClass = (status) => {
    const statusName = getStatusName(status).toLowerCase();
    
    switch (statusName) {
      case 'done':
      case 'closed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'in progress':
      case 'inprogress':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'in review':
      case 'qa':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'to do':
      case 'todo':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'backlog':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-coffee-light text-coffee-dark border border-coffee-medium';
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      type: '',
      priority: '',
      storyPoints: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm || filters.status || filters.type || filters.priority || filters.storyPoints;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';

    try {
      // Try to create a date regardless of format
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const showSuccessMessage = (message) => {
    setTaskActionSuccess({ show: true, message });
    setTimeout(() => {
      setTaskActionSuccess({ show: false, message: '' });
    }, 3000);
  };

  // Helper functions for task operations
  const handleCreateTask = async (taskData) => {
    try {
      const result = await createTask(taskData);
      if (result.success) {
        showSuccessMessage('Task created successfully!');
        setShowTaskModal(false);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setTaskActionSuccess({ show: true, message: 'Failed to create task. Please try again.' });
      setTimeout(() => setTaskActionSuccess({ show: false, message: '' }), 3000);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      if (!selectedTask) throw new Error('No task selected for update');

      const result = await updateTask(selectedTask._id, taskData);
      if (result.success) {
        showSuccessMessage('Task updated successfully!');
        setShowEditModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setTaskActionSuccess({ show: true, message: 'Failed to update task. Please try again.' });
      setTimeout(() => setTaskActionSuccess({ show: false, message: '' }), 3000);
    }
  };

  const handleCloseTask = async (taskId) => {
    try {
      // Find "Done" status from states array
      const doneStatus = states.find(state => 
        state.name === 'Done' || 
        state.name === 'Closed'
      );
      
      if (!doneStatus) {
        throw new Error('Could not find Done/Closed status');
      }

      const result = await updateTask(taskId, { status: doneStatus._id });
      if (result.success) {
        showSuccessMessage('Task closed successfully!');
      }
    } catch (error) {
      console.error('Error closing task:', error);
      setTaskActionSuccess({ show: true, message: 'Failed to close task. Please try again.' });
      setTimeout(() => setTaskActionSuccess({ show: false, message: '' }), 3000);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const result = await deleteTask(taskId);
      if (result.success) {
        showSuccessMessage('Task deleted successfully!');
        setShowDeleteModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setTaskActionSuccess({ show: true, message: 'Failed to delete task. Please try again.' });
      setTimeout(() => setTaskActionSuccess({ show: false, message: '' }), 3000);
    }
  };

  return (
    <div className={`px-4 py-6 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-dark-primary' : 'bg-gray-50'} min-h-screen`}>
      {/* Success message alert */}
      {taskActionSuccess.show && (
        <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200 text-green-800 shadow-md flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="block sm:inline">{taskActionSuccess.message}</span>
          </div>
          <button onClick={() => setTaskActionSuccess({ show: false, message: '' })}>
            <FaTimes className="h-4 w-4 text-green-800" />
          </button>
        </div>
      )}

      <PageHeader
        title={
          <div className="flex items-center">
            <span className="mr-2">🎟️</span>
            <span>All Tasks</span>
          </div>
        }
        subtitle="View and manage all tasks in your system"
      />

      {/* Filter and Search Bar */}
      <div className={`${isDarkMode ? 'bg-dark-secondary' : 'bg-white'} shadow-md rounded-xl mb-6 p-4 transition-all duration-150`}>
        <div className="flex flex-col space-y-4">
          {/* Top row with search and buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="w-full sm:w-1/2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className={`${isDarkMode ? 'text-dark-text' : 'text-coffee-medium'}`} />
                </div>
                <input
                  type="text"
                  className={`${isDarkMode ? 'bg-dark-input border-dark-border text-dark-text' : 'bg-gray-50 border-gray-200 text-coffee-dark'} border rounded-lg block w-full pl-10 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-light transition-all`}
                  placeholder="Search tasks by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                  ${showFilters 
                    ? isDarkMode 
                      ? 'bg-dark-hover text-dark-text border-dark-border' 
                      : 'bg-coffee-light text-coffee-dark border-coffee-medium' 
                    : isDarkMode
                      ? 'bg-dark-secondary text-dark-text border-dark-border hover:bg-dark-hover'
                      : 'bg-white text-coffee-medium border-gray-200 hover:bg-gray-50'}`}
              >
                <FaFilter /> Filters {hasActiveFilters() && <span className="bg-coffee-primary text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center">!</span>}
              </button>
              
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'border-dark-border text-dark-text hover:bg-dark-hover' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  } transition-all`}
                >
                  <FaTimes /> Clear
                </button>
              )}
              
              <button 
                onClick={() => setShowTaskModal(true)} 
                className="bg-coffee-dark border border-coffee-dark text-white px-4 py-2 rounded-lg hover:bg-coffee-primary transition-colors shadow-sm"
              >
                <FaPlus className="inline-block mr-1" /> Create Task
              </button>
            </div>
          </div>
          
          {/* Filter options - collapsible */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100 animate-fadeIn">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} mb-1`}>Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className={`${isDarkMode ? 'bg-dark-input border-dark-border text-dark-text' : 'bg-gray-50 border-gray-200 text-coffee-dark'} border rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-coffee-light`}
                >
                  <option value="">All Statuses</option>
                  {states && states.map(state => (
                    <option key={state._id} value={state._id}>{state.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} mb-1`}>Priority</label>
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className={`${isDarkMode ? 'bg-dark-input border-dark-border text-dark-text' : 'bg-gray-50 border-gray-200 text-coffee-dark'} border rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-coffee-light`}
                >
                  <option value="">All Priorities</option>
                  {priorities && priorities.map(priority => (
                    <option key={priority._id} value={priority._id}>{priority.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} mb-1`}>Story Points</label>
                <select
                  name="storyPoints"
                  value={filters.storyPoints}
                  onChange={handleFilterChange}
                  className={`${isDarkMode ? 'bg-dark-input border-dark-border text-dark-text' : 'bg-gray-50 border-gray-200 text-coffee-dark'} border rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-coffee-light`}
                >
                  <option value="">All Points</option>
                  {[0, 1, 2, 3, 5, 8, 13].map(points => (
                    <option key={points} value={points}>{points}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Stats */}
      {filteredTasks.length > 0 && (
        <div className={`flex items-center mb-4 text-sm ${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>
          <span className="mr-2">Displaying {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
          {hasActiveFilters() && (
            <span className={`${isDarkMode ? 'bg-dark-hover text-dark-text' : 'bg-coffee-light text-coffee-dark'} px-2 py-1 rounded-md`}>Filtered results</span>
          )}
        </div>
      )}

      {/* Task Grid */}
      <div className={`${isDarkMode ? 'bg-dark-secondary' : 'bg-white'} shadow-md rounded-xl overflow-hidden transition-all duration-150`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-primary mb-4"></div>
            <p className={`${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>Brewing your tasks...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-500 font-medium mb-2">Something went wrong</p>
            <p className={`${isDarkMode ? 'text-dark-secondary' : 'text-gray-500'} mb-4`}>{error}</p>
            <button
              className="bg-coffee-dark border border-coffee-dark text-white px-4 py-2 rounded-lg hover:bg-coffee-primary transition-colors shadow-sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center p-16">
            <div className={`mx-auto h-16 w-16 rounded-full ${isDarkMode ? 'bg-dark-hover' : 'bg-coffee-light'} flex items-center justify-center mb-4`}>
              <svg className={`h-8 w-8 ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} mb-1`}>No tasks found</h3>
            <p className={`${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'} mb-6`}>Try adjusting your search or filter criteria.</p>
            <button
              className="inline-flex items-center px-4 py-2 shadow-sm text-sm font-medium rounded-md text-white bg-coffee-primary hover:bg-coffee-dark transition-colors"
              onClick={() => setShowTaskModal(true)}
            >
              <FaPlus className="mr-2" />
              Create New Task
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDarkMode ? 'bg-dark-hover border-dark-border' : 'bg-coffee-light border-coffee-medium'} border-b`}>
                  <th
                    scope="col"
                    className={`px-6 py-4 text-left text-xs font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors`}
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Title {getSortIcon('title')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-4 text-left text-xs font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors`}
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status {getSortIcon('status')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-4 text-left text-xs font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors`}
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center">
                      Priority {getSortIcon('priority')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-4 text-left text-xs font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors`}
                    onClick={() => handleSort('storyPoints')}
                  >
                    <div className="flex items-center">
                      Points {getSortIcon('storyPoints')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-4 text-left text-xs font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors`}
                    onClick={() => handleSort('assignedTo')}
                  >
                    <div className="flex items-center">
                      Assigned To {getSortIcon('assignedTo')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-4 text-left text-xs font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors`}
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Created {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-4 text-right text-xs font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} uppercase tracking-wider`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-dark-secondary divide-dark-border' : 'bg-white divide-gray-200'} divide-y`}>
                {filteredTasks.map((task) => (
                  <tr key={task._id} className={`${isDarkMode ? 'hover:bg-dark-hover' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'}`}>
                      <div className="flex items-center">
                        <span className="font-medium">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${getStatusColorClass(task.status)}`}
                      >
                        {getStatusName(task.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${getPriorityColorClass(task.priority)}`}
                      >
                        {getPriorityName(task.priority)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'}`}>
                      {task.storyPoints || 0}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-dark-text' : 'text-coffee-medium'}`}>
                      {getAssigneeName(task.assignedTo)}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-dark-text' : 'text-coffee-medium'}`}>
                      {formatDate(task.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center space-x-3 justify-end">
                        <button
                          className={`text-coffee-primary p-1.5 rounded-full ${isDarkMode ? 'hover:bg-dark-hover' : 'hover:bg-coffee-light'} hover:text-coffee-dark transition-colors`}
                          onClick={() => {
                            setSelectedTask(task);
                            setShowViewModal(true);
                          }}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="text-yellow-500 p-1.5 rounded-full hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                          onClick={() => {
                            setSelectedTask(task);
                            setShowEditModal(true);
                          }}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {getStatusName(task.status).toLowerCase() !== 'done' && 
                         getStatusName(task.status).toLowerCase() !== 'closed' && (
                          <button
                            className="text-green-500 p-1.5 rounded-full hover:bg-green-50 hover:text-green-700 transition-colors"
                            onClick={() => handleCloseTask(task._id)}
                            title="Close Task"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <TaskFormDialog
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
      />

      {/* View Task Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTask(null);
        }}
        title="Task Details"
      >
        <TaskDetail
          task={selectedTask}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={(taskId) => {
            setShowViewModal(false);
            setSelectedTask(null);
            handleDeleteTask(taskId);
          }}
        />
      </Modal>

      {/* Edit Task Modal */}
      <TaskFormDialog
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSubmit={handleUpdateTask}
        title={selectedTask ? `Edit Task: ${selectedTask.title}` : 'Edit Task'}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        size="small"
      >
        <div className="space-y-4">
          <p className={`${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'}`}>
            Are you sure you want to delete the task "{selectedTask?.title}"?
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isDarkMode ? 'text-dark-text bg-dark-hover hover:bg-dark-border' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
              onClick={() => selectedTask && handleDeleteTask(selectedTask._id)}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}