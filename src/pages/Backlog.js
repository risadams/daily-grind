import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDatabase } from '../context/DatabaseContext.js';
import PageHeader from '../components/PageHeader.js';
import TicketCard from '../components/TicketCard.js';

export default function BacklogPage() {
  const { allTickets: tickets, states, updateTicket, loading } = useDatabase();
  
  // Simplify by directly creating the board structure
  const [board, setBoard] = useState({
    columns: {
      'backlog': {
        id: 'backlog',
        title: 'Backlog',
        tickets: []
      },
      'todo': {
        id: 'todo',
        title: 'To Do',
        tickets: []
      },
      'inprogress': {
        id: 'inprogress',
        title: 'In Progress',
        tickets: []
      },
      'done': {
        id: 'done',
        title: 'Done',
        tickets: []
      },
      'wontfix': {
        id: 'wontfix',
        title: "Won't Fix",
        tickets: []
      },
      'duplicate': {
        id: 'duplicate',
        title: 'Duplicate',
        tickets: []
      }
    },
    columnOrder: ['backlog', 'todo', 'inprogress', 'done', 'wontfix', 'duplicate']
  });

  // Organize tickets into columns - we'll call this when the component renders
  const organizeTickets = () => {
    // Map for quick state name lookup
    const stateNameMap = {};
    states.forEach(state => {
      stateNameMap[state.id] = state.name.toLowerCase().replace(/\s+/g, '');
    });
    
    console.log('State names:', stateNameMap);
    
    // Clone current board state
    const newBoard = JSON.parse(JSON.stringify(board));
    
    // Clear existing tickets
    Object.keys(newBoard.columns).forEach(columnId => {
      newBoard.columns[columnId].tickets = [];
    });
    
    // Add tickets to appropriate columns
    tickets.forEach(ticket => {
      const stateName = stateNameMap[ticket.stateId] || '';
      const ticketWithDragId = {
        ...ticket,
        id: String(ticket.id) // Ensure ID is a string
      };
      
      if (stateName.includes('backlog')) {
        newBoard.columns.backlog.tickets.push(ticketWithDragId);
      } else if (stateName.includes('todo') || stateName.includes('open')) {
        newBoard.columns.todo.tickets.push(ticketWithDragId);
      } else if (stateName.includes('progress')) {
        newBoard.columns.inprogress.tickets.push(ticketWithDragId);
      } else if (stateName.includes('done') || stateName.includes('closed')) {
        newBoard.columns.done.tickets.push(ticketWithDragId);
      } else if (stateName.includes('wont') || stateName.includes('won\'t')) {
        newBoard.columns.wontfix.tickets.push(ticketWithDragId);
      } else if (stateName.includes('duplicate')) {
        newBoard.columns.duplicate.tickets.push(ticketWithDragId);
      } else {
        // Default to backlog
        newBoard.columns.backlog.tickets.push(ticketWithDragId);
      }
    });
    
    // Log the distribution
    Object.keys(newBoard.columns).forEach(columnId => {
      console.log(`${newBoard.columns[columnId].title}: ${newBoard.columns[columnId].tickets.length} tickets`);
    });
    
    return newBoard;
  };

  // This is the main board data with tickets organized
  const organizedBoard = organizeTickets();
  
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    // If dropped outside a droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // Update local board state
    const start = organizedBoard.columns[source.droppableId];
    const finish = organizedBoard.columns[destination.droppableId];
    
    // Moving in the same column
    if (start === finish) {
      const newTickets = Array.from(start.tickets);
      // Remove from old position
      const [movedTicket] = newTickets.splice(source.index, 1);
      // Insert at new position
      newTickets.splice(destination.index, 0, movedTicket);
      
      const newColumn = {
        ...start,
        tickets: newTickets
      };
      
      const newState = {
        ...organizedBoard,
        columns: {
          ...organizedBoard.columns,
          [newColumn.id]: newColumn
        }
      };
      
      setBoard(newState);
      return;
    }
    
    // Moving from one column to another
    const startTickets = Array.from(start.tickets);
    const [movedTicket] = startTickets.splice(source.index, 1);
    const newStart = {
      ...start,
      tickets: startTickets
    };
    
    const finishTickets = Array.from(finish.tickets);
    finishTickets.splice(destination.index, 0, movedTicket);
    const newFinish = {
      ...finish,
      tickets: finishTickets
    };
    
    const newState = {
      ...organizedBoard,
      columns: {
        ...organizedBoard.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    };
    
    setBoard(newState);
    
    // Update ticket state in database
    try {
      // Find the correct state ID based on the column
      const destinationStateName = destination.droppableId;
      let newStateId = null;
      
      for (const state of states) {
        const stateName = state.name.toLowerCase().replace(/\s+/g, '');
        if (
          (destinationStateName === 'backlog' && stateName.includes('backlog')) ||
          (destinationStateName === 'todo' && (stateName.includes('todo') || stateName.includes('open'))) ||
          (destinationStateName === 'inprogress' && stateName.includes('progress')) ||
          (destinationStateName === 'done' && (stateName.includes('done') || stateName.includes('closed'))) ||
          (destinationStateName === 'wontfix' && (stateName.includes('wont') || stateName.includes("won't"))) ||
          (destinationStateName === 'duplicate' && stateName.includes('duplicate'))
        ) {
          newStateId = state.id;
          break;
        }
      }
      
      if (newStateId) {
        await updateTicket(draggableId, { stateId: newStateId });
        console.log(`Updated ticket ${draggableId} to state ${newStateId}`);
      }
    } catch (error) {
      console.error('Error updating ticket state:', error);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left column: Backlog */}
            <div className="space-y-4">
              <Droppable droppableId="backlog">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-coffee-light p-4 rounded-lg min-h-[300px]"
                  >
                    <h3 className="text-lg font-medium text-coffee-dark mb-4">Backlog</h3>
                    {organizedBoard.columns.backlog.tickets.map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
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

            {/* Middle column: To Do and In Progress */}
            <div className="space-y-4">
              <Droppable droppableId="todo">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-coffee-light p-4 rounded-lg min-h-[140px]"
                  >
                    <h3 className="text-lg font-medium text-coffee-dark mb-4">To Do</h3>
                    {organizedBoard.columns.todo.tickets.map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
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

              <Droppable droppableId="inprogress">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-coffee-light p-4 rounded-lg min-h-[140px]"
                  >
                    <h3 className="text-lg font-medium text-coffee-dark mb-4">In Progress</h3>
                    {organizedBoard.columns.inprogress.tickets.map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
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

            {/* Right column: Done states */}
            <div className="space-y-4">
              <Droppable droppableId="done">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-green-50 p-4 rounded-lg min-h-[100px]"
                  >
                    <h3 className="text-lg font-medium text-coffee-dark mb-4">Done</h3>
                    {organizedBoard.columns.done.tickets.map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
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

              <Droppable droppableId="wontfix">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-50 p-4 rounded-lg min-h-[100px]"
                  >
                    <h3 className="text-lg font-medium text-coffee-dark mb-4">Won't Fix</h3>
                    {organizedBoard.columns.wontfix.tickets.map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
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

              <Droppable droppableId="duplicate">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-50 p-4 rounded-lg min-h-[100px]"
                  >
                    <h3 className="text-lg font-medium text-coffee-dark mb-4">Duplicate</h3>
                    {organizedBoard.columns.duplicate.tickets.map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
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
          </div>
        </DragDropContext>
      )}
    </div>
  );
}