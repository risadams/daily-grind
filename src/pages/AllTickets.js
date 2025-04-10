import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext.js';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaEdit, FaEye, FaCheckCircle, FaPlus, FaFilter, FaTimes } from 'react-icons/fa/index.js';
import Modal from '../components/Modal.js';
import TicketDetail from '../components/TicketDetail.js';
import TicketFormDialog from '../components/TicketFormDialog.js';
import PageHeader from '../components/PageHeader.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';

export default function AllTicketsPage() {
  const { 
    tickets, 
    types, 
    states, 
    priorities, 
    users, 
    loading, 
    error, 
    createTicket, 
    updateTicket, 
    deleteTicket, 
    getUserDisplayName 
  } = useDatabase();
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // State for ticket modals
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketActionSuccess, setTicketActionSuccess] = useState({ show: false, message: '' });

  // Filter and sort tickets when dependencies change
  useEffect(() => {
    // Make sure tickets is an array
    let result = Array.isArray(tickets) ? [...tickets] : [];

    // Apply search term filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(ticket =>
        ticket.title?.toLowerCase().includes(lowercasedTerm) ||
        (ticket.description && ticket.description.toLowerCase().includes(lowercasedTerm))
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter(ticket => 
        (ticket.status && ticket.status.toString() === filters.status) || 
        (ticket.status && ticket.status._id && ticket.status._id.toString() === filters.status)
      );
    }

    // Apply type filter (optional in our model)
    if (filters.type) {
      result = result.filter(ticket => 
        (ticket.type && ticket.type.toString() === filters.type) || 
        (ticket.feature && ticket.feature.toString() === filters.type)
      );
    }

    // Apply priority filter
    if (filters.priority) {
      result = result.filter(ticket => 
        (ticket.priority && ticket.priority.toString() === filters.priority) || 
        (ticket.priority && ticket.priority._id && ticket.priority._id.toString() === filters.priority)
      );
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

    setFilteredTickets(result);
  }, [tickets, searchTerm, filters, sortConfig]);

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

  // Helper functions for displaying ticket data with MongoDB references
  const getStatusName = (status) => {
    if (!status) return 'Unknown';
    
    // If it's already a string name, return it
    if (typeof status === 'string') {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
    
    // If it's a MongoDB reference that's populated
    if (status.name) {
      return status.name;
    }
    
    // If it's an ObjectId reference that's not populated
    const statusObj = states.find(s => 
      s._id === status || 
      s._id.toString() === status.toString()
    );
    
    return statusObj ? statusObj.name : 'Unknown';
  };

  const getPriorityName = (priority) => {
    if (!priority) return 'Medium';
    
    // If it's already a string name, return it
    if (typeof priority === 'string') {
      return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
    
    // If it's a MongoDB reference that's populated
    if (priority.name) {
      return priority.name;
    }
    
    // If it's an ObjectId reference that's not populated
    const priorityObj = priorities.find(p => 
      p._id === priority || 
      p._id.toString() === priority.toString()
    );
    
    return priorityObj ? priorityObj.name : 'Medium';
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
      priority: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm || filters.status || filters.type || filters.priority;
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
    setTicketActionSuccess({ show: true, message });
    setTimeout(() => {
      setTicketActionSuccess({ show: false, message: '' });
    }, 3000);
  };

  // Helper functions for ticket operations
  const handleCreateTicket = async (ticketData) => {
    try {
      const result = await createTicket(ticketData);
      if (result.success) {
        showSuccessMessage('Ticket created successfully!');
        setShowTicketModal(false);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setTicketActionSuccess({ show: true, message: 'Failed to create ticket. Please try again.' });
      setTimeout(() => setTicketActionSuccess({ show: false, message: '' }), 3000);
    }
  };

  const handleUpdateTicket = async (ticketData) => {
    try {
      if (!selectedTicket) throw new Error('No ticket selected for update');

      const result = await updateTicket(selectedTicket._id, ticketData);
      if (result.success) {
        showSuccessMessage('Ticket updated successfully!');
        setShowEditModal(false);
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      setTicketActionSuccess({ show: true, message: 'Failed to update ticket. Please try again.' });
      setTimeout(() => setTicketActionSuccess({ show: false, message: '' }), 3000);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      // Find "Done" status from states array
      const doneStatus = states.find(state => 
        state.name === 'Done' || 
        state.name === 'Closed'
      );
      
      if (!doneStatus) {
        throw new Error('Could not find Done/Closed status');
      }

      const result = await updateTicket(ticketId, { status: doneStatus._id });
      if (result.success) {
        showSuccessMessage('Ticket closed successfully!');
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      setTicketActionSuccess({ show: true, message: 'Failed to close ticket. Please try again.' });
      setTimeout(() => setTicketActionSuccess({ show: false, message: '' }), 3000);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      const result = await deleteTicket(ticketId);
      if (result.success) {
        showSuccessMessage('Ticket deleted successfully!');
        setShowDeleteModal(false);
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setTicketActionSuccess({ show: true, message: 'Failed to delete ticket. Please try again.' });
      setTimeout(() => setTicketActionSuccess({ show: false, message: '' }), 3000);
    }
  };

  return (
    <div className={`px-4 py-6 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-dark-primary' : 'bg-gray-50'} min-h-screen`}>
      {/* Success message alert */}
      {ticketActionSuccess.show && (
        <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200 text-green-800 shadow-md flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="block sm:inline">{ticketActionSuccess.message}</span>
          </div>
          <button onClick={() => setTicketActionSuccess({ show: false, message: '' })}>
            <FaTimes className="h-4 w-4 text-green-800" />
          </button>
        </div>
      )}

      <PageHeader
        title={
          <div className="flex items-center">
            <span className="mr-2">🎟️</span>
            <span>All Tickets</span>
          </div>
        }
        subtitle="View and manage all tickets in your system"
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
                  placeholder="Search tickets by title or description..."
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
                onClick={() => setShowTicketModal(true)} 
                className="bg-coffee-dark border border-coffee-dark text-white px-4 py-2 rounded-lg hover:bg-coffee-primary transition-colors shadow-sm"
              >
                <FaPlus className="inline-block mr-1" /> Create Ticket
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

      {/* Ticket Stats */}
      {filteredTickets.length > 0 && (
        <div className={`flex items-center mb-4 text-sm ${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>
          <span className="mr-2">Displaying {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}</span>
          {hasActiveFilters() && (
            <span className={`${isDarkMode ? 'bg-dark-hover text-dark-text' : 'bg-coffee-light text-coffee-dark'} px-2 py-1 rounded-md`}>Filtered results</span>
          )}
        </div>
      )}

      {/* Ticket Grid */}
      <div className={`${isDarkMode ? 'bg-dark-secondary' : 'bg-white'} shadow-md rounded-xl overflow-hidden transition-all duration-150`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-primary mb-4"></div>
            <p className={`${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>Brewing your tickets...</p>
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
        ) : filteredTickets.length === 0 ? (
          <div className="text-center p-16">
            <div className={`mx-auto h-16 w-16 rounded-full ${isDarkMode ? 'bg-dark-hover' : 'bg-coffee-light'} flex items-center justify-center mb-4`}>
              <svg className={`h-8 w-8 ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'} mb-1`}>No tickets found</h3>
            <p className={`${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'} mb-6`}>Try adjusting your search or filter criteria.</p>
            <button
              className="inline-flex items-center px-4 py-2 shadow-sm text-sm font-medium rounded-md text-white bg-coffee-primary hover:bg-coffee-dark transition-colors"
              onClick={() => setShowTicketModal(true)}
            >
              <FaPlus className="mr-2" />
              Create New Ticket
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
                {filteredTickets.map((ticket) => (
                  <tr key={ticket._id} className={`${isDarkMode ? 'hover:bg-dark-hover' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'}`}>
                      <div className="flex items-center">
                        <span className="font-medium">{ticket.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${getStatusColorClass(ticket.status)}`}
                      >
                        {getStatusName(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${getPriorityColorClass(ticket.priority)}`}
                      >
                        {getPriorityName(ticket.priority)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-dark-text' : 'text-coffee-dark'}`}>
                      {ticket.storyPoints || 0}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-dark-text' : 'text-coffee-medium'}`}>
                      {getAssigneeName(ticket.assignedTo)}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-dark-text' : 'text-coffee-medium'}`}>
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center space-x-3 justify-end">
                        <button
                          className={`text-coffee-primary p-1.5 rounded-full ${isDarkMode ? 'hover:bg-dark-hover' : 'hover:bg-coffee-light'} hover:text-coffee-dark transition-colors`}
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowViewModal(true);
                          }}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="text-yellow-500 p-1.5 rounded-full hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowEditModal(true);
                          }}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {getStatusName(ticket.status).toLowerCase() !== 'done' && 
                         getStatusName(ticket.status).toLowerCase() !== 'closed' && (
                          <button
                            className="text-green-500 p-1.5 rounded-full hover:bg-green-50 hover:text-green-700 transition-colors"
                            onClick={() => handleCloseTicket(ticket._id)}
                            title="Close Ticket"
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

      {/* Create Ticket Modal */}
      <TicketFormDialog
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        onSubmit={handleCreateTicket}
      />

      {/* View Ticket Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTicket(null);
        }}
        title="Ticket Details"
      >
        <TicketDetail
          ticket={selectedTicket}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onDelete={(ticketId) => {
            setShowViewModal(false);
            setSelectedTicket(null);
            handleDeleteTicket(ticketId);
          }}
        />
      </Modal>

      {/* Edit Ticket Modal */}
      <TicketFormDialog
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onSubmit={handleUpdateTicket}
        title={selectedTicket ? `Edit Ticket: ${selectedTicket.title}` : 'Edit Ticket'}
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
            Are you sure you want to delete the ticket "{selectedTicket?.title}"?
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
              onClick={() => selectedTicket && handleDeleteTicket(selectedTicket._id)}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}