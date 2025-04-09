import React, { memo } from 'react';
import useTickets from '../hooks/useTickets.js';
import Badge from './Badge.js';
import Avatar from './Avatar.js';
import Card from './Card.js';
import './TicketCard.css';
import { truncateText } from '../utils/constants.js';

/**
 * TicketCard component displays a summarized view of a ticket
 * Memoized for better performance when rendering lists
 * 
 * @param {Object} props
 * @param {Object} props.ticket - The ticket data to display
 * @param {Function} props.onCardClick - Optional click handler for the card
 * @param {boolean} props.showDetails - Whether to show extended details
 * @param {String} props.className - Additional CSS classes
 */
const TicketCard = ({ ticket, onCardClick, showDetails = false, className = '' }) => {
  const { 
    getTypeName, 
    getStateName, 
    getPriorityName,
    getUserDisplayName, 
    formatTicketDate
  } = useTickets();

  const handleClick = () => {
    if (onCardClick) {
      onCardClick(ticket);
    }
  };

  // Extract needed data
  const typeDisplay = getTypeName(ticket.typeId);
  const stateDisplay = getStateName(ticket.stateId);
  const priorityDisplay = getPriorityName(ticket.priorityId);
  const assigneeName = getUserDisplayName(ticket.assignedToUserId) || 'Unassigned';
  
  // Get the priority class for the card border
  const priorityClass = `priority-${priorityDisplay.toLowerCase()}`;

  return (
    <Card 
      onClick={handleClick} 
      className={`ticket-card ${priorityClass} ${className} hover:shadow-coffee-hover transition-shadow duration-200`}
      bodyClassName="p-0"
    >
      <div className="ticket-card-header p-3 border-b border-coffee-cream">
        <div className="flex justify-between items-start">
          <div className="ticket-card-title font-medium text-coffee-dark">{ticket.title}</div>
          <Badge 
            type="priority"
            text={priorityDisplay}
            value={priorityDisplay}
            className="ml-2 flex-shrink-0"
          />
        </div>
        {showDetails && ticket.description && (
          <div className="mt-2 text-sm text-coffee-medium">
            {truncateText(ticket.description, 100)}
          </div>
        )}
      </div>
      <div className="ticket-card-body p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge
            type="status"
            text={stateDisplay}
            value={stateDisplay}
          />
          <div className="text-sm text-coffee-medium">{typeDisplay}</div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <Avatar 
              name={assigneeName} 
              size="xs" 
              className="mr-2"
            />
            <span className="text-xs text-coffee-medium">
              {assigneeName}
            </span>
          </div>
          
          {ticket.creationDate && (
            <div className="text-xs text-coffee-medium">
              {formatTicketDate(ticket.creationDate)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Wrap component with React.memo for performance optimization
export default memo(TicketCard, (prevProps, nextProps) => {
  // Custom comparison function to control re-renders
  // Only re-render if the ticket data actually changed
  return JSON.stringify(prevProps.ticket) === JSON.stringify(nextProps.ticket);
});