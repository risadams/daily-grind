import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Initialize axios with token if available
const initializeAxios = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Tickets API
const getTickets = async () => {
  initializeAxios();
  try {
    const response = await axios.get(`${API_URL}/tickets`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch tickets');
  }
};

const getTicketById = async (id) => {
  initializeAxios();
  try {
    const response = await axios.get(`${API_URL}/tickets/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch ticket');
  }
};

const createTicket = async (ticketData) => {
  initializeAxios();
  try {
    const response = await axios.post(`${API_URL}/tickets`, ticketData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create ticket');
  }
};

const updateTicket = async (id, ticketData) => {
  initializeAxios();
  try {
    const response = await axios.put(`${API_URL}/tickets/${id}`, ticketData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update ticket');
  }
};

const deleteTicket = async (id) => {
  initializeAxios();
  try {
    const response = await axios.delete(`${API_URL}/tickets/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete ticket');
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
const addAttachment = async (ticketId, file) => {
  initializeAxios();
  try {
    const formData = new FormData();
    formData.append('attachment', file);
    
    const response = await axios.post(
      `${API_URL}/tickets/${ticketId}/attachments`,
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

const removeAttachment = async (ticketId, attachmentId) => {
  initializeAxios();
  try {
    const response = await axios.delete(`${API_URL}/tickets/${ticketId}/attachments/${attachmentId}`);
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
            response = await axios.get(`${API_URL}/ticket/statuses`);
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
    // Try to construct statuses from tickets if API fails
    try {
      const tickets = await getTickets();
      if (tickets && tickets.length > 0) {
        // Extract unique status objects from tickets
        const uniqueStatuses = {};
        tickets.forEach(ticket => {
          if (ticket.status && typeof ticket.status === 'object' && ticket.status._id) {
            uniqueStatuses[ticket.status._id] = ticket.status;
          }
        });
        const extractedStatuses = Object.values(uniqueStatuses);
        if (extractedStatuses.length > 0) {
          console.log('Using status data extracted from tickets:', extractedStatuses);
          return extractedStatuses;
        }
      }
    } catch (extractError) {
      console.error('Failed to extract statuses from tickets:', extractError);
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
            response = await axios.get(`${API_URL}/ticket/priorities`);
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
    // Try to construct priorities from tickets if API fails
    try {
      const tickets = await getTickets();
      if (tickets && tickets.length > 0) {
        // Extract unique priority objects from tickets
        const uniquePriorities = {};
        tickets.forEach(ticket => {
          if (ticket.priority && typeof ticket.priority === 'object' && ticket.priority._id) {
            uniquePriorities[ticket.priority._id] = ticket.priority;
          }
        });
        const extractedPriorities = Object.values(uniquePriorities);
        if (extractedPriorities.length > 0) {
          console.log('Using priority data extracted from tickets:', extractedPriorities);
          return extractedPriorities;
        }
      }
    } catch (extractError) {
      console.error('Failed to extract priorities from tickets:', extractError);
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch priorities');
  }
};

const databaseService = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
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