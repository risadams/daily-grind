import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext.js';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaEdit, FaEye, FaCheckCircle, FaPlus } from 'react-icons/fa/index.js';
import Modal from '../components/Modal.js';
import TicketDetail from '../components/TicketDetail.js';
import TicketFormDialog from '../components/TicketFormDialog.js';
import PageHeader from '../components/PageHeader.js';

export default function AllTicketsPage() {
  const { tickets, allTickets, types, states, priorities, users, loading, error, createTicket, updateTicket, deleteTicket, getUserDisplayName } = useDatabase();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: ''
  });

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
    let result = [...allTickets];

    // Apply search term filter
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter(ticket =>
        ticket.title.toLowerCase().includes(lowercasedTerm) ||
        (ticket.description && ticket.description.toLowerCase().includes(lowercasedTerm))
      );
    }

    // Apply specific filters
    if (filters.status) {
      result = result.filter(ticket => ticket.stateId === filters.status);
    }

    if (filters.type) {
      result = result.filter(ticket => ticket.typeId === filters.type);
    }

    if (filters.priority) {
      result = result.filter(ticket => ticket.priorityId === filters.priority);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Handle special case for dates
        if (sortConfig.key === 'creationDate') {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
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
  }, [allTickets, searchTerm, filters, sortConfig]);

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
      const closedStateId = states.find(state => state.name === 'Closed')?.id;
      if (!closedStateId) throw new Error('Could not find Closed state');

      const result = await updateTicket(ticketId, { stateId: closedStateId });
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
    if (sortConfig.key !== columnName) return <FaSort className="inline ml-1 text-coffee-medium" />;
    return sortConfig.direction === 'asc' ?
      <FaSortUp className="inline ml-1 text-coffee-dark" /> :
      <FaSortDown className="inline ml-1 text-coffee-dark" />;
  };

  // Helper function for getting formatted names
  const getTypeName = (typeId) => {
    // Check if types is loaded and typeId is valid
    if (!typeId || !types || types.length === 0) return 'Unknown';

    // Convert typeId to string for comparison if needed
    const searchId = typeof typeId === 'string' ? typeId : String(typeId);

    // Find the type by ID using string comparison to be safe
    const typeObj = types.find(type => String(type.id) === searchId);
    return typeObj ? typeObj.name : 'Unknown';
  };

  const getStateName = (stateId) => {
    // Check if states is loaded and stateId is valid
    if (!stateId || !states || states.length === 0) return 'Unknown';

    // Convert stateId to string for comparison if needed
    const searchId = typeof stateId === 'string' ? stateId : String(stateId);

    // Find the state by ID using string comparison to be safe
    const stateObj = states.find(state => String(state.id) === searchId);
    return stateObj ? stateObj.name : 'Unknown';
  };

  // Helper function to get priority name from priorityId
  const getPriorityName = (priorityId) => {
    // Check if priorities is loaded and priorityId is valid
    if (!priorityId || !priorities || priorities.length === 0) return 'Medium';

    // Convert priorityId to string for comparison if needed
    const searchId = typeof priorityId === 'string' ? priorityId : String(priorityId);

    // Find the priority by ID using string comparison to be safe
    const priorityObj = priorities.find(priority => String(priority.id) === searchId);
    return priorityObj ? priorityObj.name : 'Medium';
  };

  // Helper function to get priority color based on priority name
  const getPriorityColorClass = (priorityId) => {
    const priority = priorities.find(p => p.id === priorityId);
    const color = priority?.color || 'gray';
    return `bg-${color}-100 text-${color}-800`;
  };

  // Format date to handle edge cases
  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleDateString();
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Success message handler
  const showSuccessMessage = (message) => {
    setTicketActionSuccess({ show: true, message });
    setTimeout(() => {
      setTicketActionSuccess({ show: false, message: '' });
    }, 3000);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Success message alert */}
      {ticketActionSuccess.show && (
        <div className="mb-4 p-4 rounded-md bg-green-50 text-green-800">
          <span className="block sm:inline">{ticketActionSuccess.message}</span>
        </div>
      )}

      <PageHeader
        title="All Tickets"
        subtitle="View and manage all tickets in your system"
      />

      {/* Filter and Search Bar */}
      <div className="bg-white shadow rounded-lg mb-6 p-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="w-full md:w-1/3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-coffee-medium" />
              </div>
              <input
                type="text"
                className="bg-gray-50 border border-coffee-light text-coffee-dark rounded-lg block w-full pl-10 p-2"
                placeholder="Search for tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 items-stretch md:items-center">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="bg-gray-50 border border-coffee-light text-coffee-dark rounded-lg p-2 pr-8 appearance-none"
              style={{ backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%235b5b5b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")" }}
            >
              <option value="">All Statuses</option>
              {states.map(state => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </select>

            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="bg-gray-50 border border-coffee-light text-coffee-dark rounded-lg p-2 pr-8 appearance-none"
              style={{ backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%235b5b5b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")" }}
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="bg-gray-50 border border-coffee-light text-coffee-dark rounded-lg p-2 pr-8 appearance-none"
              style={{ backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%235b5b5b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")" }}
            >
              <option value="">All Priorities</option>
              {priorities && priorities.map(priority => (
                <option key={priority.id} value={priority.id}>{priority.name}</option>
              ))}
            </select>

            <button
              className="inline-flex items-center bg-coffee-primary text-white rounded-lg p-2 hover:bg-coffee-dark"
              onClick={() => setShowTicketModal(true)}
            >
              <FaPlus className="mr-1" /> Add Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-primary"></div>
            <p className="ml-3 text-coffee-medium">Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-red-500">{error}</p>
            <button
              className="mt-4 bg-coffee-primary text-white px-4 py-2 rounded hover:bg-coffee-dark"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center p-10">
            <svg className="mx-auto h-12 w-12 text-coffee-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-coffee-dark">No tickets found</h3>
            <p className="mt-1 text-coffee-medium">Try adjusting your search or filter criteria.</p>
            <button
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-coffee-primary hover:bg-coffee-dark"
              onClick={() => setShowTicketModal(true)}
            >
              <FaPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Create New Ticket
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-coffee-light">
              <thead className="bg-coffee-light">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    Title {getSortIcon('title')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('typeId')}
                  >
                    Type {getSortIcon('typeId')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('stateId')}
                  >
                    Status {getSortIcon('stateId')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('priorityId')}
                  >
                    Priority {getSortIcon('priorityId')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('assignedToUserId')}
                  >
                    Assigned To {getSortIcon('assignedToUserId')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('creationDate')}
                  >
                    Created {getSortIcon('creationDate')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-coffee-light">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-coffee-light">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-coffee-dark">
                      {ticket.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-coffee-medium">
                      {getTypeName(ticket.typeId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${getStateName(ticket.stateId) === 'Closed' ? 'bg-green-100 text-green-800' :
                          getStateName(ticket.stateId) === 'InProgress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'}`}
                      >
                        {getStateName(ticket.stateId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-coffee-medium">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${getPriorityColorClass(ticket.priorityId)}`}
                      >
                        {getPriorityName(ticket.priorityId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-coffee-medium">
                      {getUserDisplayName(ticket.assignedToUserId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-coffee-medium">
                      {formatDate(ticket.creationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                      <button
                        className="text-coffee-primary hover:text-coffee-dark inline-block mr-2"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowViewModal(true);
                        }}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="text-yellow-500 hover:text-yellow-700 inline-block mr-2"
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
                          className="text-green-500 hover:text-green-700 inline-block"
                          onClick={() => handleCloseTicket(ticket.id)}
                          title="Close Ticket"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
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