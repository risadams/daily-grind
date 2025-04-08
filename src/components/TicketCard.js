import React from 'react';
import { Card } from 'react-bootstrap';
import { useDatabase } from '../hooks/useDatabase';
import './TicketCard.css';

export default function TicketCard({ ticket, onCardClick }) {
  const { 
    getTypeById, 
    getStateById, 
    getPriorityNameById,
    getPriorityColorById,
    getUserDisplayName
  } = useDatabase();

  const handleClick = () => {
    if (onCardClick) {
      onCardClick(ticket);
    }
  };

  const classes = `ticket-card ${getPriorityColorById(ticket.priorityId)}`;

  return (
    <Card onClick={handleClick} className={classes}>
      <div className="ticket-card-header">
        <div className="ticket-card-title">{ticket.title}</div>
        <div className="ticket-card-type">{getTypeById(ticket.typeId)}</div>
      </div>
      <div className="ticket-card-body">
        <div className="ticket-card-state">{getStateById(ticket.stateId)}</div>
        <div className="ticket-card-priority">{getPriorityNameById(ticket.priorityId)}</div>
        <div className="ticket-card-assignee">
          {getUserDisplayName(ticket.assignedToUserId)}
        </div>
      </div>
    </Card>
  );
}