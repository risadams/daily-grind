import React, { useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext.js';
import Button from './Button.js';
import { FaEdit, FaTrash, FaClock, FaLink, FaLevelUpAlt, FaLevelDownAlt } from 'react-icons/fa/index.js';

const TaskDetail = ({ task, onEdit, onDelete }) => {
  const { tasks, types, states, getTaskChildren, getUserDisplayName } = useDatabase();
  
  if (!task) return null;
  
  // Find type and state by ID (supporting both string and number comparisons)
  const type = types.find(t => t.id === task.typeId || t.id === Number(task.typeId) || String(t.id) === task.typeId);
  const state = states.find(s => s.id === task.stateId || s.id === Number(task.stateId) || String(s.id) === task.stateId);
  
  // Get parent task details
  const getParentTask = () => {
    if (!task.parentTaskId) return null;
    return tasks.find(t => t.id === task.parentTaskId);
  };
  
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get task by ID
  const getTaskById = (id) => {
    return tasks.find(t => t.id === id);
  };

  // Get priority badge color class
  const getPriorityColorClass = (priority) => {
    switch(priority) {
      case 'Highest':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      case 'Lowest':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-yellow-100 text-yellow-800'; // Medium (default)
    }
  };

  const parentTask = getParentTask();
  const linkedTasks = task.linkedTasks || [];
  const childTasks = getTaskChildren(task.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-display font-bold text-coffee-dark">{task.title}</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="small"
            icon={<FaEdit />}
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="small"
            icon={<FaTrash />}
            onClick={() => onDelete(task.id)}
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
                {type ? type.name : `Unknown (ID: ${task.typeId})`}
              </span>
            </div>
            <div>
              <span className="block text-xs text-coffee-medium">Status</span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                state?.name === 'Closed' ? 'bg-green-100 text-green-800' : 
                state?.name === 'InProgress' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-coffee-light text-coffee-dark'
              }`}>
                {state ? state.name : `Unknown (ID: ${task.stateId})`}
              </span>
            </div>
            <div>
              <span className="block text-xs text-coffee-medium">Created</span>
              <span className="block font-medium text-coffee-dark">{formatDate(task.creationDate)}</span>
            </div>
            <div>
              <span className="block text-xs text-coffee-medium">Last Updated</span>
              <span className="block font-medium text-coffee-dark">{formatDate(task.lastModifiedDate)}</span>
            </div>
            <div>
              <span className="block text-xs text-coffee-medium">Priority</span>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColorClass(task.priority)}`}>
                {task.priority || 'Medium'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-coffee-light rounded-lg p-4">
          <h3 className="text-sm uppercase font-medium text-coffee-medium mb-2">People</h3>
          <div className="space-y-3">
            <div>
              <span className="block text-xs text-coffee-medium">Assigned to</span>
              <span className="block font-medium text-coffee-dark">
                {getUserDisplayName(task.assignedToUserId)}
              </span>
            </div>
            <div>
              <span className="block text-xs text-coffee-medium">Created by</span>
              <span className="block font-medium text-coffee-dark">
                {getUserDisplayName(task.createdByUserId)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm uppercase font-medium text-coffee-medium mb-2">Description</h3>
        <div className="bg-white p-4 rounded-lg border border-coffee-light">
          {task.description ? 
            <p className="text-coffee-dark">{task.description}</p> :
            <p className="text-coffee-medium italic">No description provided</p>
          }
        </div>
      </div>
      
      {/* Parent Task */}
      {parentTask && (
        <div>
          <h3 className="text-sm uppercase font-medium text-coffee-medium mb-2">Parent Task</h3>
          <div className="bg-coffee-light rounded-lg p-4">
            <div className="flex items-center">
              <FaLevelUpAlt className="text-coffee-medium rotate-90 mr-2" />
              <div>
                <div className="font-medium text-coffee-dark">{parentTask.title}</div>
                <div className="text-xs text-coffee-medium mt-1">#{parentTask.id}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Child Tasks */}
      {childTasks.length > 0 && (
        <div>
          <h3 className="text-sm uppercase font-medium text-coffee-medium mb-2">Child Tasks</h3>
          <div className="space-y-2">
            {childTasks.map((childTask) => (
              <div key={childTask.id} className="bg-coffee-light rounded-lg p-4">
                <div className="flex items-center">
                  <FaLevelDownAlt className="text-coffee-medium rotate-90 mr-2" />
                  <div>
                    <div className="font-medium text-coffee-dark">{childTask.title}</div>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-coffee-medium mr-2">#{childTask.id}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        states.find(s => s.id === childTask.stateId)?.name === 'Closed' 
                          ? 'bg-green-100 text-green-800' 
                          : states.find(s => s.id === childTask.stateId)?.name === 'InProgress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-coffee-cream text-coffee-dark'
                      }`}>
                        {states.find(s => 
                          s.id === childTask.stateId || 
                          s.id === Number(childTask.stateId) || 
                          String(s.id) === childTask.stateId
                        )?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Linked Tasks */}
      {linkedTasks.length > 0 && (
        <div>
          <h3 className="text-sm uppercase font-medium text-coffee-medium mb-2">Linked Tasks</h3>
          <div className="space-y-2">
            {linkedTasks.map((link) => {
              const linkedTask = getTaskById(link.id);
              if (!linkedTask) return null;
              
              return (
                <div key={link.id} className="bg-coffee-light rounded-lg p-4">
                  <div className="flex items-center">
                    <FaLink className="text-coffee-medium mr-2" />
                    <div className="flex-grow">
                      <div className="font-medium text-coffee-dark">
                        {linkedTask.title}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-coffee-medium mr-2">#{link.id}</span>
                        {link.linkType && (
                          <span className="px-2 py-0.5 text-xs bg-coffee-cream rounded-full">
                            {link.linkType}
                          </span>
                        )}
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full ${
                          states.find(s => s.id === linkedTask.stateId)?.name === 'Closed' 
                            ? 'bg-green-100 text-green-800' 
                            : states.find(s => s.id === linkedTask.stateId)?.name === 'InProgress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-coffee-cream text-coffee-dark'
                        }">
                          {states.find(s => 
                            s.id === linkedTask.stateId || 
                            s.id === Number(linkedTask.stateId) || 
                            String(s.id) === linkedTask.stateId
                          )?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="border-t border-coffee-light pt-4">
        <div className="flex items-center text-coffee-medium text-sm">
          <FaClock className="mr-1" />
          <span>Task ID: {task.id}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;