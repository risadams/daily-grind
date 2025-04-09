import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDatabase } from '../context/DatabaseContext.js';
import PageHeader from '../components/PageHeader.js';
import TicketCard from '../components/TicketCard.js';

export default function BacklogPage() {
  const { allTickets: tickets, states, updateTicket, loading } = useDatabase();
  
  // Define column structure with state mappings
  const [columns, setColumns] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [stateToColumnMap, setStateToColumnMap] = useState({});
  const [columnToStateMap, setColumnToStateMap] = useState({});
  const [swimlanes, setSwimlanes] = useState({});
  
  // Initialize board structure based on states from Firebase
  useEffect(() => {
    if (states && states.length > 0) {
      // Create columns based on states from database
      const newColumns = {};
      const newColumnOrder = [];
      const newStateToColumnMap = {};
      const newColumnToStateMap = {};
      const newSwimlanes = {};
      
      // Create standard columns based on common ticket management states
      const standardColumns = [
        { 
          id: 'backlog', 
          title: 'Backlog',
          icon: '📝',
          color: 'bg-coffee-light',
          borderColor: 'border-coffee-medium',
          stateNames: ['backlog'] 
        },
        { 
          id: 'todo', 
          title: 'To Do',
          icon: '📋',
          color: 'bg-amber-50',
          borderColor: 'border-amber-300', 
          stateNames: ['todo', 'open', 'new'] 
        },
        { 
          id: 'inprogress', 
          title: 'In Progress',
          icon: '⚙️',
          color: 'bg-blue-50',
          borderColor: 'border-blue-300',
          stateNames: ['progress', 'in progress', 'working', 'started'] 
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
              stateNames: ['done', 'closed', 'completed', 'finished']
            },
            {
              id: 'done-wontfix',
              title: "Won't Fix",
              icon: '🚫',
              stateNames: ['wont fix', "won't fix", 'wontfix']
            },
            {
              id: 'done-duplicate',
              title: 'Duplicate',
              icon: '🔄',
              stateNames: ['duplicate']
            }
          ]
        }
      ];
      
      // Initialize standard columns
      standardColumns.forEach(column => {
        newColumns[column.id] = {
          ...column,
          tickets: [],
          stateIds: []
        };
        newColumnOrder.push(column.id);
        
        // Set up swimlanes if the column has them
        if (column.hasSwimLanes && column.swimLanes) {
          newSwimlanes[column.id] = column.swimLanes.map(lane => ({
            ...lane,
            tickets: [],
            stateIds: []
          }));
        }
      });
      
      // Map state IDs to columns and swimlanes
      states.forEach(state => {
        const stateName = state.name.toLowerCase();
        let mapped = false;
        
        // Try to map to a column with swimlanes first
        for (const column of standardColumns) {
          if (column.hasSwimLanes && column.swimLanes) {
            for (let i = 0; i < column.swimLanes.length; i++) {
              const lane = column.swimLanes[i];
              if (lane.stateNames.some(name => stateName.includes(name))) {
                // Add to the column's overall state IDs
                newColumns[column.id].stateIds.push(state.id);
                // Also add to the specific swimlane's state IDs
                newSwimlanes[column.id][i].stateIds.push(state.id);
                newStateToColumnMap[state.id] = {
                  columnId: column.id,
                  swimLaneId: lane.id
                };
                mapped = true;
                break;
              }
            }
            if (mapped) break;
          } else if (column.stateNames.some(name => stateName.includes(name))) {
            // Regular column without swimlanes
            newColumns[column.id].stateIds.push(state.id);
            newStateToColumnMap[state.id] = {
              columnId: column.id
            };
            mapped = true;
            break;
          }
        }
        
        // If the state doesn't map to any defined column, add it to backlog (as default)
        if (!mapped) {
          newColumns.backlog.stateIds.push(state.id);
          newStateToColumnMap[state.id] = {
            columnId: 'backlog'
          };
        }
      });
      
      // Create reverse mapping from column ID to state IDs
      Object.keys(newColumns).forEach(columnId => {
        const stateIds = newColumns[columnId].stateIds;
        if (stateIds.length > 0) {
          // Use the first state ID as the primary one for this column
          newColumnToStateMap[columnId] = stateIds[0];
          
          // For columns with swimlanes, map each swimlane to its first state ID
          if (newSwimlanes[columnId]) {
            newSwimlanes[columnId].forEach(lane => {
              if (lane.stateIds.length > 0) {
                newColumnToStateMap[lane.id] = lane.stateIds[0];
              }
            });
          }
        }
      });
      
      // Update state
      setColumns(newColumns);
      setColumnOrder(newColumnOrder);
      setStateToColumnMap(newStateToColumnMap);
      setColumnToStateMap(newColumnToStateMap);
      setSwimlanes(newSwimlanes);
    }
  }, [states]);
  
  // Organize tickets into columns whenever tickets or state mappings change
  useEffect(() => {
    if (!loading && tickets && tickets.length > 0 && Object.keys(stateToColumnMap).length > 0) {
      organizeTicketsIntoColumns();
    }
  }, [tickets, stateToColumnMap, loading]);
  
  // Function to organize tickets into the appropriate columns
  const organizeTicketsIntoColumns = () => {
    // Clone current columns and swimlanes
    const newColumns = { ...columns };
    const newSwimlanes = { ...swimlanes };
    
    // Reset tickets for all columns and swimlanes
    Object.keys(newColumns).forEach(columnId => {
      newColumns[columnId] = {
        ...newColumns[columnId],
        tickets: []
      };
      
      // Reset tickets for swimlanes if they exist for this column
      if (newSwimlanes[columnId]) {
        newSwimlanes[columnId] = newSwimlanes[columnId].map(lane => ({
          ...lane,
          tickets: []
        }));
      }
    });
    
    // Add tickets to appropriate columns and swimlanes based on their state
    tickets.forEach(ticket => {
      const ticketWithStringId = {
        ...ticket,
        id: String(ticket.id) // Ensure ID is a string for drag and drop
      };
      
      // Find the mapping for this ticket's state
      const mapping = stateToColumnMap[ticket.stateId];
      
      if (mapping) {
        const { columnId, swimLaneId } = mapping;
        
        if (columnId && newColumns[columnId]) {
          // If this column has swimlanes and we know which swimlane
          if (swimLaneId && newSwimlanes[columnId]) {
            const laneIndex = newSwimlanes[columnId].findIndex(lane => lane.id === swimLaneId);
            if (laneIndex !== -1) {
              // Add ticket to the appropriate swimlane
              newSwimlanes[columnId][laneIndex].tickets.push(ticketWithStringId);
            } else {
              // Fallback: add to column's tickets if swimlane not found
              newColumns[columnId].tickets.push(ticketWithStringId);
            }
          } else {
            // Add to column's tickets for regular columns
            newColumns[columnId].tickets.push(ticketWithStringId);
          }
        } else {
          // Fallback: add to backlog if column not found
          newColumns.backlog.tickets.push(ticketWithStringId);
        }
      } else {
        // Fallback: add to backlog if no mapping found
        newColumns.backlog.tickets.push(ticketWithStringId);
      }
    });
    
    // Update the columns and swimlanes state
    setColumns(newColumns);
    setSwimlanes(newSwimlanes);
  };
  
  // Handle drag and drop events
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    // If dropped outside a droppable area or same position, do nothing
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    
    // Helper function to find ticket and its index within a column or swimlane
    const findTicket = (droppableId) => {
      // Check if this is a swimlane ID (contains a dash)
      if (droppableId.includes('-')) {
        const [columnId, laneIdentifier] = droppableId.split('-');
        const columnSwimlanes = swimlanes[columnId];
        
        if (columnSwimlanes) {
          for (let i = 0; i < columnSwimlanes.length; i++) {
            const lane = columnSwimlanes[i];
            if (lane.id === droppableId) {
              const ticketIndex = lane.tickets.findIndex(t => t.id === draggableId);
              if (ticketIndex !== -1) {
                return {
                  columnId,
                  isSwimLane: true,
                  laneId: lane.id,
                  laneIndex: i,
                  tickets: [...lane.tickets],
                  ticketIndex,
                  ticket: lane.tickets[ticketIndex]
                };
              }
            }
          }
        }
      }
      
      // Regular column lookup
      const column = columns[droppableId];
      if (column) {
        const ticketIndex = column.tickets.findIndex(t => t.id === draggableId);
        if (ticketIndex !== -1) {
          return {
            columnId: column.id,
            isSwimLane: false,
            tickets: [...column.tickets],
            ticketIndex,
            ticket: column.tickets[ticketIndex]
          };
        }
      }
      
      return null;
    };
    
    // Find source and destination information
    const source_info = findTicket(source.droppableId);
    
    if (!source_info) {
      console.error('Could not find source ticket');
      return;
    }
    
    // Update state based on where the ticket was dragged to
    if (source.droppableId === destination.droppableId) {
      // Moving within the same droppable (column or swimlane)
      const tickets = source_info.tickets;
      const [movedTicket] = tickets.splice(source.index, 1);
      tickets.splice(destination.index, 0, movedTicket);
      
      // Update the appropriate state
      if (source_info.isSwimLane) {
        // Update swimlane
        const newSwimlanes = { ...swimlanes };
        newSwimlanes[source_info.columnId][source_info.laneIndex].tickets = tickets;
        setSwimlanes(newSwimlanes);
      } else {
        // Update column
        const newColumns = { ...columns };
        newColumns[source_info.columnId].tickets = tickets;
        setColumns(newColumns);
      }
    } else {
      // Moving between different droppables
      // Remove from source
      const sourceTickets = source_info.tickets;
      const [movedTicket] = sourceTickets.splice(source.index, 1);
      
      // Add to destination
      if (destination.droppableId.includes('-')) {
        // Destination is a swimlane
        const [columnId, laneIdentifier] = destination.droppableId.split('-');
        const laneIndex = swimlanes[columnId].findIndex(lane => lane.id === destination.droppableId);
        
        if (laneIndex !== -1) {
          const newSwimlanes = { ...swimlanes };
          const destinationTickets = [...newSwimlanes[columnId][laneIndex].tickets];
          destinationTickets.splice(destination.index, 0, movedTicket);
          newSwimlanes[columnId][laneIndex].tickets = destinationTickets;
          
          // Update source (could be column or another swimlane)
          if (source_info.isSwimLane) {
            newSwimlanes[source_info.columnId][source_info.laneIndex].tickets = sourceTickets;
          } else {
            const newColumns = { ...columns };
            newColumns[source_info.columnId].tickets = sourceTickets;
            setColumns(newColumns);
          }
          
          setSwimlanes(newSwimlanes);
          
          // Update ticket state in database
          const newStateId = columnToStateMap[destination.droppableId];
          if (newStateId) {
            try {
              await updateTicket(movedTicket.id, { stateId: newStateId });
              console.log(`Updated ticket ${movedTicket.id} to state ${newStateId}`);
            } catch (error) {
              console.error('Error updating ticket state:', error);
              organizeTicketsIntoColumns(); // Revert if update fails
            }
          }
        }
      } else {
        // Destination is a regular column
        const newColumns = { ...columns };
        if (!newColumns[destination.droppableId]) {
          console.error('Destination column not found:', destination.droppableId);
          return;
        }
        
        const destinationTickets = [...newColumns[destination.droppableId].tickets];
        destinationTickets.splice(destination.index, 0, movedTicket);
        newColumns[destination.droppableId].tickets = destinationTickets;
        
        // Update source (could be column or swimlane)
        if (source_info.isSwimLane) {
          const newSwimlanes = { ...swimlanes };
          newSwimlanes[source_info.columnId][source_info.laneIndex].tickets = sourceTickets;
          setSwimlanes(newSwimlanes);
        } else {
          newColumns[source_info.columnId].tickets = sourceTickets;
        }
        
        setColumns(newColumns);
        
        // Update ticket state in database
        const newStateId = columnToStateMap[destination.droppableId];
        if (newStateId) {
          try {
            await updateTicket(movedTicket.id, { stateId: newStateId });
            console.log(`Updated ticket ${movedTicket.id} to state ${newStateId}`);
          } catch (error) {
            console.error('Error updating ticket state:', error);
            organizeTicketsIntoColumns(); // Revert if update fails
          }
        }
      }
    }
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
        subtitle="Drag tickets between columns to update their status"
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-dark"></div>
          <p className="mt-4 text-coffee-dark font-medium">Brewing your tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="mt-8 text-center py-12 bg-white rounded-xl shadow-coffee">
          <div className="mx-auto h-24 w-24 rounded-full bg-coffee-light flex items-center justify-center">
            <svg className="h-12 w-12 text-coffee-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-display font-bold text-coffee-dark">No tickets found</h3>
          <p className="mt-2 text-coffee-medium max-w-md mx-auto">Create some tickets from the Dashboard to start organizing your work.</p>
        </div>
      ) : (
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
                        {swimlanes[columnId]?.reduce((count, lane) => count + lane.tickets.length, 0) || 0}
                      </span>
                    ) : (
                      <span className="ml-auto bg-white text-coffee-dark text-sm font-medium px-2 py-1 rounded-full shadow-sm">
                        {column.tickets.length}
                      </span>
                    )}
                  </div>
                  
                  {column.hasSwimLanes && swimlanes[columnId] ? (
                    // Render swimlanes for this column
                    <div className={`flex-1 p-3 rounded-xl bg-white/70 shadow-coffee border border-gray-100 min-h-[300px]`}>
                      {swimlanes[columnId].map((lane, index) => (
                        <div key={lane.id} className="mb-4 last:mb-0">
                          <div className="flex items-center gap-1 mb-2 px-2">
                            <span className="text-sm" role="img" aria-label={lane.title}>
                              {lane.icon}
                            </span>
                            <h4 className="text-sm font-medium text-coffee-dark">
                              {lane.title}
                            </h4>
                            <span className="ml-auto text-xs text-gray-400">
                              {lane.tickets.length}
                            </span>
                          </div>
                          
                          <Droppable droppableId={lane.id}>
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
                                  {lane.tickets.map((ticket, index) => (
                                    <Draggable 
                                      key={ticket.id} 
                                      draggableId={ticket.id} 
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
                                          <TicketCard ticket={ticket} />
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                                {provided.placeholder}
                                
                                {lane.tickets.length === 0 && (
                                  <div className="flex items-center justify-center h-[40px] text-center opacity-50">
                                    <p className="text-xs text-gray-400">Drop tickets here</p>
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
                    <Droppable droppableId={columnId}>
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
                            {column.tickets.map((ticket, index) => (
                              <Draggable 
                                key={ticket.id} 
                                draggableId={ticket.id} 
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
                                    <TicketCard ticket={ticket} />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                          {provided.placeholder}
                          
                          {column.tickets.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              <p className="text-sm text-gray-500">Drop tickets here</p>
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
      )}
    </div>
  );
}