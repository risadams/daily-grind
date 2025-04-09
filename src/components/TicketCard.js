import React from 'react';
import { Card } from 'react-bootstrap';
import { useDatabase } from '../context/DatabaseContext.js';
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

  // Get data and ensure we're rendering strings, not objects
  const typeData = getTypeById(ticket.typeId);
  const stateData = getStateById(ticket.stateId);
  const priorityName = getPriorityNameById(ticket.priorityId);
  const assigneeName = getUserDisplayName(ticket.assignedToUserId);

  // Extract string values or provide fallbacks if we receive objects
  const typeDisplay = typeof typeData === 'object' ? (typeData?.name || 'Unknown Type') : typeData;
  const stateDisplay = typeof stateData === 'object' ? (stateData?.name || 'Unknown State') : stateData;
  const priorityDisplay = typeof priorityName === 'object' ? (priorityName?.name || 'Unknown Priority') : priorityName;
  const assigneeDisplay = typeof assigneeName === 'object' ? (assigneeName?.name || 'Unassigned') : assigneeName;

  const classes = `ticket-card ${getPriorityColorById(ticket.priorityId)}`;

  return (
    <Card onClick={handleClick} className={classes}>
      <div className="ticket-card-header">
        <div className="ticket-card-title">{ticket.title}</div>
        <div className="ticket-card-type">{typeDisplay}</div>
      </div>
      <div className="ticket-card-body">
        <div className="ticket-card-state">{stateDisplay}</div>
        <div className="ticket-card-priority">{priorityDisplay}</div>
        <div className="ticket-card-assignee">{assigneeDisplay}</div>
      </div>
    </Card>
  );
}