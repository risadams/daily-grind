// filepath: a:\daily-grind\src\pages\ProjectsPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCogs, FaUsers, FaListAlt, FaClock, FaEdit, FaTrash, FaPlus, FaUserPlus, FaUserMinus } from 'react-icons/fa/index.js';
import PageHeader from '../components/PageHeader.js';
import { useTheme } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';
import databaseService from '../services/databaseService.js';
import Modal from '../components/Modal.js';
import Avatar from '../components/Avatar.js';

// Team Form Component - Isolating the form state to prevent focus issues
const TeamForm = ({ initialData = { name: '', description: '' }, onSubmit, onCancel, submitLabel }) => {
  const [formData, setFormData] = useState(initialData);
  const nameInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  
  // Focus the name input when the component mounts
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }, []);
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="team-name" className="block text-sm font-medium text-coffee-dark mb-1">
          Team Name
        </label>
        <input
          type="text"
          id="team-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-coffee-light rounded-md shadow-sm focus:outline-none focus:ring-coffee-medium focus:border-coffee-medium"
          placeholder="Enter team name"
          required
          ref={nameInputRef}
        />
      </div>
      
      <div>
        <label htmlFor="team-description" className="block text-sm font-medium text-coffee-dark mb-1">
          Description
        </label>
        <textarea
          id="team-description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 border border-coffee-light rounded-md shadow-sm focus:outline-none focus:ring-coffee-medium focus:border-coffee-medium"
          placeholder="Describe the team's purpose"
          ref={descriptionInputRef}
        />
      </div>
      
      <div className="flex justify-end pt-4">
        <button
          type="button"
          className="mr-3 px-4 py-2 border border-coffee-light text-coffee-dark rounded-md hover:bg-coffee-light"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-coffee-dark border border-coffee-dark text-white rounded-md hover:bg-coffee-primary"
        >
          {submitLabel || 'Submit'}
        </button>
      </div>
    </form>
  );
};

