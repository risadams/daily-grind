import React from 'react';
import useTasks from '../hooks/useTasks.js';
import { useTheme } from '../context/ThemeContext.js';
import { FaCheckCircle, FaSpinner, FaListAlt } from 'react-icons/fa/index.js';

/**
 * TaskStats component displays visualizations and analytics for tasks
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 */
const TaskStats = ({ className = '' }) => {
  const { taskStats } = useTasks();
  const { isDarkMode } = useTheme();
  
  const {
    total,
    completed,
    inProgress,
    todo,
    completionRate,
    priorityDistribution
  } = taskStats;

  // Calculate percentages for visualization
  const todoPercent = total ? Math.round((todo / total) * 100) : 0;
  const inProgressPercent = total ? Math.round((inProgress / total) * 100) : 0;
  const completedPercent = total ? Math.round((completed / total) * 100) : 0;
  
  // Calculate priority percentages
  const highPercent = total ? Math.round((priorityDistribution.high / total) * 100) : 0;
  const mediumPercent = total ? Math.round((priorityDistribution.medium / total) * 100) : 0;
  const lowPercent = total ? Math.round((priorityDistribution.low / total) * 100) : 0;

  return (
    <div className={`${isDarkMode ? 'bg-dark-surface text-dark-primary' : 'bg-white text-coffee-dark'} 
      rounded-xl shadow-md p-6 ${className} transition-colors duration-200`}>
      <h2 className="text-lg font-medium mb-6">Task Statistics</h2>
      
      {/* Progress Overview */}
      <div className="mb-8">
        <h3 className="text-sm uppercase font-medium mb-4 opacity-75">Progress Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 
              ${isDarkMode ? 'bg-dark-hover text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              <FaListAlt className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">{todo}</span>
            <span className={`text-xs ${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>To Do</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 
              ${isDarkMode ? 'bg-dark-hover text-yellow-400' : 'bg-yellow-100 text-yellow-600'}`}>
              <FaSpinner className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">{inProgress}</span>
            <span className={`text-xs ${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>In Progress</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 
              ${isDarkMode ? 'bg-dark-hover text-green-400' : 'bg-green-100 text-green-600'}`}>
              <FaCheckCircle className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">{completed}</span>
            <span className={`text-xs ${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>Completed</span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-1">
          <span className={`${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>Overall Completion</span>
          <span className="font-medium">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-coffee-primary h-2.5 rounded-full" 
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-4 mb-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></div>
            <span className={`text-xs ${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>To Do ({todoPercent}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1.5"></div>
            <span className={`text-xs ${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>In Progress ({inProgressPercent}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
            <span className={`text-xs ${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>Completed ({completedPercent}%)</span>
          </div>
        </div>
      </div>
      
      {/* Priority Distribution */}
      <div>
        <h3 className="text-sm uppercase font-medium mb-4 opacity-75">Priority Distribution</h3>
        
        {/* High Priority */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className={`${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>High</span>
            <span className="font-medium">{priorityDistribution.high}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-red-500 h-2.5 rounded-full" 
              style={{ width: `${highPercent || 0}%` }}
            ></div>
          </div>
        </div>
        
        {/* Medium Priority */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className={`${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>Medium</span>
            <span className="font-medium">{priorityDistribution.medium}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-yellow-500 h-2.5 rounded-full" 
              style={{ width: `${mediumPercent || 0}%` }}
            ></div>
          </div>
        </div>
        
        {/* Low Priority */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className={`${isDarkMode ? 'text-dark-secondary' : 'text-coffee-medium'}`}>Low</span>
            <span className="font-medium">{priorityDistribution.low}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: `${lowPercent || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskStats;