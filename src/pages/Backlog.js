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
  
  // Initialize board structure based on states from Firebase
  useEffect(() => {
    if (states && states.length > 0) {
      // Create columns based on states from database
      const newColumns = {};
      const newColumnOrder = [];
      const newStateToColumnMap = {};
      const newColumnToStateMap = {};
      
      // Create standard columns based on common ticket management states
      const standardColumns = [
        { id: 'backlog', title: 'Backlog', stateNames: ['backlog'] },
        { id: 'todo', title: 'To Do', stateNames: ['todo', 'open', 'new'] },
        { id: 'inprogress', title: 'In Progress', stateNames: ['progress', 'in progress', 'working', 'started'] },
        { id: 'done', title: 'Done', stateNames: ['done', 'closed', 'completed', 'finished'] },
        { id: 'wontfix', title: "Won't Fix", stateNames: ['wont fix', "won't fix", 'wontfix'] },
        { id: 'duplicate', title: 'Duplicate', stateNames: ['duplicate'] }
      ];
      
      // Initialize standard columns
      standardColumns.forEach(column => {
        newColumns[column.id] = {
          id: column.id,
          title: column.title,
          tickets: [],
          stateIds: []
        };
        newColumnOrder.push(column.id);
      });
      
      // Map state IDs to columns
      states.forEach(state => {
        const stateName = state.name.toLowerCase();
        let mapped = false;
        
        // Try to map to a standard column
        for (const column of standardColumns) {
          if (column.stateNames.some(name => stateName.includes(name))) {
            newColumns[column.id].stateIds.push(state.id);
            newStateToColumnMap[state.id] = column.id;
            mapped = true;
            break;
          }
        }
        
        // If the state doesn't map to any standard column, add it to backlog (as default)
        if (!mapped) {
          newColumns.backlog.stateIds.push(state.id);
          newStateToColumnMap[state.id] = 'backlog';
        }
      });
      
      // Create reverse mapping from column ID to state IDs
      Object.keys(newColumns).forEach(columnId => {
        const stateIds = newColumns[columnId].stateIds;
        if (stateIds.length > 0) {
          // Use the first state ID as the primary one for this column
          newColumnToStateMap[columnId] = stateIds[0];
        }
      });
      
      // Update state
      setColumns(newColumns);
      setColumnOrder(newColumnOrder);
      setStateToColumnMap(newStateToColumnMap);
      setColumnToStateMap(newColumnToStateMap);
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
    // Clone current columns
    const newColumns = { ...columns };
    
    // Reset tickets for all columns
    Object.keys(newColumns).forEach(columnId => {
      newColumns[columnId] = {
        ...newColumns[columnId],
        tickets: []
      };
    });
    
    // Add tickets to appropriate columns based on their state
    tickets.forEach(ticket => {
      const ticketWithStringId = {
        ...ticket,
        id: String(ticket.id) // Ensure ID is a string for drag and drop
      };
      
      // Find the column for this ticket's state
      const columnId = stateToColumnMap[ticket.stateId];
      
      if (columnId && newColumns[columnId]) {
        // Add ticket to the appropriate column
        newColumns[columnId].tickets.push(ticketWithStringId);
      } else {
        // If no matching column found, add to backlog as default
        newColumns.backlog.tickets.push(ticketWithStringId);
      }
    });
    
    // Update the columns state
    setColumns(newColumns);
  };
  
  // Handle drag and drop events
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    // If dropped outside a droppable area or same position, do nothing
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    
    // Get source and destination columns
    const startColumn = columns[source.droppableId];
    const finishColumn = columns[destination.droppableId];
    
    if (!startColumn || !finishColumn) return;
    
    // Create new arrays of tickets for the affected columns
    const startTickets = Array.from(startColumn.tickets);
    const [movedTicket] = startTickets.splice(source.index, 1);
    
    if (startColumn.id === finishColumn.id) {
      // Moving within the same column
      startTickets.splice(destination.index, 0, movedTicket);
      
      const newColumns = {
        ...columns,
        [startColumn.id]: {
          ...startColumn,
          tickets: startTickets
        }
      };
      
      // Update the columns state
      setColumns(newColumns);
    } else {
      // Moving to a different column
      const finishTickets = Array.from(finishColumn.tickets);
      finishTickets.splice(destination.index, 0, movedTicket);
      
      const newColumns = {
        ...columns,
        [startColumn.id]: {
          ...startColumn,
          tickets: startTickets
        },
        [finishColumn.id]: {
          ...finishColumn,
          tickets: finishTickets
        }
      };
      
      // Update the columns state
      setColumns(newColumns);
      
      // Get the appropriate state ID for the destination column
      const newStateId = columnToStateMap[finishColumn.id];
      
      if (newStateId && movedTicket) {
        try {
          // Update the ticket's state in the database
          await updateTicket(movedTicket.id, { stateId: newStateId });
          console.log(`Updated ticket ${movedTicket.id} to state ${newStateId} (${finishColumn.title})`);
        } catch (error) {
          console.error('Error updating ticket state:', error);
          // Revert the UI change if database update fails
          organizeTicketsIntoColumns();
        }
      } else {
        console.warn('Could not find a valid state ID for column:', finishColumn.id);
      }
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader 
        title="Backlog Brewing"
        subtitle="Drag and drop tickets to update their status"
      />

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-coffee-dark"></div>
          <p className="mt-2 text-coffee-medium">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <div className="mx-auto h-20 w-20 rounded-full bg-coffee-light flex items-center justify-center">
            <svg className="h-10 w-10 text-coffee-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-coffee-dark">No tickets found</h3>
          <p className="mt-1 text-coffee-medium">Create some tickets from the Dashboard to get started.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {columnOrder.map((columnId) => {
              const column = columns[columnId];
              if (!column) return null;
              
              return (
                <div key={columnId} className="space-y-4">
                  <Droppable droppableId={columnId}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-4 rounded-lg min-h-[200px] ${
                          columnId === 'done' 
                            ? 'bg-green-50' 
                            : columnId === 'wontfix' || columnId === 'duplicate'
                              ? 'bg-gray-50'
                              : 'bg-coffee-light'
                        }`}
                      >
                        <h3 className="text-lg font-medium text-coffee-dark mb-4">
                          {column.title}
                          <span className="ml-1 text-sm text-coffee-medium">
                            ({column.tickets.length})
                          </span>
                        </h3>
                        
                        {column.tickets.map((ticket, index) => (
                          <Draggable 
                            key={ticket.id} 
                            draggableId={ticket.id} 
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2"
                              >
                                <TicketCard ticket={ticket} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
      
      {/* Debug information during development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
          <h4 className="font-bold">Debug Info:</h4>
          <details>
            <summary>State Mappings</summary>
            <pre>{JSON.stringify({ 
              states: states?.map(s => `${s.id}: ${s.name}`),
              stateToColumnMap, 
              columnToStateMap 
            }, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}