const ProjectsPage = () => {
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuth();
  
  // State for teams
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modals
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // State for managing users
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  
  // Active section management
  const [activeSection, setActiveSection] = useState('general');

  // Load teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await databaseService.getTeams();
        setTeams(teamsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load teams. Please try again later.');
        setLoading(false);
      }
    };

    const fetchUsersAndRoles = async () => {
      try {
        const teamsData = await databaseService.getTeams();
        
        const uniqueUsers = [];
        const userIds = new Set();
        
        teamsData.forEach(team => {
          team.members?.forEach(member => {
            if (member.user && !userIds.has(member.user._id)) {
              userIds.add(member.user._id);
              uniqueUsers.push({
                _id: member.user._id,
                displayName: member.user.displayName,
                email: member.user.email,
                photoURL: member.user.photoURL
              });
            }
          });
        });
        
        setUsers(uniqueUsers);
        
        const uniqueRoles = [];
        const roleIds = new Set();
        
        teamsData.forEach(team => {
          team.members?.forEach(member => {
            member.roles?.forEach(role => {
              if (!roleIds.has(role._id)) {
                roleIds.add(role._id);
                uniqueRoles.push({
                  _id: role._id,
                  name: role.name,
                  description: role.description
                });
              }
            });
          });
        });
        
        setRoles(uniqueRoles);
      } catch (err) {
        console.error('Failed to fetch users and roles', err);
      }
    };
    
    fetchTeams();
    fetchUsersAndRoles();
  }, []);
  
  // Handle creating a new team
  const handleCreateTeam = useCallback((formData) => {
    const createTeam = async () => {
      try {
        const newTeam = await databaseService.createTeam({
          name: formData.name,
          description: formData.description,
          members: []
        });
        
        setTeams(prevTeams => [...prevTeams, newTeam]);
        setShowTeamModal(false);
      } catch (err) {
        setError('Failed to create team. ' + (err.message || ''));
      }
    };
    
    createTeam();
  }, []);
  
  // Handle updating a team
  const handleUpdateTeam = useCallback((formData) => {
    const updateTeam = async () => {
      try {
        const updatedTeam = await databaseService.updateTeam(selectedTeam._id, {
          name: formData.name,
          description: formData.description
        });
        
        setTeams(prevTeams => prevTeams.map(team => team._id === updatedTeam._id ? updatedTeam : team));
        setShowEditTeamModal(false);
        setSelectedTeam(null);
      } catch (err) {
        setError('Failed to update team. ' + (err.message || ''));
      }
    };
    
    updateTeam();
  }, [selectedTeam]);
  
  // Handle deleting a team
  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await databaseService.deleteTeam(teamId);
        setTeams(teams.filter(team => team._id !== teamId));
      } catch (err) {
        setError('Failed to delete team. ' + (err.message || ''));
      }
    }
  };
  
  // Handle adding a team member
  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !selectedUserId) return;
    
    try {
      await databaseService.addTeamMember(selectedTeam._id, selectedUserId, selectedRoleIds);
      
      const teamsData = await databaseService.getTeams();
      setTeams(teamsData);
      
      setShowAddMemberModal(false);
      setSelectedUserId('');
      setSelectedRoleIds([]);
    } catch (err) {
      setError('Failed to add team member. ' + (err.message || ''));
    }
  };
  
  // Handle removing a team member
  const handleRemoveTeamMember = async (teamId, userId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await databaseService.removeTeamMember(teamId, userId);
        
        const teamsData = await databaseService.getTeams();
        setTeams(teamsData);
      } catch (err) {
        setError('Failed to remove team member. ' + (err.message || ''));
      }
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader 
        title="Project Settings" 
        subtitle="Manage your project's administrative settings"
      />
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar - 33% width */}
        <div className="w-full md:w-1/3">
          <div className={`${isDarkMode ? 'bg-dark-surface' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <FaCogs className="mr-2" />
              Project Management
            </h2>
            <nav className="space-y-1">
              <a 
                href="#general"
                onClick={() => setActiveSection('general')}
                className={`block px-4 py-2 rounded-md ${activeSection === 'general' ? 
                  (isDarkMode ? 'bg-dark-hover text-dark-primary' : 'bg-coffee-cream text-coffee-dark') : 
                  (isDarkMode ? 'text-dark-secondary hover:bg-dark-hover hover:text-dark-primary' : 'text-coffee-medium hover:bg-coffee-light hover:text-coffee-dark')}`}
              >
                General Settings
              </a>
              <a 
                href="#users"
                onClick={() => setActiveSection('users')}
                className={`block px-4 py-2 rounded-md ${activeSection === 'users' ? 
                  (isDarkMode ? 'bg-dark-hover text-dark-primary' : 'bg-coffee-cream text-coffee-dark') : 
                  (isDarkMode ? 'text-dark-secondary hover:bg-dark-hover hover:text-dark-primary' : 'text-coffee-medium hover:bg-coffee-light hover:text-coffee-dark')}`}
              >
                Users & Permissions
              </a>
              <a 
                href="#teams"
                onClick={() => setActiveSection('teams')}
                className={`block px-4 py-2 rounded-md ${activeSection === 'teams' ? 
                  (isDarkMode ? 'bg-dark-hover text-dark-primary' : 'bg-coffee-cream text-coffee-dark') : 
                  (isDarkMode ? 'text-dark-secondary hover:bg-dark-hover hover:text-dark-primary' : 'text-coffee-medium hover:bg-coffee-light hover:text-coffee-dark')}`}
              >
                Teams
              </a>
              <a 
                href="#sprints"
                onClick={() => setActiveSection('sprints')}
                className={`block px-4 py-2 rounded-md ${activeSection === 'sprints' ? 
                  (isDarkMode ? 'bg-dark-hover text-dark-primary' : 'bg-coffee-cream text-coffee-dark') : 
                  (isDarkMode ? 'text-dark-secondary hover:bg-dark-hover hover:text-dark-primary' : 'text-coffee-medium hover:bg-coffee-light hover:text-coffee-dark')}`}
              >
                Sprint Management
              </a>
            </nav>
          </div>
          
          <div className={`${isDarkMode ? 'bg-dark-surface' : 'bg-white'} shadow rounded-lg p-6`}>
            <h3 className="text-md font-medium mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <FaUsers className="mr-2" />
                <span>Team Members: {teams.reduce((acc, team) => acc + (team.members?.length || 0), 0)}</span>
              </li>
              <li className="flex items-center">
                <FaListAlt className="mr-2" />
                <span>Active Projects: 3</span>
              </li>
              <li className="flex items-center">
                <FaClock className="mr-2" />
                <span>Current Sprint: Sprint 24</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Main Content - 66% width */}
        <div className="w-full md:w-2/3">
          {/* General Settings Section */}
          {activeSection === 'general' && (
            <div className={`${isDarkMode ? 'bg-dark-surface' : 'bg-white'} shadow rounded-lg p-6`}>
              <h2 className="text-xl font-medium mb-6" id="general">General Project Settings</h2>
              
              <div className="space-y-6">
                <p className="text-coffee-medium">
                  Configure your project settings here. These settings apply to all project components.
                </p>
                
                <div className="grid grid-cols-1 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-1">
                      Project Name
                    </label>
                    <input 
                      type="text" 
                      className="block w-full px-3 py-2 border border-coffee-light rounded-md shadow-sm focus:outline-none focus:ring-coffee-medium focus:border-coffee-medium"
                      placeholder="Daily Grind"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-coffee-dark mb-1">
                      Project Description
                    </label>
                    <textarea 
                      rows={3}
                      className="block w-full px-3 py-2 border border-coffee-light rounded-md shadow-sm focus:outline-none focus:ring-coffee-medium focus:border-coffee-medium"
                      placeholder="A brief description of your project"
                    ></textarea>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-coffee-dark shadow-sm text-sm font-medium rounded-md text-white bg-coffee-dark hover:bg-coffee-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
              
              <hr className="my-8 border-coffee-light" />
              
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Project Configuration</h3>
                <p className="text-coffee-medium">
                  Additional configuration options will appear here. In future updates, 
                  you will be able to manage project-specific settings from this panel.
                </p>
              </div>
            </div>
          )}
          
          {/* Users & Permissions Section */}
          {activeSection === 'users' && (
            <div className={`${isDarkMode ? 'bg-dark-surface' : 'bg-white'} shadow rounded-lg p-6`}>
              <h2 className="text-xl font-medium mb-6" id="users">Users & Permissions</h2>
              
              <p className="text-coffee-medium mb-6">
                Manage user permissions and access rights for the project.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      This feature is coming soon. Please use the Teams section to manage user assignments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Teams Section */}
          {activeSection === 'teams' && (
            <div className={`${isDarkMode ? 'bg-dark-surface' : 'bg-white'} shadow rounded-lg p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium" id="teams">Team Management</h2>
                <button
                  onClick={() => setShowTeamModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-coffee-dark text-sm font-medium rounded-md shadow-sm text-white bg-coffee-dark hover:bg-coffee-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-medium"
                >
                  <FaPlus className="mr-2" /> Add Team
                </button>
              </div>
              
              <p className="text-coffee-medium mb-6">
                Create and manage teams to organize your project members and assign responsibilities.
              </p>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-coffee-medium" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FaUsers className="mx-auto h-10 w-10 text-coffee-medium" />
                  <p className="mt-2 text-coffee-medium">No teams created yet.</p>
                  <button
                    onClick={() => setShowTeamModal(true)}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-coffee-dark text-sm font-medium rounded-md text-white bg-coffee-dark hover:bg-coffee-primary"
                  >
                    <FaPlus className="mr-2" /> Create your first team
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {teams.map(team => (
                    <div key={team._id} className="border rounded-lg overflow-hidden">
                      <div className="bg-coffee-light p-4 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-coffee-dark">{team.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowEditTeamModal(true);
                            }}
                            className="p-1 rounded-md hover:bg-coffee-cream transition-colors"
                            title="Edit Team"
                          >
                            <FaEdit className="text-coffee-dark" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team._id)}
                            className="p-1 rounded-md hover:bg-coffee-cream transition-colors"
                            title="Delete Team"
                          >
                            <FaTrash className="text-coffee-dark" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-coffee-medium mb-4">{team.description || 'No description provided.'}</p>
                        
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-coffee-dark">Team Members</h4>
                            <button
                              onClick={() => {
                                setSelectedTeam(team);
                                setShowAddMemberModal(true);
                              }}
                              className="text-sm flex items-center text-coffee-primary hover:text-coffee-dark"
                            >
                              <FaUserPlus className="mr-1" /> Add Member
                            </button>
                          </div>
                          
                          {team.members && team.members.length > 0 ? (
                            <ul className="divide-y divide-coffee-light">
                              {team.members.map(member => (
                                <li key={member.user._id} className="py-3 flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Avatar 
                                      name={member.user.displayName}
                                      src={member.user.photoURL} 
                                      size="sm" 
                                      className="mr-3"
                                    />
                                    <div>
                                      <p className="font-medium text-coffee-dark">{member.user.displayName}</p>
                                      <p className="text-xs text-coffee-medium">{member.user.email}</p>
                                      {member.roles && member.roles.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                          {member.roles.map(role => (
                                            <span 
                                              key={role._id}
                                              className="text-xs bg-coffee-cream text-coffee-dark px-2 py-1 rounded-full"
                                            >
                                              {role.name}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveTeamMember(team._id, member.user._id)}
                                    className="p-1 rounded-md hover:bg-coffee-cream transition-colors"
                                    title="Remove Member"
                                  >
                                    <FaUserMinus className="text-coffee-dark" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-coffee-medium italic">
                              No members in this team yet.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Sprints Section */}
          {activeSection === 'sprints' && (
            <div className={`${isDarkMode ? 'bg-dark-surface' : 'bg-white'} shadow rounded-lg p-6`}>
              <h2 className="text-xl font-medium mb-6" id="sprints">Sprint Management</h2>
              
              <p className="text-coffee-medium mb-6">
                Configure and manage sprint settings for your project.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Sprint management features are coming soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        title="Create New Team"
      >
        <TeamForm
          onSubmit={handleCreateTeam}
          onCancel={() => setShowTeamModal(false)}
          submitLabel="Create Team"
        />
      </Modal>

      {/* Edit Team Modal */}
      <Modal
        isOpen={showEditTeamModal}
        onClose={() => {
          setShowEditTeamModal(false);
          setSelectedTeam(null);
        }}
        title="Edit Team"
      >
        {selectedTeam && (
          <TeamForm
            initialData={selectedTeam}
            onSubmit={handleUpdateTeam}
            onCancel={() => {
              setShowEditTeamModal(false);
              setSelectedTeam(null);
            }}
            submitLabel="Update Team"
          />
        )}
      </Modal>

      {/* Add Team Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setSelectedUserId('');
          setSelectedRoleIds([]);
        }}
        title="Add Team Member"
      >
        {selectedTeam && (
          <form onSubmit={handleAddTeamMember} className="space-y-4">
            <div>
              <label htmlFor="user-select" className="block text-sm font-medium text-coffee-dark mb-1">
                Select User
              </label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="block w-full px-3 py-2 border border-coffee-light rounded-md shadow-sm focus:outline-none focus:ring-coffee-medium focus:border-coffee-medium"
                required
              >
                <option value="">-- Select a user --</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.displayName} ({user.email})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-coffee-dark mb-1">
                Assign Roles
              </label>
              <div className="mt-1 space-y-2 max-h-48 overflow-y-auto">
                {roles.length > 0 ? (
                  roles.map(role => (
                    <div key={role._id} className="flex items-center">
                      <input
                        id={`role-${role._id}`}
                        type="checkbox"
                        value={role._id}
                        checked={selectedRoleIds.includes(role._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoleIds([...selectedRoleIds, role._id]);
                          } else {
                            setSelectedRoleIds(selectedRoleIds.filter(id => id !== role._id));
                          }
                        }}
                        className="h-4 w-4 text-coffee-primary focus:ring-coffee-medium border-coffee-light rounded"
                      />
                      <label htmlFor={`role-${role._id}`} className="ml-2 block text-sm text-coffee-dark">
                        {role.name}
                        {role.description && (
                          <span className="text-xs text-coffee-medium ml-1">({role.description})</span>
                        )}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-coffee-medium italic">
                    No roles available. You can still add the member without assigning roles.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="button"
                className="mr-3 px-4 py-2 border border-coffee-light text-coffee-dark rounded-md hover:bg-coffee-light"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedUserId('');
                  setSelectedRoleIds([]);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-coffee-dark border border-coffee-dark text-white rounded-md hover:bg-coffee-primary"
              >
                Add Member
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ProjectsPage;