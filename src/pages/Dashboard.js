import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFilter, FaPlus, FaCheck, FaSpinner, FaClock, 
  FaExclamationTriangle, FaEye, FaEdit, FaCheckCircle } from 'react-icons/fa/index.js';
import { useDatabase } from '../context/DatabaseContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext.js';
import Button from '../components/Button.js';
import Logo from '../components/Logo.js';
import Modal from '../components/Modal.js';
import TaskDetail from '../components/TaskDetail.js';
import TaskFormDialog from '../components/TaskFormDialog.js';
import PageHeader from '../components/PageHeader.js';
import Badge from '../components/Badge.js';
import Avatar from '../components/Avatar.js';
import ErrorBoundary from '../components/ErrorBoundary.js';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { tasks, types, states, priorities, users, loading, error, createTask, updateTask, deleteTask, getUserDisplayName } = useDatabase();
  const { success, error: showError } = useToast(); // Use the toast context
  const navigate = useNavigate();
  
  // State for task modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Filter state
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  // Helper functions for displaying task data with type-safe comparisons
  const getTypeName = (typeId) => {
    const type = types.find(t => 
      t.id === typeId || 
      t.id === Number(typeId) || 
      String(t.id) === typeId
    );
    return type ? type.name : 'Unknown';
  };

  const getStateName = (stateId) => {
    const state = states.find(s => 
      s.id === stateId || 
      s.id === Number(stateId) || 
      String(s.id) === stateId
    );
    return state ? state.name : 'Unknown';
  };
  
  const getPriorityName = (priorityId) => {
    if (!priorityId || !priorities || priorities.length === 0) return 'Medium';
    const searchId = typeof priorityId === 'string' ? priorityId : String(priorityId);
    const priorityObj = priorities.find(priority => String(priority.id) === searchId);
    return priorityObj ? priorityObj.name : 'Medium';
  };

  // Apply filter when tasks or filter changes
  useEffect(() => {
    if (!tasks) return;
    
    switch (filter) {
      case 'in-progress':
        setFilteredTasks(tasks.filter(t => getStateName(t.stateId).toLowerCase().replace(' ', '') === 'inprogress'));
        break;
      case 'closed':
        setFilteredTasks(tasks.filter(t => getStateName(t.stateId).toLowerCase() === 'closed'));
        break;
      case 'todo':
        setFilteredTasks(tasks.filter(t => getStateName(t.stateId).toLowerCase().replace(' ', '') === 'todo'));
        break;
      default:
        setFilteredTasks(tasks);
    }
  }, [tasks, filter, getStateName]); // Added getStateName to dependency array

  // Get status icon based on state
  const getStatusIcon = (stateId) => {
    const stateName = getStateName(stateId).toLowerCase();
    if (stateName === 'closed') return <FaCheck className="text-green-500" />;
    if (stateName === 'inprogress' || stateName === 'in progress') return <FaSpinner className="text-yellow-500" />;
    if (stateName === 'open' || stateName === 'todo' || stateName === 'to do') return <FaClock className="text-blue-500" />;
    return <FaExclamationTriangle className="text-coffee-accent" />;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Handle viewing a task
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  // Handle editing a task
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowViewModal(false);
    setShowEditModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setSelectedTask(task);
    setShowViewModal(false);
    setShowDeleteConfirm(true);
  };

  // Handle task creation
  const handleCreateTask = async (taskData) => {
    try {
      const result = await createTask(taskData);
      
      if (result.success) {
        success('Task created successfully!');
        setShowTaskModal(false);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showError('Failed to create task. Please try again.');
      throw error;
    }
  };

  // Handle task update
  const handleUpdateTask = async (taskData) => {
    try {
      if (!selectedTask) throw new Error('No task selected for update');
      
      const result = await updateTask(selectedTask.id, taskData);
      
      if (result.success) {
        success('Task updated successfully!');
        setShowEditModal(false);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showError('Failed to update task. Please try again.');
      throw error;
    }
  };

  // Handle task deletion
  const handleDeleteTask = async () => {
    try {
      if (!selectedTask) throw new Error('No task selected for deletion');
      
      const result = await deleteTask(selectedTask.id);
      
      if (result.success) {
        success('Task deleted successfully!');
        setShowDeleteConfirm(false);
        setSelectedTask(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Failed to delete task. Please try again.');
    }
  };

  return (
    <ErrorBoundary>
      <div className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        {/* Page Header */}
        <PageHeader
          title={
            <div className="flex items-center">
              <span className="mr-2">☕</span>
              <span>My Dashboard</span>
            </div>
          }
          subtitle="Your daily grind at a glance"
        />

        {/* Main Dashboard Content */}
        <div className="space-y-6">
          {/* Welcome and Quick Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-coffee-light to-coffee-dark">
                  <h2 className="text-xl font-bold text-white mb-1">Welcome Back!</h2>
                  <p className="text-coffee-cream opacity-80">Here's your productivity snapshot</p>
                </div>
                
                {currentUser ? (
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      {/* Use the new Avatar component */}
                      <Avatar 
                        name={currentUser.email} 
                        size="lg"
                        border={true}
                        className="mr-4"
                      />
                      <div>
                        <h3 className="text-lg font-medium text-coffee-dark">{currentUser.email}</h3>
                        <p className="text-sm text-coffee-medium">
                          Signed in via {currentUser?.providerData && currentUser.providerData[0]?.providerId || 'Email/Password'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-coffee-light bg-opacity-30 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-coffee-dark mb-2">Quick Actions</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowTaskModal(true)}
                          className="flex items-center gap-1 flex-1 justify-center py-2 bg-coffee-dark text-white rounded-md hover:bg-coffee-primary transition-all shadow-sm"
                        >
                          <FaPlus className="text-xs" /> New Task
                        </button>
                        <button 
                          onClick={() => navigate('/tasks')}
                          className="flex items-center gap-1 flex-1 justify-center py-2 bg-white text-coffee-dark border border-coffee-medium rounded-md hover:bg-coffee-light transition-all"
                        >
                          <FaEye className="text-xs" /> View All
                        </button>
                      </div>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="text-coffee-primary hover:text-coffee-dark text-sm font-medium transition-colors flex items-center"
                    >
                      Manage your profile →
                    </Link>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <Logo size="large" />
                      </div>
                      <div>
                        <p className="text-coffee-dark mb-3">Please sign in to view your dashboard information.</p>
                        <Button 
                          onClick={() => navigate('/login')}
                          variant="primary"
                        >
                          Sign In
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Tasks Stats Card */}
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-coffee-primary">
                  <div className="flex justify-between items-center">
                    <p className="text-sm uppercase text-coffee-medium font-medium">Total Tasks</p>
                    <span className="p-2 bg-coffee-light bg-opacity-30 rounded-full">
                      <FaFilter className="h-4 w-4 text-coffee-dark" />
                    </span>
                  </div>
                  <h3 className="mt-2 text-3xl font-bold text-coffee-dark">{tasks.length}</h3>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="text-coffee-medium">Across all statuses</span>
                  </div>
                </div>
                
                {/* Completed Stats Card */}
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                  <div className="flex justify-between items-center">
                    <p className="text-sm uppercase text-coffee-medium font-medium">Completed</p>
                    <span className="p-2 bg-green-100 bg-opacity-60 rounded-full">
                      <FaCheckCircle className="h-4 w-4 text-green-600" />
                    </span>
                  </div>
                  <h3 className="mt-2 text-3xl font-bold text-coffee-dark">
                    {tasks.filter(t => getStateName(t.stateId).toLowerCase() === 'closed').length}
                  </h3>
                  <div className="mt-2 flex items-center text-sm">
                    <span className={`text-green-600 ${
                      tasks.length > 0 
                        ? `font-medium (${Math.round((tasks.filter(t => getStateName(t.stateId).toLowerCase() === 'closed').length / tasks.length) * 100)}%)`
                        : ''
                    }`}>
                      Closed tasks
                    </span>
                  </div>
                </div>
                
                {/* In Progress Stats Card */}
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                  <div className="flex justify-between items-center">
                    <p className="text-sm uppercase text-coffee-medium font-medium">In Progress</p>
                    <span className="p-2 bg-blue-100 bg-opacity-60 rounded-full">
                      <FaSpinner className="h-4 w-4 text-blue-600" />
                    </span>
                  </div>
                  <h3 className="mt-2 text-3xl font-bold text-coffee-dark">
                    {tasks.filter(t => getStateName(t.stateId).toLowerCase().replace(' ', '') === 'inprogress').length}
                  </h3>
                  <div className="mt-2 flex items-center text-sm">
                    <span className={`text-blue-600 ${
                      tasks.length > 0 
                        ? `font-medium (${Math.round((tasks.filter(t => getStateName(t.stateId).toLowerCase().replace(' ', '') === 'inprogress').length / tasks.length) * 100)}%)`
                        : ''
                    }`}>
                      Active work
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Priority Distribution Card */}
              <div className="mt-4 bg-white shadow-md rounded-xl p-6">
                <h3 className="text-lg font-medium text-coffee-dark mb-4">Task Priority Distribution</h3>
                <div className="flex items-center space-x-4">
                  {/* High Priority */}
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-coffee-medium">High</span>
                      <span className="font-medium text-coffee-dark">
                        {tasks.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'high').length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ 
                          width: tasks.length > 0 
                            ? `${(tasks.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'high').length / tasks.length) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Medium Priority */}
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-coffee-medium">Medium</span>
                      <span className="font-medium text-coffee-dark">
                        {tasks.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'medium').length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ 
                          width: tasks.length > 0 
                            ? `${(tasks.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'medium').length / tasks.length) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Low Priority */}
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-coffee-medium">Low</span>
                      <span className="font-medium text-coffee-dark">
                        {tasks.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'low').length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: tasks.length > 0 
                            ? `${(tasks.filter(t => getPriorityName(t.priorityId).toLowerCase() === 'low').length / tasks.length) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Listing Section */}
          {currentUser && (
            <div className="bg-white shadow-md rounded-xl overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-medium text-coffee-dark flex items-center">
                  <span className="mr-2">🎟️</span> Your Tasks
                </h2>
                
                <div className="flex space-x-2">
                  <div className="inline-flex items-center rounded-md shadow-sm">
                    <button
                      className={`px-3 py-2 text-sm font-medium rounded-l-md ${filter === 'all' 
                        ? 'bg-coffee-dark text-white' 
                        : 'bg-white text-coffee-dark hover:bg-gray-50 border-r border-gray-200'}`}
                      onClick={() => setFilter('all')}
                    >
                      All
                    </button>
                    <button
                      className={`px-3 py-2 text-sm font-medium ${filter === 'todo' 
                        ? 'bg-coffee-dark text-white' 
                        : 'bg-white text-coffee-dark hover:bg-gray-50 border-r border-gray-200'}`}
                      onClick={() => setFilter('todo')}
                    >
                      To Do
                    </button>
                    <button
                      className={`px-3 py-2 text-sm font-medium ${filter === 'in-progress' 
                        ? 'bg-coffee-dark text-white' 
                        : 'bg-white text-coffee-dark hover:bg-gray-50 border-r border-gray-200'}`}
                      onClick={() => setFilter('in-progress')}
                    >
                      In Progress
                    </button>
                    <button
                      className={`px-3 py-2 text-sm font-medium rounded-r-md ${filter === 'closed' 
                        ? 'bg-coffee-dark text-white' 
                        : 'bg-white text-coffee-dark hover:bg-gray-50'}`}
                      onClick={() => setFilter('closed')}
                    >
                      Closed
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleCreateTask()}
                    className="bg-coffee-dark border border-coffee-dark text-white px-4 py-2 rounded-md hover:bg-coffee-primary transition-colors shadow-sm"
                  >
                    Create Task
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-2 bg-coffee-light bg-opacity-20">
                <div className="flex justify-between text-sm text-coffee-medium">
                  <div>
                    Showing {filteredTasks.length} of {tasks.length} tasks
                  </div>
                  <div>
                    {filter !== 'all' && (
                      <button 
                        onClick={() => setFilter('all')}
                        className="text-coffee-primary hover:underline"
                      >
                        Clear filter
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center p-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-primary mb-4"></div>
                  <p className="text-coffee-medium">Brewing your tasks...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                    <FaExclamationTriangle className="h-8 w-8" />
                  </div>
                  <p className="text-red-500 font-medium mb-2">Something went wrong</p>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <button
                    className="bg-coffee-primary text-white px-4 py-2 rounded-md hover:bg-coffee-dark transition-colors shadow-sm"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center p-16">
                  <div className="mx-auto h-16 w-16 rounded-full bg-coffee-light flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-coffee-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-coffee-dark mb-1">No tasks found</h3>
                  <p className="text-coffee-medium mb-6">
                    {filter !== 'all' 
                      ? `You don't have any tasks with the ${filter} status.` 
                      : 'Your workday looks clear! Create a new task to get started.'}
                  </p>
                  <button
                    className="inline-flex items-center px-4 py-2 shadow-sm text-sm font-medium rounded-md text-white bg-coffee-primary hover:bg-coffee-dark transition-colors"
                    onClick={() => setShowTaskModal(true)}
                  >
                    <FaPlus className="mr-2" />
                    Create New Task
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-coffee-light bg-opacity-30">
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Priority</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Assigned To</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-coffee-dark uppercase tracking-wider">Created</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-coffee-dark uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-coffee-light hover:bg-opacity-10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-coffee-dark">{task.title}</div>
                            <div className="text-xs text-coffee-medium truncate max-w-xs">
                              {task.description || 'No description provided'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-coffee-dark">{getTypeName(task.typeId)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {/* Use the Badge component for status */}
                            <Badge
                              type="status"
                              text={getStateName(task.stateId)}
                              value={getStateName(task.stateId)}
                              icon={getStatusIcon(task.stateId)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {/* Use the Badge component for priority */}
                            <Badge
                              type="priority"
                              text={getPriorityName(task.priorityId)}
                              value={getPriorityName(task.priorityId)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {task.assignedToUserId ? (
                                <>
                                  {/* Use the Avatar component for assigned user */}
                                  <Avatar 
                                    name={getUserDisplayName(task.assignedToUserId)} 
                                    size="xs" 
                                    className="mr-2" 
                                  />
                                  <span className="text-sm text-coffee-medium">
                                    {getUserDisplayName(task.assignedToUserId)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-coffee-medium">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-coffee-medium">
                            {formatDate(task.creationDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2 justify-end">
                              <button 
                                className="text-coffee-primary p-1.5 rounded-full hover:bg-coffee-light hover:text-coffee-dark transition-colors"
                                onClick={() => handleViewTask(task)}
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              <button
                                className="text-yellow-500 p-1.5 rounded-full hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                                onClick={() => handleEditTask(task)}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              {getStateName(task.stateId) !== 'Closed' && (
                                <button
                                  className="text-green-500 p-1.5 rounded-full hover:bg-green-50 hover:text-green-700 transition-colors"
                                  onClick={() => {
                                    const closedStateId = states.find(state => state.name === 'Closed')?.id;
                                    if (closedStateId) {
                                      handleUpdateTask({ ...task, stateId: closedStateId });
                                    }
                                  }}
                                  title="Close Task"
                                >
                                  <FaCheckCircle />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Create Task Modal */}
        <TaskFormDialog
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleCreateTask}
        />

        {/* View Task Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Task Details"
        >
          <TaskDetail 
            task={selectedTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteConfirm}
            types={types}
            states={states}
            users={users}
          />
        </Modal>

        {/* Edit Task Modal */}
        <TaskFormDialog
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          task={selectedTask}
          onSubmit={handleUpdateTask}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirm Deletion"
          size="small"
        >
          <div className="space-y-4">
            <p className="text-coffee-dark">
              Are you sure you want to delete the task "{selectedTask?.title}"?
            </p>
            <p className="text-sm text-coffee-medium">
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteTask}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;