import React from 'react';
import { useDatabase } from '../context/DatabaseContext.js';
import Button from './Button.js';
import { FaEdit, FaTrash, FaClock } from 'react-icons/fa/index.js';

const TicketDetail = ({ ticket, onEdit, onDelete }) => {
  const { types, states, formatUserDisplayName } = useDatabase();
  
  if (!ticket) return null;
  
  // Find type and state by ID (supporting both string and number comparisons)
  const type = types.find(t => t.id === ticket.typeId || t.id === Number(ticket.typeId) || String(t.id) === ticket.typeId);
  const state = states.find(s => s.id === ticket.stateId || s.id === Number(ticket.stateId) || String(s.id) === ticket.stateId);
  
  // Log the first few items of types and states arrays for debugging
  console.log("First type:", types.length > 0 ? types[0] : null);
  console.log("First state:", states.length > 0 ? states[0] : null);
  console.log("Type and state ID types:", 
    ticket ? `typeId: ${ticket.typeId} (${typeof ticket.typeId}), stateId: ${ticket.stateId} (${typeof ticket.stateId})` : "No ticket"
  );
  
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-display font-bold text-coffee-dark">{ticket.title}</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="small"
            icon={<FaEdit />}
            onClick={() => onEdit(ticket)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="small"
            icon={<FaTrash />}
            onClick={() => onDelete(ticket.id)}
          >
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-coffee-light rounded-lg p-4">
          <h3 className="text-sm uppercase font-medium text-coffee-medium mb-2">Details</h3>
          <div className="space-y-3">
            <div>
              <span className="block text-xs text-coffee-medium">Type</span>
              <span className="block font-medium text-coffee-dark">
                {type ? type.name : `Unknown (ID: ${ticket.typeId})`}
              </span>
            </div>
            <div>
              <span className="block text-xs text-coffee-medium">Status</span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                state?.name === 'Closed' ? 'bg-green-100 text-green-800' : 
                state?.name === 'InProgress' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-coffee-light text-coffee-dark'
              }`}>
                {state ? state.name : `Unknown (ID: ${ticket.stateId})`}
              </span>
            </div>
            <div>
              <span className="block text-xs text-coffee-medium">Created</span>
              <span className="block font-medium text-coffee-dark">{formatDate(ticket.creationDate)}</span>
            </div>
            <div>
              <span className="block text-xs text-coffee-medium">Last Updated</span>
              <span className="block font-medium text-coffee-dark">{formatDate(ticket.lastModifiedDate)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-coffee-light rounded-lg p-4">
          <h3 className="text-sm uppercase font-medium text-coffee-medium mb-2">People</h3>
          <div className="space-y-3">
            <div>
              <span className="block text-xs text-coffee-medium">Assigned to</span>
              <span className="block font-medium text-coffee-dark">
                {formatUserDisplayName(ticket.assignedToUserId)}
              </span>
            </div>
            <div>
              <span className="block text-xs text-coffee-medium">Created by</span>
              <span className="block font-medium text-coffee-dark">
                {formatUserDisplayName(ticket.createdByUserId)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm uppercase font-medium text-coffee-medium mb-2">Description</h3>
        <div className="bg-white p-4 rounded-lg border border-coffee-light">
          {ticket.description ? 
            <p className="text-coffee-dark">{ticket.description}</p> :
            <p className="text-coffee-medium italic">No description provided</p>
          }
        </div>
      </div>
      
      <div className="border-t border-coffee-light pt-4">
        <div className="flex items-center text-coffee-medium text-sm">
          <FaClock className="mr-1" />
          <span>Ticket ID: {ticket.id}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;