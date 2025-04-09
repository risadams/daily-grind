import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { FaPlus, FaCheck, FaSpinner, FaClock, FaExclamationTriangle, FaEye, FaEdit, FaTrash, FaCheckCircle, FaTimes, FaFilter } from 'react-icons/fa/index.js';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext.js';
import { logout } from '../services/authService.js';
import Card from '../components/Card.js';
import Button from '../components/Button.js';
import Logo from '../components/Logo.js';
import Modal from '../components/Modal.js';
import TicketDetail from '../components/TicketDetail.js';
import TicketFormDialog from '../components/TicketFormDialog.js';
import PageHeader from '../components/PageHeader.js';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { tickets, types, states, priorities, users, loading, error, createTicket, updateTicket, deleteTicket, getUserDisplayName } = useDatabase();
  const navigate = useNavigate();
  
  // State for ticket modals
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketActionSuccess, setTicketActionSuccess] = useState({ show: false, message: '' });
  
  // Filter state
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filter, setFilter] = useState('all');

  // Apply filter when tickets or filter changes
  useEffect(() => {
    if (!tickets) return;
    
    switch (filter) {
      case 'in-progress':
        setFilteredTickets(tickets.filter(t => getStateName(t.stateId).toLowerCase().replace(' ', '') === 'inprogress'));
        break;
      case 'closed':
        setFilteredTickets(tickets.filter(t => getStateName(t.stateId).toLowerCase() === 'closed'));
        break;
      case 'todo':
        setFilteredTickets(tickets.filter(t => getStateName(t.stateId).toLowerCase().replace(' ', '') === 'todo'));
        break;
      default:
        setFilteredTickets(tickets);
    }
  }, [tickets, filter]);

  // Helper functions for displaying ticket data with type-safe comparisons
  const getTypeName = (typeId) => {
    const type = types.find(t => 
      t.id === typeId || 
      t.id === Number(typeId) || 
      String(t.id) === typeId
    );
    return type ? type.name : 'Unknown';
  };

  const getStateName = (stateId) => {
    const state = states.find(s => 
      s.id === stateId || 
      s.id === Number(stateId) || 
      String(s.id) === stateId
    );
    return state ? state.name : 'Unknown';
  };
  
  const getPriorityName = (priorityId) => {
    if (!priorityId || !priorities || priorities.length === 0) return 'Medium';
    const searchId = typeof priorityId === 'string' ? priorityId : String(priorityId);
    const priorityObj = priorities.find(priority => String(priority.id) === searchId);
    return priorityObj ? priorityObj.name : 'Medium';
  };
  
  const getPriorityColorClass = (priorityId) => {
    const priority = priorities?.find(p => p.id === priorityId);
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

  // Get status icon based on state
  const getStatusIcon = (stateId) => {
    const stateName = getStateName(stateId).toLowerCase();
    if (stateName === 'closed') return <FaCheck className="text-green-500" />;
    if (stateName === 'inprogress' || stateName === 'in progress') return <FaSpinner className="text-yellow-500" />;
    if (stateName === 'open' || stateName === 'todo' || stateName === 'to do') return <FaClock className="text-blue-500" />;
    return <FaExclamationTriangle className="text-coffee-accent" />;
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

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Handle viewing a ticket
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowViewModal(true);
  };

  // Handle editing a ticket
  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowViewModal(false);
    setShowEditModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    setSelectedTicket(ticket);
    setShowViewModal(false);
    setShowDeleteConfirm(true);
  };

  // Handle ticket creation
  const handleCreateTicket = async (ticketData) => {
    try {
      const result = await createTicket(ticketData);
      
      if (result.success) {
        showSuccessMessage('Ticket created successfully!');
        setShowTicketModal(false);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  };

  // Handle ticket update
  const handleUpdateTicket = async (ticketData) => {
    try {
      if (!selectedTicket) throw new Error('No ticket selected for update');
      
      const result = await updateTicket(selectedTicket.id, ticketData);
      
      if (result.success) {
        showSuccessMessage('Ticket updated successfully!');
        setShowEditModal(false);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      setTicketActionSuccess({ show: true, message: 'Failed to update ticket. Please try again.' });
      setTimeout(() => {
        setTicketActionSuccess({ show: false, message: '' });
      }, 3000);
      throw error;
    }
  };

  // Handle ticket deletion
  const handleDeleteTicket = async () => {
    try {
      if (!selectedTicket) throw new Error('No ticket selected for deletion');
      
      const result = await deleteTicket(selectedTicket.id);
      
      if (result.success) {
        showSuccessMessage('Ticket deleted successfully!');
        setShowDeleteConfirm(false);
        setSelectedTicket(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setTicketActionSuccess({ show: true, message: 'Failed to delete ticket. Please try again.' });
      setTimeout(() => {
        setTicketActionSuccess({ show: false, message: '' });
      }, 3000);
    }
  };

  // Show success message
  const showSuccessMessage = (message) => {
    setTicketActionSuccess({ show: true, message });
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setTicketActionSuccess({ show: false, message: '' });
    }, 3000);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <PageHeader
        title={
          <div className="flex items-center">
            <span className="mr-2">☕</span>
            <span>My Dashboard</span>
          </div>
        }
        subtitle="Your daily grind at a glance"
      />
      
      {/* Success notification */}
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

      {/* Main Dashboard Content */}
      <div className="space-y-6">
        {/* Welcome and Quick Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-coffee-light to-coffee-dark">
                <h2 className="text-xl font-bold text-white mb-1">Welcome Back!</h2>
                <p className="text-coffee-cream opacity-80">Here's your productivity snapshot</p>
              </div>
              
              {currentUser ? (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <div className="h-14 w-14 rounded-full bg-coffee-medium text-white flex items-center justify-center font-bold text-xl border-2 border-coffee-cream shadow-md">
                        {currentUser.email.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-coffee-dark">{currentUser.email}</h3>
                      <p className="text-sm text-coffee-medium">
                        Signed in via {currentUser?.providerData[0]?.providerId || 'Email/Password'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-coffee-light bg-opacity-30 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-coffee-dark mb-2">Quick Actions</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowTicketModal(true)}
                        className="flex items-center gap-1 flex-1 justify-center py-2 bg-coffee-dark text-white rounded-md hover:bg-coffee-primary transition-all shadow-sm"
                      >
                        <FaPlus className="text-xs" /> New Ticket
                      </button>
                      <button 
                        onClick={() => navigate('/all-tickets')}
                        className="flex items-center gap-1 flex-1 justify-center py-2 bg-white text-coffee-dark border border-coffee-medium rounded-md hover:bg-coffee-light transition-all"
                      >
                        <FaEye className="text-xs" /> View All
                      </button>
                    </div>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    className="text-coffee-primary hover:text-coffee-dark text-sm font-medium transition-colors flex items-center"
                  >
                    Manage your profile →
                  </Link>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="mr-4">
                      <Logo size="large" />
                    </div>
                    <div>
                      <p className="text-coffee-dark mb-3">Please sign in to view your dashboard information.</p>
                      <Button 
                        onClick={() => navigate('/login')}
                        variant="primary"
                      >
                        Sign In
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Tickets Stats Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-coffee-primary">
                <div className="flex justify-between items-center">
                  <p className="text-sm uppercase text-coffee-medium font-medium">Total Tickets</p>
                  <span className="p-2 bg-coffee-light bg-opacity-30 rounded-full">
                    <FaFilter className="h-4 w-4 text-coffee-dark" />
                  </span>
                </div>
                <h3 className="mt-2 text-3xl font-bold text-coffee-dark">{tickets.length}</h3>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-coffee-medium">Across all statuses</span>
                </div>
              </div>
              
              {/* Completed Stats Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                <div className="flex justify-between items-center">
                  <p className="text-sm uppercase text-coffee-medium font-medium">Completed</p>
                  <span className="p-2 bg-green-100 bg-opacity-60 rounded-full">
                    <FaCheckCircle className="h-4 w-4 text-green-600" />
                  </span>
                </div>
                <h3 className="mt-2 text-3xl font-bold text-coffee-dark">
                  {tickets.filter(t => getStateName(t.stateId).toLowerCase() === 'closed').length}
                </h3>
                <div className="mt-2 flex items-center text-sm">
                  <span className={`text-green-600 ${
                    tickets.length > 0 
                      ? `font-medium (${Math.round((tickets.filter(t => getStateName(t.stateId).toLowerCase() === 'closed').length / tickets.length) * 100)}%)`
                      : ''
                  }`}>
                    Closed tickets
                  </span>
                </div>
              </div>
              
              {/* In Progress Stats Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                  <p className="text-sm uppercase text-coffee-medium font-medium">In Progress</p>
                  <span className="p-2 bg-blue-100 bg-opacity-60 rounded-full">
                    <FaSpinner className="h-4 w-4 text-blue-600" />
                  </span>
                </div>
                <h3 className="mt-2 text-3xl font-bold text-coffee-dark">
                  {tickets.filter(t => getStateName(t.stateId).toLowerCase().replace(' ', '') === 'inprogress').length}
                </h3>
                <div className="mt-2 flex items-center text-sm">
                  <span className={`text-blue-600 ${
                    tickets.length > 0 
                      ? `font-medium (${Math.round((tickets.filter(t => getStateName(t.stateId).toLowerCase().replace(' ', '') === 'inprogress').length / tickets.length) * 100)}%)`
                      : ''
                  }`}>
                    Active work
                  </span>
                </div>
              </div>
            </div>
            
            {/* Priority Distribution Card */}
            <div className="mt-4 bg-white shadow-md rounded-xl p-6">
              <h3 className="text-lg font-medium text-coffee-dark mb-4">Ticket Priority Distribution</h3>
              <div className="flex items-center space-x-4">
                {/* High Priority */}
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-coffee-medium">High</span>
                    <span className="font-medium text-coffee-dark">
                      {tickets.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'high').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ 
                        width: tickets.length > 0 
                          ? `${(tickets.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'high').length / tickets.length) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Medium Priority */}
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-coffee-medium">Medium</span>
                    <span className="font-medium text-coffee-dark">
                      {tickets.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'medium').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: tickets.length > 0 
                          ? `${(tickets.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'medium').length / tickets.length) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Low Priority */}
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-coffee-medium">Low</span>
                    <span className="font-medium text-coffee-dark">
                      {tickets.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'low').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: tickets.length > 0 
                          ? `${(tickets.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'low').length / tickets.length) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Listing Section */}
        {currentUser && (
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-medium text-coffee-dark flex items-center">
                <span className="mr-2">🎟️</span> Your Tickets
              </h2>
              
              <div className="flex space-x-2">
                <div className="inline-flex items-center rounded-md shadow-sm">
                  <button
                    className={`px-3 py-2 text-sm font-medium rounded-l-md ${filter === 'all' 
                      ? 'bg-coffee-primary text-white' 
                      : 'bg-white text-coffee-dark hover:bg-gray-50 border-r border-gray-200'}`}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`px-3 py-2 text-sm font-medium ${filter === 'todo' 
                      ? 'bg-coffee-primary text-white' 
                      : 'bg-white text-coffee-dark hover:bg-gray-50 border-r border-gray-200'}`}
                    onClick={() => setFilter('todo')}
                  >
                    To Do
                  </button>
                  <button
                    className={`px-3 py-2 text-sm font-medium ${filter === 'in-progress' 
                      ? 'bg-coffee-primary text-white' 
                      : 'bg-white text-coffee-dark hover:bg-gray-50 border-r border-gray-200'}`}
                    onClick={() => setFilter('in-progress')}
                  >
                    In Progress
                  </button>
                  <button
                    className={`px-3 py-2 text-sm font-medium rounded-r-md ${filter === 'closed' 
                      ? 'bg-coffee-primary text-white' 
                      : 'bg-white text-coffee-dark hover:bg-gray-50'}`}
                    onClick={() => setFilter('closed')}
                  >
                    Closed
                  </button>
                </div>
                
                <button
                  className="ml-2 flex items-center gap-2 px-4 py-2 bg-coffee-dark text-white rounded-md hover:bg-coffee-primary transition-all shadow-sm"
                  onClick={() => setShowTicketModal(true)}
                >
                  <FaPlus className="text-sm" /> New
                </button>
              </div>
            </div>
            
            <div className="px-6 py-2 bg-coffee-light bg-opacity-20">
              <div className="flex justify-between text-sm text-coffee-medium">
                <div>
                  Showing {filteredTickets.length} of {tickets.length} tickets
                </div>
                <div>
                  {filter !== 'all' && (
                    <button 
                      onClick={() => setFilter('all')}
                      className="text-coffee-primary hover:underline"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-primary mb-4"></div>
                <p className="text-coffee-medium">Brewing your tickets...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                  <FaExclamationTriangle className="h-8 w-8" />
                </div>
                <p className="text-red-500 font-medium mb-2">Something went wrong</p>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  className="bg-coffee-primary text-white px-4 py-2 rounded-md hover:bg-coffee-dark transition-colors shadow-sm"
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
                <p className="text-coffee-medium mb-6">
                  {filter !== 'all' 
                    ? `You don't have any tickets with the ${filter} status.` 
                    : 'Your workday looks clear! Create a new ticket to get started.'}
                </p>
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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-coffee-light bg-opacity-30">
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Priority</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Assigned To</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Created</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-coffee-dark uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-coffee-light hover:bg-opacity-10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-coffee-dark">{ticket.title}</div>
                          <div className="text-xs text-coffee-medium truncate max-w-xs">
                            {ticket.description || 'No description provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-coffee-dark">{getTypeName(ticket.typeId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${getStatusColorClass(ticket.stateId)}`}
                          >
                            {getStateName(ticket.stateId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${getPriorityColorClass(ticket.priorityId)}`}
                          >
                            {getPriorityName(ticket.priorityId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-coffee-medium">
                          {getUserDisplayName(ticket.assignedToUserId) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-coffee-medium">
                          {formatDate(ticket.creationDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2 justify-end">
                            <button 
                              className="text-coffee-primary p-1.5 rounded-full hover:bg-coffee-light hover:text-coffee-dark transition-colors"
                              onClick={() => handleViewTicket(ticket)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="text-yellow-500 p-1.5 rounded-full hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                              onClick={() => handleEditTicket(ticket)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            {getStateName(ticket.stateId) !== 'Closed' && (
                              <button
                                className="text-green-500 p-1.5 rounded-full hover:bg-green-50 hover:text-green-700 transition-colors"
                                onClick={() => {
                                  const closedStateId = states.find(state => state.name === 'Closed')?.id;
                                  if (closedStateId) {
                                    handleUpdateTicket({ ...ticket, stateId: closedStateId });
                                  }
                                }}
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
        onClose={() => setShowViewModal(false)}
        title="Ticket Details"
      >
        <TicketDetail 
          ticket={selectedTicket}
          onEdit={handleEditTicket}
          onDelete={handleDeleteConfirm}
          types={types}
          states={states}
          users={users}
        />
      </Modal>

      {/* Edit Ticket Modal */}
      <TicketFormDialog
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        ticket={selectedTicket}
        onSubmit={handleUpdateTicket}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Deletion"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-coffee-dark">
            Are you sure you want to delete the ticket "{selectedTicket?.title}"?
          </p>
          <p className="text-sm text-coffee-medium">
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTicket}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;