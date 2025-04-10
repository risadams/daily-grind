import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext.js';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaEdit, FaEye, FaCheckCircle, FaPlus, FaFilter, FaTimes } from 'react-icons/fa/index.js';
import Modal from '../components/Modal.js';
import TicketDetail from '../components/TicketDetail.js';
import TicketFormDialog from '../components/TicketFormDialog.js';
import PageHeader from '../components/PageHeader.js';

export default function AllTicketsPage() {
  const { tickets, types, states, priorities, users, loading, error, createTicket, updateTicket, deleteTicket, getUserDisplayName } = useDatabase();

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
    key: 'creationDate',
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

    // Apply specific filters - use status instead of stateId
    if (filters.status) {
      result = result.filter(ticket => ticket.status === filters.status || ticket.stateId === filters.status);
    }

    // Use type or typeId depending on what's available
    if (filters.type) {
      result = result.filter(ticket => ticket.type === filters.type || ticket.typeId === filters.type);
    }

    // Use priority or priorityId depending on what's available
    if (filters.priority) {
      result = result.filter(ticket => ticket.priority === filters.priority || ticket.priorityId === filters.priority);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // For dates, check both creationDate and createdAt
        if (sortConfig.key === 'creationDate' || sortConfig.key === 'createdAt') {
          const dateA = new Date(a.createdAt || a.creationDate);
          const dateB = new Date(b.createdAt || b.creationDate);
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // Handle other fields
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredTickets(result);
  }, [tickets, searchTerm, filters, sortConfig]);

  // Add this debug useEffect
  useEffect(() => {
    if (tickets.length > 0) {
      console.log('Sample ticket:', tickets[0]);
    }
    console.log('Types:', types);
    console.log('States:', states);
  }, [tickets, types, states]);

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

      const result = await updateTicket(selectedTicket.id, ticketData);
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
      // Try to find Closed state from states array or use 'closed' string
      const closedStateId = states.find(state => state.name === 'Closed')?.id || 'closed';

      const result = await updateTicket(ticketId, { status: closedStateId });
      if (result.success) {
        showSuccessMessage('Ticket closed successfully!');
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      setTicketActionSuccess({ show: true, message: 'Failed to close ticket. Please try again.' });
      setTimeout(() => setTicketActionSuccess({ show: false, message: '' }), 3000);
    }
  };

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

  // Helper function for getting formatted names
  const getTypeName = (typeId) => {
    if (!typeId) return 'Unknown';
    
    // If typeId is already a string name rather than an ID, return it directly
    if (typeof typeId === 'string' && !typeId.match(/^[0-9a-fA-F]{24}$/)) {
      return typeId.charAt(0).toUpperCase() + typeId.slice(1);
    }
    
    // Otherwise, try to find the type by ID
    if (types && types.length > 0) {
      // Normalize ID for comparison
      const searchId = String(typeId).trim();
      
      // Try multiple ways of matching
      const typeObj = types.find(type => 
        String(type.id) === searchId ||
        String(type._id) === searchId ||
        type.id === typeId ||
        type._id === typeId
      );
      
      if (typeObj) return typeObj.name;
    }
    
    return 'Unknown';
  };

  const getStateName = (stateId) => {
    // If stateId is already a string name rather than an ID, return it directly
    if (typeof stateId === 'string' && !stateId.match(/^[0-9a-fA-F]{24}$/)) {
      return stateId.charAt(0).toUpperCase() + stateId.slice(1);
    }
    
    // Otherwise, try to find the state by ID
    if (states && states.length > 0) {
      // Normalize ID for comparison
      const searchId = String(stateId).trim();
      
      // Try multiple ways of matching
      const stateObj = states.find(state => 
        String(state.id) === searchId ||
        String(state._id) === searchId ||
        state.id === stateId ||
        state._id === stateId
      );
      
      if (stateObj) return stateObj.name;
    }
    
    return stateId || 'Unknown';
  };

  const getPriorityName = (priorityId) => {
    // If priorityId is already a string name rather than an ID, return it directly
    if (typeof priorityId === 'string' && !priorityId.match(/^[0-9a-fA-F]{24}$/)) {
      return priorityId.charAt(0).toUpperCase() + priorityId.slice(1);
    }
    
    // Otherwise, try to find the priority by ID
    if (priorities && priorities.length > 0) {
      // Normalize ID for comparison
      const searchId = String(priorityId).trim();
      
      // Try multiple ways of matching
      const priorityObj = priorities.find(priority => 
        String(priority.id) === searchId ||
        String(priority._id) === searchId ||
        priority.id === priorityId ||
        priority._id === priorityId
      );
      
      if (priorityObj) return priorityObj.name;
    }
    
    return priorityId || 'Medium';
  };
  
  const getPriorityColorClass = (priorityId) => {
    const priority = priorities.find(p => p.id === priorityId);
    if (!priority) return 'bg-gray-100 text-gray-800';
    
    switch (priority.name.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusColorClass = (stateId) => {
    const stateName = getStateName(stateId).toLowerCase();
    
    if (stateName === 'closed') {
      return 'bg-green-100 text-green-800 border border-green-200';
    } else if (stateName === 'in progress' || stateName === 'inprogress') {
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    } else if (stateName === 'in review') {
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    } else if (stateName === 'to do' || stateName === 'todo') {
      return 'bg-gray-100 text-gray-800 border border-gray-200';
    } else if (stateName === "won't fix") {
      return 'bg-red-100 text-red-800 border border-red-200';
    } else {
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
        console.log('Invalid date format:', dateString);
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

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
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
      <div className="bg-white shadow-md rounded-xl mb-6 p-4 transition-all duration-150">
        <div className="flex flex-col space-y-4">
          {/* Top row with search and buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="w-full sm:w-1/2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-coffee-medium" />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-200 text-coffee-dark rounded-lg block w-full pl-10 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-light transition-all"
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
                    ? 'bg-coffee-light text-coffee-dark border-coffee-medium' 
                    : 'bg-white text-coffee-medium border-gray-200 hover:bg-gray-50'}`}
              >
                <FaFilter /> Filters {hasActiveFilters() && <span className="bg-coffee-primary text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center">!</span>}
              </button>
              
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <FaTimes /> Clear
                </button>
              )}
              
              <button
                className="flex items-center gap-2 px-4 py-2 bg-coffee-dark text-white rounded-lg hover:bg-coffee-primary transition-all shadow-sm"
                onClick={() => setShowTicketModal(true)}
              >
                <FaPlus className="text-sm" /> New Ticket
              </button>
            </div>
          </div>
          
          {/* Filter options - collapsible */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-coffee-dark mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="bg-gray-50 border border-gray-200 text-coffee-dark rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-coffee-light"
                >
                  <option value="">All Statuses</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-coffee-dark mb-1">Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="bg-gray-50 border border-gray-200 text-coffee-dark rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-coffee-light"
                >
                  <option value="">All Types</option>
                  {types.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-coffee-dark mb-1">Priority</label>
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className="bg-gray-50 border border-gray-200 text-coffee-dark rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-coffee-light"
                >
                  <option value="">All Priorities</option>
                  {priorities && priorities.map(priority => (
                    <option key={priority.id} value={priority.id}>{priority.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Stats */}
      {filteredTickets.length > 0 && (
        <div className="flex items-center mb-4 text-sm text-coffee-medium">
          <span className="mr-2">Displaying {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}</span>
          {hasActiveFilters() && (
            <span className="bg-coffee-light px-2 py-1 rounded-md text-coffee-dark">Filtered results</span>
          )}
        </div>
      )}

      {/* Ticket Grid */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden transition-all duration-150">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-primary mb-4"></div>
            <p className="text-coffee-medium">Brewing your tickets...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-500 font-medium mb-2">Something went wrong</p>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              className="bg-coffee-primary text-white px-4 py-2 rounded-lg hover:bg-coffee-dark transition-colors shadow-sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center p-16">
            <div className="mx-auto h-16 w-16 rounded-full bg-coffee-light flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-coffee-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-coffee-dark mb-1">No tickets found</h3>
            <p className="text-coffee-medium mb-6">Try adjusting your search or filter criteria.</p>
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
                <tr className="bg-coffee-light border-b border-coffee-medium">
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Title {getSortIcon('title')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors"
                    onClick={() => handleSort('typeId')}
                  >
                    <div className="flex items-center">
                      Type {getSortIcon('typeId')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors"
                    onClick={() => handleSort('stateId')}
                  >
                    <div className="flex items-center">
                      Status {getSortIcon('stateId')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors"
                    onClick={() => handleSort('priorityId')}
                  >
                    <div className="flex items-center">
                      Priority {getSortIcon('priorityId')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors"
                    onClick={() => handleSort('assignedToUserId')}
                  >
                    <div className="flex items-center">
                      Assigned To {getSortIcon('assignedToUserId')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer hover:bg-coffee-medium hover:text-white transition-colors"
                    onClick={() => handleSort('creationDate')}
                  >
                    <div className="flex items-center">
                      Created {getSortIcon('creationDate')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-coffee-dark">
                      <div className="flex items-center">
                        <span className="font-medium">{ticket.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-coffee-medium">
                      {getTypeName(ticket.typeId)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${getStatusColorClass(ticket.stateId)}`}
                      >
                        {getStateName(ticket.stateId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${getPriorityColorClass(ticket.priorityId)}`}
                      >
                        {getPriorityName(ticket.priorityId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-coffee-medium">
                      {getUserDisplayName(ticket.assignedToUserId) || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-coffee-medium">
                      {formatDate(ticket.creationDate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center space-x-3 justify-end">
                        <button
                          className="text-coffee-primary p-1.5 rounded-full hover:bg-coffee-light hover:text-coffee-dark transition-colors"
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
                        {getStateName(ticket.stateId) !== 'Closed' && (
                          <button
                            className="text-green-500 p-1.5 rounded-full hover:bg-green-50 hover:text-green-700 transition-colors"
                            onClick={() => handleCloseTicket(ticket.id)}
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
          onClose={() => {
            setShowViewModal(false);
            setSelectedTicket(null);
          }}
          types={types}
          states={states}
          users={users}
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
      />
    </div>
  );
};