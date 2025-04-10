import { useState, useCallback, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext.js';
import { useToast } from '../context/ToastContext.js';
import { formatDate, STATUS } from '../utils/constants.js';

/**
 * Custom hook for task operations and data
 * Centralizes common task logic used across components
 * 
 * @returns {Object} Task operations and data
 */
export const useTasks = () => {
  const { 
    tasks, 
    types, 
    states, 
    priorities, 
    users, 
    loading, 
    error,
    createTask: dbCreateTask, 
    updateTask: dbUpdateTask, 
    deleteTask: dbDeleteTask,
    getUserDisplayName
  } = useDatabase();
  
  const { success, error: showError } = useToast();
  const [selectedTask, setSelectedTask] = useState(null);
  
  /**
   * Get type name from typeId with type-safe comparison
   */
  const getTypeName = useCallback((typeId) => {
    const type = types.find(t => 
      t.id === typeId || 
      t.id === Number(typeId) || 
      String(t.id) === typeId
    );
    return type ? type.name : 'Unknown';
  }, [types]);

  /**
   * Get state name from stateId with type-safe comparison
   */
  const getStateName = useCallback((stateId) => {
    const state = states.find(s => 
      s.id === stateId || 
      s.id === Number(stateId) || 
      String(s.id) === stateId
    );
    return state ? state.name : 'Unknown';
  }, [states]);
  
  /**
   * Get priority name from priorityId with type-safe comparison
   */
  const getPriorityName = useCallback((priorityId) => {
    if (!priorityId || !priorities || priorities.length === 0) return 'Medium';
    const searchId = typeof priorityId === 'string' ? priorityId : String(priorityId);
    const priorityObj = priorities.find(priority => String(priority.id) === searchId);
    return priorityObj ? priorityObj.name : 'Medium';
  }, [priorities]);

  /**
   * Filter tasks by state name
   */
  const filterTasksByState = useCallback((stateName) => {
    if (!tasks) return [];
    
    const normalizedState = stateName.toLowerCase().replace(/\s+/g, '');
    return tasks.filter(t => {
      const taskState = getStateName(t.stateId).toLowerCase().replace(/\s+/g, '');
      return taskState === normalizedState;
    });
  }, [tasks, getStateName]);
  
  /**
   * Get tasks assigned to the current user
   */
  const getMyTasks = useCallback((userId) => {
    if (!userId || !tasks) return [];
    return tasks.filter(t => String(t.assignedToUserId) === String(userId));
  }, [tasks]);
  
  /**
   * Create a task with error handling
   */
  const createTask = useCallback(async (taskData) => {
    try {
      const result = await dbCreateTask(taskData);
      
      if (result.success) {
        success('Task created successfully!');
        return result;
      } else {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showError('Failed to create task. Please try again.');
      throw error;
    }
  }, [dbCreateTask, success, showError]);

  /**
   * Update a task with error handling
   */
  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      const result = await dbUpdateTask(taskId, taskData);
      
      if (result.success) {
        success('Task updated successfully!');
        return result;
      } else {
        throw new Error(result.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showError('Failed to update task. Please try again.');
      throw error;
    }
  }, [dbUpdateTask, success, showError]);

  /**
   * Delete a task with error handling
   */
  const deleteTask = useCallback(async (taskId) => {
    try {
      const result = await dbDeleteTask(taskId);
      
      if (result.success) {
        success('Task deleted successfully!');
        setSelectedTask(null);
        return result;
      } else {
        throw new Error(result.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Failed to delete task. Please try again.');
      throw error;
    }
  }, [dbDeleteTask, success, showError]);

  /**
   * Find a task by ID
   */
  const getTaskById = useCallback((taskId) => {
    if (!taskId || !tasks) return null;
    return tasks.find(t => String(t.id) === String(taskId));
  }, [tasks]);
  
  /**
   * Mark a task as closed
   */
  const closeTask = useCallback(async (task) => {
    const closedState = states.find(s => s.name.toLowerCase() === 'closed');
    if (!closedState) {
      showError('Could not find closed state');
      return null;
    }
    
    return updateTask(task.id, {
      ...task,
      stateId: closedState.id
    });
  }, [states, updateTask, showError]);
  
  /**
   * Get task statistics
   */
  const taskStats = useMemo(() => {
    if (!tasks || !tasks.length) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        completionRate: 0,
        priorityDistribution: {
          high: 0,
          medium: 0, 
          low: 0
        }
      };
    }
    
    const completed = tasks.filter(t => getStateName(t.stateId).toLowerCase() === 'closed').length;
    const inProgress = tasks.filter(t => getStateName(t.stateId).toLowerCase().replace(/\s+/g, '') === 'inprogress').length;
    const todo = tasks.filter(t => getStateName(t.stateId).toLowerCase().replace(/\s+/g, '') === 'todo').length;
    
    const highPriority = tasks.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'high').length;
    const mediumPriority = tasks.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'medium').length;
    const lowPriority = tasks.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'low').length;
    
    return {
      total: tasks.length,
      completed,
      inProgress,
      todo,
      completionRate: Math.round((completed / tasks.length) * 100),
      priorityDistribution: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority
      }
    };
  }, [tasks, getStateName, getPriorityName]);

  return {
    // Data
    tasks,
    types,
    states,
    priorities,
    users,
    loading,
    error,
    selectedTask,
    taskStats,
    
    // Setters
    setSelectedTask,
    
    // Getters
    getTypeName,
    getStateName,
    getPriorityName,
    getTaskById,
    getUserDisplayName,
    filterTasksByState,
    getMyTasks,
    
    // Operations
    createTask,
    updateTask,
    deleteTask,
    closeTask,
    
    // Utils
    formatTaskDate: formatDate
  };
};

export default useTasks;