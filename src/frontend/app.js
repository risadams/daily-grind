document.addEventListener('DOMContentLoaded', () => {
    // Fetch tickets from the API
    fetchTickets();
});

async function fetchTickets() {
    try {
        const response = await fetch('/api/tickets');
        const tickets = await response.json();
        
        if (tickets.length === 0) {
            displayNoTickets();
        } else {
            displayTickets(tickets);
        }
    } catch (error) {
        displayError(error);
    }
}

function displayTickets(tickets) {
    const ticketList = document.getElementById('ticket-list');
    ticketList.innerHTML = '';
    
    tickets.forEach(ticket => {
        const ticketEl = document.createElement('div');
        ticketEl.className = 'ticket';
        
        // Format creation date
        const creationDate = new Date(ticket.creationDate);
        const formattedDate = creationDate.toLocaleDateString();
        
        ticketEl.innerHTML = `
            <h3>${ticket.title}</h3>
            <p class="description">${ticket.description || 'No description provided.'}</p>
            
            <div class="ticket-details">
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="status ${ticket.state.toLowerCase()}">${ticket.state}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Priority:</span>
                    <span class="priority ${ticket.priority}">${ticket.priority}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Created:</span>
                    <span>${formattedDate} by ${ticket.createdByUser}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Assigned to:</span>
                    <span>${ticket.assignedToUser || 'Unassigned'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Story Points:</span>
                    <span>Estimated: ${ticket.estimatedStoryPoints} / Actual: ${ticket.actualStoryPoints || '0'}</span>
                </div>
            </div>
            
            <div class="ticket-actions">
                <button class="btn view-btn" data-id="${ticket.id}">View Details</button>
            </div>
        `;
        
        ticketList.appendChild(ticketEl);
    });
    
    // Add event listeners for the view buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', () => {
            const ticketId = button.getAttribute('data-id');
            viewTicketDetails(ticketId);
        });
    });
}

function viewTicketDetails(ticketId) {
    // In a more complete app, this would open a modal or navigate to a details page
    console.log(`View ticket details for ticket #${ticketId}`);
    alert(`View ticket details for ticket #${ticketId} (This would open a detailed view in a complete app)`);
}

function displayNoTickets() {
    const ticketList = document.getElementById('ticket-list');
    ticketList.innerHTML = '<div class="no-tickets">No tickets found</div>';
}

function displayError(error) {
    const ticketList = document.getElementById('ticket-list');
    ticketList.innerHTML = `<div class="error">Error loading tickets: ${error.message}</div>`;
}