import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaTag, FaClock, FaArrowRight } from 'react-icons/fa/index.js';
import { useDatabase } from '../context/DatabaseContext.js';
import TaskDetail from './TaskDetail.js';
import './TaskCard.css';
import { useTheme } from '../context/ThemeContext.js';

const TaskCard = ({ task, showActions = true, compact = false, onClick = null }) => {
  const navigate = useNavigate();
  const { types, priorities, states, users } = useDatabase();
  const { isDarkMode } = useTheme();
  const [showDetail, setShowDetail] = useState(false);

  // Handle clicks on the card
  const handleClick = (e) => {
    // Don't navigate if they clicked a button or link inside the card
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || 
        e.target.closest('button') || e.target.closest('a')) {
      return;
    }

    if (onClick) {
      onClick(task);
    } else {
      setShowDetail(true);
    }
  };

  // Get display name for the task type
  const getTypeName = () => {
    if (!task.typeId) return 'No Type';
    const type = types?.find(t => String(t.id) === String(task.typeId));
    return type?.name || 'Unknown Type';
  };

  // Get display name for the task priority
  const getPriorityName = () => {
    if (!task.priorityId) return 'No Priority';
    const priority = priorities?.find(p => String(p.id) === String(task.priorityId));
    return priority?.name || 'Unknown Priority';
  };

  // Get display name for the task state
  const getStateName = () => {
    if (!task.stateId) return 'No Status';
    const state = states?.find(s => String(s.id) === String(task.stateId));
    return state?.name || 'Unknown Status';
  };

  // Get user display name
  const getUserName = (userId) => {
    if (!userId) return 'Unassigned';
    const user = users?.find(u => String(u.id) === String(userId));
    return user?.displayName || user?.email || 'Unknown User';
  };

  // Get appropriate color class for priority
  const getPriorityColorClass = () => {
    const priorityName = getPriorityName().toLowerCase();
    
    switch (priorityName) {
      case 'high':
        return 'task-priority-high';
      case 'medium':
        return 'task-priority-medium';
      case 'low':
        return 'task-priority-low';
      default:
        return 'task-priority-medium';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const cardClasses = `
    task-card 
    ${isDarkMode ? 'task-card-dark' : ''} 
    ${compact ? 'task-card-compact' : ''}
  `;

  return (
    <>
      <div 
        className={cardClasses}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        {/* Task Title */}
        <div className="task-card-title">
          <div className={`task-priority-indicator ${getPriorityColorClass()}`}></div>
          <h3>{task.title}</h3>
        </div>
        
        {/* Type and State */}
        <div className="task-card-meta">
          <span className="task-type">{getTypeName()}</span>
          <span className="task-state">{getStateName()}</span>
        </div>
        
        {/* Description Preview (if not compact) */}
        {!compact && task.description && (
          <div className="task-card-description">
            <p>{task.description.length > 80 ? 
                task.description.substring(0, 77) + '...' : 
                task.description}
            </p>
          </div>
        )}
        
        {/* Task ID and Creation Date */}
        <div className="task-card-footer">
          <div className="task-id">Task-{task.id}</div>
          {task.creationDate && (
            <div className="task-date">
              <FaClock className="icon" />
              {formatDate(task.creationDate)}
            </div>
          )}
        </div>
        
        {/* Assignee (if any) */}
        {task.assignedToUserId && (
          <div className="task-card-assignee">
            <FaUser className="icon" />
            <span>{getUserName(task.assignedToUserId)}</span>
          </div>
        )}
        
        {/* Actions (if enabled) */}
        {showActions && (
          <div className="task-card-actions">
            <Link to={`/tasks/${task.id}`} className="task-detail-link">
              View Details <FaArrowRight className="icon" />
            </Link>
          </div>
        )}
      </div>
      
      {/* Task Detail Modal */}
      {showDetail && (
        <div className="task-detail-modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="task-detail-modal-content" onClick={e => e.stopPropagation()}>
            <button className="task-detail-close" onClick={() => setShowDetail(false)}>×</button>
            <TaskDetail task={task} />
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;