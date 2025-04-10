import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDatabase } from '../context/DatabaseContext.js';
import PageHeader from '../components/PageHeader.js';
import TaskCard from '../components/TaskCard.js';

export default function BacklogPage() {
  // Access database context
  const { allTasks, states, updateTask, loading } = useDatabase();
  
  // Track component mount status
  const isMounted = useRef(true);
  
  // Define column structure with state mappings
  const [columns, setColumns] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [stateToColumnMap, setStateToColumnMap] = useState({});
  const [columnToStateMap, setColumnToStateMap] = useState({});
  const [swimlanes, setSwimlanes] = useState({});
  const [isDragDropEnabled, setIsDragDropEnabled] = useState(false);
  const [tasks, setTasks] = useState([]);
  
  // Set up component mount/unmount tracking
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Initialize tasks from context - convert IDs to strings for consistency
  useEffect(() => {
    if (!allTasks || !isMounted.current) return;
    
    // Ensure all task IDs are strings for consistency
    const formattedTasks = allTasks.map(task => ({
      ...task,
      id: String(task.id)
    }));
    
    setTasks(formattedTasks);
  }, [allTasks]);
  
  // Initialize board structure based on states from DB
  useEffect(() => {
    if (!states || states.length === 0 || !isMounted.current) return;
    
    // Create columns based on states from database
    const newColumns = {};
    const newColumnOrder = [];
    const newStateToColumnMap = {};
    const newColumnToStateMap = {};
    const newSwimlanes = {};
    
    // Define column structure with their icons and styling
    const standardColumns = [
      { 
        id: 'backlog', 
        title: 'Backlog',
        icon: '📝',
        color: 'bg-coffee-light',
        borderColor: 'border-coffee-medium',
        stateIds: []
      },
      { 
        id: 'todo', 
        title: 'To Do',
        icon: '📋',
        color: 'bg-amber-50',
        borderColor: 'border-amber-300',
        stateIds: []
      },
      { 
        id: 'inprogress', 
        title: 'In Progress',
        icon: '⚙️',
        color: 'bg-blue-50',
        borderColor: 'border-blue-300',
        stateIds: []
      },
      { 
        id: 'done', 
        title: 'Done',
        icon: '✅',
        color: 'bg-green-50',
        borderColor: 'border-green-300',
        hasSwimLanes: true,
        swimLanes: [
          {
            id: 'done-completed',
            title: 'Completed',
            icon: '✓',
            stateIds: []
          },
          {
            id: 'done-wontfix',
            title: "Won't Fix",
            icon: '🚫',
            stateIds: []
          },
          {
            id: 'done-duplicate',
            title: 'Duplicate',
            icon: '🔄',
            stateIds: []
          }
        ]
      }
    ];
    
    // Initialize standard columns
    standardColumns.forEach(column => {
      newColumns[column.id] = {
        ...column,
        tasks: [],
        stateIds: []
      };
      newColumnOrder.push(column.id);
      
      // Set up swimlanes if the column has them
      if (column.hasSwimLanes && column.swimLanes) {
        newSwimlanes[column.id] = column.swimLanes.map(lane => ({
          ...lane,
          tasks: [],
          stateIds: []
        }));
      }
    });
    
    // Map state IDs to columns
    states.forEach(state => {
      // Create state id mapping based on the numeric id
      const stateId = String(state.id);
      
      // Map each state ID to its appropriate column/swimlane
      switch (stateId) {
        case '1': // Created
          if (newColumns.backlog) {
            newColumns.backlog.stateIds.push(stateId);
            newStateToColumnMap[stateId] = { columnId: 'backlog' };
          }
          break;
          
        case '2': // To Do
          if (newColumns.todo) {
            newColumns.todo.stateIds.push(stateId);
            newStateToColumnMap[stateId] = { columnId: 'todo' };
          }
          break;
          
        case '3': // In Progress
        case '4': // In Review (also goes to In Progress column)
          if (newColumns.inprogress) {
            newColumns.inprogress.stateIds.push(stateId);
            newStateToColumnMap[stateId] = { columnId: 'inprogress' };
          }
          break;
          
        case '5': // Closed
          if (newColumns.done && newSwimlanes.done && newSwimlanes.done[0]) {
            newColumns.done.stateIds.push(stateId);
            newStateToColumnMap[stateId] = { columnId: 'done', swimLaneId: 'done-completed' };
            newSwimlanes.done[0].stateIds.push(stateId);
          }
          break;
          
        case '6': // Won't Fix
          if (newColumns.done && newSwimlanes.done && newSwimlanes.done[1]) {
            newColumns.done.stateIds.push(stateId);
            newStateToColumnMap[stateId] = { columnId: 'done', swimLaneId: 'done-wontfix' };
            newSwimlanes.done[1].stateIds.push(stateId);
          }
          break;
          
        case '7': // Duplicate
          if (newColumns.done && newSwimlanes.done && newSwimlanes.done[2]) {
            newColumns.done.stateIds.push(stateId);
            newStateToColumnMap[stateId] = { columnId: 'done', swimLaneId: 'done-duplicate' };
            newSwimlanes.done[2].stateIds.push(stateId);
          }
          break;
          
        default:
          // If we encounter an unknown state ID, add it to backlog as a default
          if (newColumns.backlog) {
            newColumns.backlog.stateIds.push(stateId);
            newStateToColumnMap[stateId] = { columnId: 'backlog' };
          }
          break;
      }
    });
    
    // Create reverse mapping from column ID to state IDs
    Object.keys(newColumns).forEach(columnId => {
      const stateIds = newColumns[columnId].stateIds;
      if (stateIds && stateIds.length > 0) {
        // Use the first state ID as the primary one for this column
        newColumnToStateMap[columnId] = stateIds[0];
        
        // For columns with swimlanes, map each swimlane to its first state ID
        if (newSwimlanes[columnId]) {
          newSwimlanes[columnId].forEach(lane => {
            if (lane.stateIds && lane.stateIds.length > 0) {
              newColumnToStateMap[lane.id] = lane.stateIds[0];
            }
          });
        }
      }
    });
    
    // Update state with all the new values
    if (isMounted.current) {
      setColumns(newColumns);
      setColumnOrder(newColumnOrder);
      setStateToColumnMap(newStateToColumnMap);
      setColumnToStateMap(newColumnToStateMap);
      setSwimlanes(newSwimlanes);
    }
  }, [states]);
  
  // Organize tasks into columns when tasks change
  useEffect(() => {
    if (!tasks.length || !Object.keys(stateToColumnMap).length || !Object.keys(columns).length || !isMounted.current || loading) {
      return;
    }
    
    // Clone current columns and swimlanes to avoid direct state mutation
    const newColumns = JSON.parse(JSON.stringify(columns));
    const newSwimlanes = JSON.parse(JSON.stringify(swimlanes));
    
    // Reset tasks for all columns and swimlanes
    Object.keys(newColumns).forEach(columnId => {
      newColumns[columnId].tasks = [];
      
      // Reset tasks for swimlanes if they exist for this column
      if (newSwimlanes[columnId]) {
        newSwimlanes[columnId].forEach(lane => {
          lane.tasks = [];
        });
      }
    });
    
    // Add tasks to appropriate columns and swimlanes based on their state
    tasks.forEach(task => {
      const safeTask = { ...task, id: String(task.id) };
      const mapping = stateToColumnMap[task.stateId];
      
      if (mapping) {
        const { columnId, swimLaneId } = mapping;
        
        if (columnId && newColumns[columnId]) {
          if (swimLaneId && newSwimlanes[columnId]) {
            const laneIndex = newSwimlanes[columnId].findIndex(lane => lane.id === swimLaneId);
            if (laneIndex !== -1) {
              // Add task to the appropriate swimlane
              newSwimlanes[columnId][laneIndex].tasks.push(safeTask);
            } else {
              // Fallback: add to column's tasks if swimlane not found
              newColumns[columnId].tasks.push(safeTask);
            }
          } else {
            // Add to column's tasks for regular columns
            newColumns[columnId].tasks.push(safeTask);
          }
        } else if (newColumns.backlog) {
          // Fallback: add to backlog if column not found
          newColumns.backlog.tasks.push(safeTask);
        }
      } else if (newColumns.backlog) {
        // Fallback: add to backlog if no mapping found
        newColumns.backlog.tasks.push(safeTask);
      }
    });
    
    // Update state if component is still mounted
    if (isMounted.current) {
      setColumns(newColumns);
      setSwimlanes(newSwimlanes);
      // Enable drag and drop after columns are populated
      setIsDragDropEnabled(true);
    }
  }, [tasks, stateToColumnMap, loading]);
  
  // Handle drag and drop events
  const onDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId } = result;
    
    // If dropped outside a droppable area or same position, do nothing
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    console.log("Drag completed with ID:", draggableId);
    
    // Find the task that was dragged
    const movedTask = tasks.find(t => String(t.id) === draggableId);
    
    if (!movedTask) {
      console.error('Could not find the dragged task with ID:', draggableId);
      return;
    }
    
    // Get the destination container (column or swimlane) info
    const getContainerInfo = (droppableId) => {
      if (droppableId.includes('-')) {
        // This is a swimlane
        const [columnId] = droppableId.split('-');
        return { columnId, swimlaneId: droppableId, isSwimLane: true };
      } else {
        // This is a regular column
        return { columnId: droppableId, isSwimLane: false };
      }
    };
    
    // Get info about source and destination
    const sourceInfo = getContainerInfo(source.droppableId);
    const destinationInfo = getContainerInfo(destination.droppableId);
    
    // Clone current columns and swimlanes
    const newColumns = JSON.parse(JSON.stringify(columns));
    const newSwimlanes = JSON.parse(JSON.stringify(swimlanes));
    
    // Remove task from source
    if (sourceInfo.isSwimLane) {
      const sourceLaneIndex = newSwimlanes[sourceInfo.columnId].findIndex(
        lane => lane.id === sourceInfo.swimlaneId
      );
      if (sourceLaneIndex !== -1) {
        newSwimlanes[sourceInfo.columnId][sourceLaneIndex].tasks = 
          newSwimlanes[sourceInfo.columnId][sourceLaneIndex].tasks.filter(
            t => String(t.id) !== draggableId
          );
      }
    } else {
      newColumns[sourceInfo.columnId].tasks = 
        newColumns[sourceInfo.columnId].tasks.filter(
          t => String(t.id) !== draggableId
        );
    }
    
    // Add task to destination
    if (destinationInfo.isSwimLane) {
      const destLaneIndex = newSwimlanes[destinationInfo.columnId].findIndex(
        lane => lane.id === destinationInfo.swimlaneId
      );
      if (destLaneIndex !== -1) {
        const destTasks = [...newSwimlanes[destinationInfo.columnId][destLaneIndex].tasks];
        destTasks.splice(destination.index, 0, movedTask);
        newSwimlanes[destinationInfo.columnId][destLaneIndex].tasks = destTasks;
      }
    } else {
      const destTasks = [...newColumns[destinationInfo.columnId].tasks];
      destTasks.splice(destination.index, 0, movedTask);
      newColumns[destinationInfo.columnId].tasks = destTasks;
    }
    
    // Update state first to maintain responsive UI
    if (isMounted.current) {
      setColumns(newColumns);
      setSwimlanes(newSwimlanes);
    }
    
    // Update task state
    const newStateId = columnToStateMap[destination.droppableId];
    if (newStateId) {
      try {
        // Make sure the task has stateId updated
        await updateTask(movedTask.id, { stateId: newStateId });
        console.log(`Updated task ${movedTask.id} to state ${newStateId}`);
        
        // Update the local tasks array as well
        if (isMounted.current) {
          setTasks(prevTasks => 
            prevTasks.map(t => 
              String(t.id) === draggableId 
                ? { ...t, stateId: newStateId } 
                : t
            )
          );
        }
      } catch (error) {
        console.error('Error updating task state:', error);
      }
    }
  }, [tasks, columns, swimlanes, columnToStateMap, updateTask]);

  // Generate backlog board content based on data and loading state
  const renderBoardContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-dark"></div>
          <p className="mt-4 text-coffee-dark font-medium">Brewing your tasks...</p>
        </div>
      );
    }
    
    if (!tasks || tasks.length === 0) {
      return (
        <div className="mt-8 text-center py-12 bg-white rounded-xl shadow-coffee">
          <div className="mx-auto h-24 w-24 rounded-full bg-coffee-light flex items-center justify-center">
            <svg className="h-12 w-12 text-coffee-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-display font-bold text-coffee-dark">No tasks found</h3>
          <p className="mt-2 text-coffee-medium max-w-md mx-auto">Create some tasks from the Dashboard to start organizing your work.</p>
        </div>
      );
    }
    
    // Only render DragDropContext if it's ready and enabled
    return isDragDropEnabled ? (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            if (!column) return null;
            
            return (
              <div key={columnId} className="flex flex-col">
                <div className={`flex items-center gap-2 mb-3 px-3 py-2 ${column.color} rounded-lg shadow-sm border ${column.borderColor}`}>
                  <span className="text-xl" role="img" aria-label={column.title}>
                    {column.icon}
                  </span>
                  <h3 className="text-lg font-display font-semibold text-coffee-dark">
                    {column.title} 
                  </h3>
                  {column.hasSwimLanes ? (
                    <span className="ml-auto bg-white text-coffee-dark text-sm font-medium px-2 py-1 rounded-full shadow-sm">
                      {swimlanes[columnId]?.reduce((count, lane) => count + lane.tasks.length, 0) || 0}
                    </span>
                  ) : (
                    <span className="ml-auto bg-white text-coffee-dark text-sm font-medium px-2 py-1 rounded-full shadow-sm">
                      {column.tasks.length}
                    </span>
                  )}
                </div>
                
                {column.hasSwimLanes && swimlanes[columnId] ? (
                  // Render swimlanes for this column
                  <div className={`flex-1 p-3 rounded-xl bg-white/70 shadow-coffee border border-gray-100 min-h-[300px]`}>
                    {swimlanes[columnId].map((lane) => (
                      <div key={lane.id} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-1 mb-2 px-2">
                          <span className="text-sm" role="img" aria-label={lane.title}>
                            {lane.icon}
                          </span>
                          <h4 className="text-sm font-medium text-coffee-dark">
                            {lane.title}
                          </h4>
                          <span className="ml-auto text-xs text-gray-400">
                            {lane.tasks.length}
                          </span>
                        </div>
                        
                        <Droppable droppableId={lane.id} key={lane.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`rounded-lg p-2 transition-colors duration-200 min-h-[50px] ${
                                snapshot.isDraggingOver 
                                  ? `${column.color} shadow-inner border border-${column.borderColor}` 
                                  : 'bg-gray-50/50'
                              }`}
                            >
                              <div className="space-y-3">
                                {lane.tasks.map((task, index) => (
                                  <Draggable 
                                    key={String(task.id)} 
                                    draggableId={String(task.id)} 
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`transition-all duration-200 ${
                                          snapshot.isDragging 
                                            ? 'scale-105 rotate-1 shadow-coffee-hover' 
                                            : ''
                                        }`}
                                      >
                                        <TaskCard task={task} />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                              {provided.placeholder}
                              
                              {lane.tasks.length === 0 && (
                                <div className="flex items-center justify-center h-[40px] text-center opacity-50">
                                  <p className="text-xs text-gray-400">Drop tasks here</p>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Render regular column without swimlanes
                  <Droppable droppableId={columnId} key={columnId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 rounded-xl min-h-[300px] transition-colors duration-200 ${
                          snapshot.isDraggingOver 
                            ? `${column.color} shadow-inner border-2 ${column.borderColor}` 
                            : 'bg-white/70 shadow-coffee border border-gray-100'
                        }`}
                      >
                        <div className="space-y-3">
                          {column.tasks.map((task, index) => (
                            <Draggable 
                              key={String(task.id)} 
                              draggableId={String(task.id)} 
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`transition-all duration-200 ${
                                    snapshot.isDragging 
                                      ? 'scale-105 rotate-1 shadow-coffee-hover' 
                                      : ''
                                  }`}
                                >
                                  <TaskCard task={task} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>
                        {provided.placeholder}
                        
                        {column.tasks.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                            <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-sm text-gray-500">Drop tasks here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            );
          })}
        </div>
      </DragDropContext>
    ) : (
      // Placeholder content while DnD is initializing
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {columnOrder.map((columnId) => {
          const column = columns[columnId];
          if (!column) return null;
          
          return (
            <div key={columnId} className="flex flex-col">
              <div className={`flex items-center gap-2 mb-3 px-3 py-2 ${column.color} rounded-lg shadow-sm border ${column.borderColor}`}>
                <span className="text-xl" role="img" aria-label={column.title}>
                  {column.icon}
                </span>
                <h3 className="text-lg font-display font-semibold text-coffee-dark">
                  {column.title} 
                </h3>
                <span className="ml-auto bg-white text-coffee-dark text-sm font-medium px-2 py-1 rounded-full shadow-sm">
                  {column.tasks?.length || 0}
                </span>
              </div>
              
              <div className="flex-1 p-3 rounded-xl min-h-[300px] bg-white/70 shadow-coffee border border-gray-100">
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 bg-gradient-to-b from-coffee-light/30 to-transparent min-h-screen">
      <PageHeader 
        title={
          <div className="flex items-center">
            <span className="mr-2">☕</span>
            <span>Backlog Brewing</span>
          </div>
        }
        subtitle="Drag tasks between columns to update their status"
      />
      
      {renderBoardContent()}
    </div>
  );
}