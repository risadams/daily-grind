import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Initialize axios with token if available
const initializeAxios = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Tasks API
const getTasks = async () => {
  initializeAxios();
  try {
    const response = await axios.get(`${API_URL}/tasks`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
  }
};

const getTaskById = async (id) => {
  initializeAxios();
  try {
    const response = await axios.get(`${API_URL}/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch task');
  }
};

const createTask = async (taskData) => {
  initializeAxios();
  try {
    const response = await axios.post(`${API_URL}/tasks`, taskData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create task');
  }
};

const updateTask = async (id, taskData) => {
  initializeAxios();
  try {
    const response = await axios.put(`${API_URL}/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update task');
  }
};

const deleteTask = async (id) => {
  initializeAxios();
  try {
    const response = await axios.delete(`${API_URL}/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete task');
  }
};

// Teams API
const getTeams = async () => {
  initializeAxios();
  try {
    const response = await axios.get(`${API_URL}/teams`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch teams');
  }
};

const getTeamById = async (id) => {
  initializeAxios();
  try {
    const response = await axios.get(`${API_URL}/teams/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch team');
  }
};

const createTeam = async (teamData) => {
  initializeAxios();
  try {
    const response = await axios.post(`${API_URL}/teams`, teamData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create team');
  }
};

const updateTeam = async (id, teamData) => {
  initializeAxios();
  try {
    const response = await axios.put(`${API_URL}/teams/${id}`, teamData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update team');
  }
};

const deleteTeam = async (id) => {
  initializeAxios();
  try {
    const response = await axios.delete(`${API_URL}/teams/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete team');
  }
};

const addTeamMember = async (teamId, userId, roleIds = []) => {
  initializeAxios();
  try {
    const response = await axios.post(`${API_URL}/teams/${teamId}/members/${userId}`, { roleIds });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add team member');
  }
};

const updateTeamMemberRoles = async (teamId, userId, roleIds) => {
  initializeAxios();
  try {
    const response = await axios.put(`${API_URL}/teams/${teamId}/members/${userId}/roles`, { roleIds });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update team member roles');
  }
};

const removeTeamMember = async (teamId, userId) => {
  initializeAxios();
  try {
    const response = await axios.delete(`${API_URL}/teams/${teamId}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove team member');
  }
};

// File Attachments API
const addAttachment = async (taskId, file) => {
  initializeAxios();
  try {
    const formData = new FormData();
    formData.append('attachment', file);
    
    const response = await axios.post(
      `${API_URL}/tasks/${taskId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload attachment');
  }
};

const removeAttachment = async (taskId, attachmentId) => {
  initializeAxios();
  try {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}/attachments/${attachmentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove attachment');
  }
};

// Status API
const getStatuses = async () => {
  initializeAxios();
  try {
    // Try various possible endpoint paths for status
    let response;
    try {
      response = await axios.get(`${API_URL}/statuses`); // Try plural form first
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          response = await axios.get(`${API_URL}/status`); // Try singular form
        } catch (innerErr) {
          if (innerErr.response?.status === 404) {
            // Try alternative endpoints
            response = await axios.get(`${API_URL}/task/statuses`);
          } else {
            throw innerErr;
          }
        }
      } else {
        throw err;
      }
    }
    return response.data;
  } catch (error) {
    console.error('Failed to fetch statuses:', error);
    // Try to construct statuses from tasks if API fails
    try {
      const tasks = await getTasks();
      if (tasks && tasks.length > 0) {
        // Extract unique status objects from tasks
        const uniqueStatuses = {};
        tasks.forEach(task => {
          if (task.status && typeof task.status === 'object' && task.status._id) {
            uniqueStatuses[task.status._id] = task.status;
          }
        });
        const extractedStatuses = Object.values(uniqueStatuses);
        if (extractedStatuses.length > 0) {
          console.log('Using status data extracted from tasks:', extractedStatuses);
          return extractedStatuses;
        }
      }
    } catch (extractError) {
      console.error('Failed to extract statuses from tasks:', extractError);
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch statuses');
  }
};

// Priorities API
const getPriorities = async () => {
  initializeAxios();
  try {
    // Try various possible endpoint paths for priority
    let response;
    try {
      response = await axios.get(`${API_URL}/priorities`); // Try plural form first
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          response = await axios.get(`${API_URL}/priority`); // Try singular form
        } catch (innerErr) {
          if (innerErr.response?.status === 404) {
            // Try alternative endpoints
            response = await axios.get(`${API_URL}/task/priorities`);
          } else {
            throw innerErr;
          }
        }
      } else {
        throw err;
      }
    }
    return response.data;
  } catch (error) {
    console.error('Failed to fetch priorities:', error);
    // Try to construct priorities from tasks if API fails
    try {
      const tasks = await getTasks();
      if (tasks && tasks.length > 0) {
        // Extract unique priority objects from tasks
        const uniquePriorities = {};
        tasks.forEach(task => {
          if (task.priority && typeof task.priority === 'object' && task.priority._id) {
            uniquePriorities[task.priority._id] = task.priority;
          }
        });
        const extractedPriorities = Object.values(uniquePriorities);
        if (extractedPriorities.length > 0) {
          console.log('Using priority data extracted from tasks:', extractedPriorities);
          return extractedPriorities;
        }
      }
    } catch (extractError) {
      console.error('Failed to extract priorities from tasks:', extractError);
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch priorities');
  }
};

const databaseService = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addAttachment,
  removeAttachment,
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  updateTeamMemberRoles,
  removeTeamMember,
  getStatuses,
  getPriorities
};

export default databaseService;