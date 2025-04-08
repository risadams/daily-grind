import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useDatabase } from '../context/DatabaseContext.js';
import { logout } from '../services/authService.js';
import Card from '../components/Card.js';
import Button from '../components/Button.js';
import Logo from '../components/Logo.js';
import { FaPlus, FaCheck, FaSpinner, FaClock, FaExclamationTriangle } from 'react-icons/fa/index.js';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { tickets, types, states, users, loading, error } = useDatabase();
  const navigate = useNavigate();

  // Helper functions for displaying ticket data
  const getTypeName = (typeId) => {
    const type = types.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  const getStateName = (stateId) => {
    const state = states.find(s => s.id === stateId);
    return state ? state.name : 'Unknown';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.email : 'Unassigned';
  };

  // Get status icon based on state
  const getStatusIcon = (stateId) => {
    const stateName = getStateName(stateId);
    if (stateName === 'Closed') return <FaCheck className="text-green-500" />;
    if (stateName === 'InProgress') return <FaSpinner className="text-yellow-500" />;
    if (stateName === 'Open') return <FaClock className="text-coffee-medium" />;
    return <FaExclamationTriangle className="text-coffee-accent" />;
  };

  return (
    <div className="space-y-6">
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          getStateName(ticket.stateId) === 'Closed' ? 'bg-green-100 text-green-800' : 
                          getStateName(ticket.stateId) === 'InProgress' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-coffee-light text-coffee-dark'
                        }`}>
                          {getStateName(ticket.stateId)}
                        </span>
                        <span className="mt-1 text-xs text-coffee-medium">
                          Assigned to: {getUserName(ticket.assignedToUserId)}
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
    </div>
  );
};

export default Dashboard;