import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useDatabase } from '../context/DatabaseContext.js';
import { logout } from '../services/authService.js';
import Card from '../components/Card.js';
import Button from '../components/Button.js';
import Logo from '../components/Logo.js';
import Modal from '../components/Modal.js';
import TicketForm from '../components/TicketForm.js';
import TicketDetail from '../components/TicketDetail.js';
import { FaPlus, FaCheck, FaSpinner, FaClock, FaExclamationTriangle, FaEye } from 'react-icons/fa/index.js';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { tickets, types, states, users, loading, error, createTicket, updateTicket, deleteTicket, formatUserDisplayName } = useDatabase();
  const navigate = useNavigate();
  
  // State for ticket modals
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketActionSuccess, setTicketActionSuccess] = useState({ show: false, message: '' });

  // Helper functions for displaying ticket data
  const getTypeName = (typeId) => {
    const type = types.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  const getStateName = (stateId) => {
    const state = states.find(s => s.id === stateId);
    return state ? state.name : 'Unknown';
  };

  // Get status icon based on state
  const getStatusIcon = (stateId) => {
    const stateName = getStateName(stateId);
    if (stateName === 'Closed') return <FaCheck className="text-green-500" />;
    if (stateName === 'InProgress') return <FaSpinner className="text-yellow-500" />;
    if (stateName === 'Open') return <FaClock className="text-coffee-medium" />;
    return <FaExclamationTriangle className="text-coffee-accent" />;
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
    <div className="space-y-6">
      {/* Success notification */}
      {ticketActionSuccess.show && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg relative">
          <span className="block sm:inline">{ticketActionSuccess.message}</span>
        </div>
      )}

      {/* Welcome Card */}
      <Card 
        variant="highlighted"
        title="Welcome to your Daily Grind"
        subtitle="Track your tickets and boost your productivity"
      >
        {currentUser ? (
          <div className="bg-white p-4 rounded-md">
            <div className="flex items-center mb-4">
              <div className="mr-4">
                <div className="h-12 w-12 rounded-full bg-coffee-medium text-white flex items-center justify-center">
                  {currentUser.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-coffee-dark">{currentUser.email}</h3>
                <p className="text-sm text-coffee-medium">
                  Authentication via {currentUser?.providerData[0]?.providerId || 'Email/Password'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="flex-1 bg-coffee-light rounded-md p-3">
                <p className="text-xs uppercase text-coffee-medium font-medium">Assigned Tickets</p>
                <p className="text-2xl font-bold text-coffee-dark">{tickets.length}</p>
              </div>
              <div className="flex-1 bg-coffee-light rounded-md p-3">
                <p className="text-xs uppercase text-coffee-medium font-medium">Completed</p>
                <p className="text-2xl font-bold text-coffee-dark">
                  {tickets.filter(t => getStateName(t.stateId) === 'Closed').length}
                </p>
              </div>
              <div className="flex-1 bg-coffee-light rounded-md p-3">
                <p className="text-xs uppercase text-coffee-medium font-medium">In Progress</p>
                <p className="text-2xl font-bold text-coffee-dark">
                  {tickets.filter(t => getStateName(t.stateId) === 'InProgress').length}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-coffee-light p-4 rounded shadow border border-coffee-cream">
            <div className="flex items-center">
              <div className="mr-4">
                <Logo size="large" />
              </div>
              <div>
                <p className="text-coffee-dark">Please sign in to view your dashboard information.</p>
                <Button 
                  onClick={() => navigate('/login')}
                  variant="primary"
                  className="mt-2"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {currentUser && (
        <Card
          title="Your Tickets"
          headerAction={
            <Button 
              variant="primary" 
              size="small"
              icon={<FaPlus />}
              onClick={() => setShowTicketModal(true)}
            >
              Add Ticket
            </Button>
          }
        >
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-coffee-dark"></div>
              <p className="mt-2 text-coffee-medium">Brewing your tickets...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-coffee-accent" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10">
              <div className="mx-auto h-20 w-20 rounded-full bg-coffee-light flex items-center justify-center">
                <svg className="h-10 w-10 text-coffee-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-coffee-dark">No tickets</h3>
              <p className="mt-1 text-coffee-medium">Your workday looks clear! Create a new ticket to get started.</p>
              <div className="mt-6">
                <Button 
                  variant="primary"
                  icon={<FaPlus />}
                  onClick={() => setShowTicketModal(true)}
                >
                  Create First Ticket
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md">
              <ul className="divide-y divide-coffee-light">
                {tickets.map((ticket) => (
                  <li key={ticket.id} className="transition-colors hover:bg-coffee-light">
                    <div className="px-4 py-4 flex items-center justify-between">
                      <div className="flex items-start">
                        <div className="mr-4">
                          {getStatusIcon(ticket.stateId)}
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-coffee-dark">{ticket.title}</h4>
                          <div className="flex mt-1 items-center">
                            <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-coffee-light text-coffee-dark">
                              {getTypeName(ticket.typeId)}
                            </span>
                            <span className="ml-2 text-sm text-coffee-medium">
                              {ticket.description || 'No description provided'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex flex-col items-end">
                        <div className="flex space-x-2 mb-2">
                          <Button
                            variant="outline"
                            size="small"
                            icon={<FaEye />}
                            onClick={() => handleViewTicket(ticket)}
                          >
                            View
                          </Button>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          getStateName(ticket.stateId) === 'Closed' ? 'bg-green-100 text-green-800' : 
                          getStateName(ticket.stateId) === 'InProgress' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-coffee-light text-coffee-dark'
                        }`}>
                          {getStateName(ticket.stateId)}
                        </span>
                        <span className="mt-1 text-xs text-coffee-medium">
                          Assigned to: {formatUserDisplayName(ticket.assignedToUserId)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
      
      {/* Create Ticket Modal */}
      <Modal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        title="Create New Ticket"
      >
        <TicketForm 
          onSubmit={handleCreateTicket}
          onCancel={() => setShowTicketModal(false)}
        />
      </Modal>

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
        />
      </Modal>

      {/* Edit Ticket Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Ticket"
      >
        <TicketForm 
          initialData={selectedTicket}
          isEditing={true}
          onSubmit={handleUpdateTicket}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

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