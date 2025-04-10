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
  removeTeamMember
};

export default databaseService;