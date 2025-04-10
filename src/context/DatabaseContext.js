import React, { createContext, useState, useContext, useEffect } from 'react';
import databaseService from '../services/databaseService.js';

// Create context
export const DatabaseContext = createContext();

// Mock data for types, but statuses and priorities will come from the API
const defaultTypes = [
  { id: '1', name: 'Bug' },
  { id: '2', name: 'Feature' },
  { id: '3', name: 'Task' },
  { id: '4', name: 'Improvement' }
];

// Fallback data only used if API fails
const fallbackStates = [
  { id: '1', name: 'To Do' },
  { id: '2', name: 'In Progress' },
  { id: '3', name: 'In Review' },
  { id: '4', name: 'Closed' },
  { id: '5', name: "Won't Fix" }
];

const fallbackPriorities = [
  { id: '1', name: 'Low' },
  { id: '2', name: 'Medium' },
  { id: '3', name: 'High' }
];

// DatabaseProvider component
export const DatabaseProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [types, setTypes] = useState(defaultTypes);
  const [states, setStates] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await fetchTasks();
        await fetchStatuses();
        await fetchPriorities();
      } catch (err) {
        setError('Failed to initialize data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await databaseService.getTasks();
      setTasks(fetchedTasks);
      return fetchedTasks;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch statuses
  const fetchStatuses = async () => {
    try {
      const fetchedStatuses = await databaseService.getStatuses();
      if (fetchedStatuses && Array.isArray(fetchedStatuses) && fetchedStatuses.length > 0) {
        console.log('Fetched statuses from API:', fetchedStatuses);
        setStates(fetchedStatuses);
      } else {
        console.warn('No statuses returned from API, using fallback data');
        setStates(fallbackStates);
      }
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setStates(fallbackStates);
    }
  };
  
  // Fetch priorities
  const fetchPriorities = async () => {
    try {
      const fetchedPriorities = await databaseService.getPriorities();
      if (fetchedPriorities && Array.isArray(fetchedPriorities) && fetchedPriorities.length > 0) {
        console.log('Fetched priorities from API:', fetchedPriorities);
        setPriorities(fetchedPriorities);
      } else {
        console.warn('No priorities returned from API, using fallback data');
        setPriorities(fallbackPriorities);
      }
    } catch (err) {
      console.error('Error fetching priorities:', err);
      setPriorities(fallbackPriorities);
    }
  };

  // Get task by ID
  const getTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const task = await databaseService.getTaskById(id);
      return task;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const newTask = await databaseService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      return { success: true, task: newTask };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update task
  const updateTask = async (id, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await databaseService.updateTask(id, taskData);
      setTasks(prev => 
        prev.map(task => task._id === id || task.id === id ? updatedTask : task)
      );
      return { success: true, task: updatedTask };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await databaseService.deleteTask(id);
      setTasks(prev => prev.filter(task => task._id !== id && task.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Add attachment to task
  const addAttachment = async (taskId, file) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await databaseService.addAttachment(taskId, file);
      setTasks(prev => 
        prev.map(task => task._id === taskId || task.id === taskId ? updatedTask : task)
      );
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove attachment from task
  const removeAttachment = async (taskId, attachmentId) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await databaseService.removeAttachment(taskId, attachmentId);
      setTasks(prev => 
        prev.map(task => task._id === taskId || task.id === taskId ? updatedTask : task)
      );
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user display name
  const getUserDisplayName = (userId) => {
    if (!userId) return '';
    const user = users.find(u => u.id === userId || u._id === userId);
    return user ? user.displayName : '';
  };

  // Context value
  const value = {
    tasks,
    types,
    states,
    priorities,
    users,
    loading,
    error,
    fetchTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    addAttachment,
    removeAttachment,
    getUserDisplayName,
    fetchStatuses,
    fetchPriorities
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Custom hook to use the database context
export const useDatabase = () => {
  return useContext(DatabaseContext);
};