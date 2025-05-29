// Fetch room status data
async function fetchRoomStatus() {
    try {
        const response = await fetch('../data/rooms.json');
        const data = await response.json();
        return data.rooms;
    } catch (error) {
        console.error('Failed to fetch room status:', error);
        return [];
    }
}

// Update room status display
function updateRoomDisplay(rooms) {
    const roomGrid = document.getElementById('roomGrid');
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    // Filter rooms
    const filteredRooms = rooms.filter(room => {
        const statusMatch = statusFilter === 'all' || room.status === statusFilter;
        const typeMatch = typeFilter === 'all' || room.type === typeFilter;
        return statusMatch && typeMatch;
    });

    // Generate room cards
    roomGrid.innerHTML = filteredRooms.map(room => `
        <div class="room-card">
            <h3>${room.roomNumber} - ${room.type}</h3>
            <div class="status status-${getStatusClass(room.status)}">${room.status}</div>
            <div class="last-update">Last Update: ${formatDate(room.lastUpdate)}</div>
            ${room.notes ? `<div class="notes">Notes: ${room.notes}</div>` : ''}
        </div>
    `).join('');
}

// Get CSS class name for status
function getStatusClass(status) {
    const statusMap = {
        'Vacant': 'vacant',
        'Occupied': 'occupied',
        'Cleaning': 'cleaning',
        'Maintenance': 'maintenance'
    };
    return statusMap[status] || 'vacant';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize page
async function initializePage() {
    const rooms = await fetchRoomStatus();
    updateRoomDisplay(rooms);

    // Add filter event listeners
    document.getElementById('statusFilter').addEventListener('change', () => {
        updateRoomDisplay(rooms);
    });
    document.getElementById('typeFilter').addEventListener('change', () => {
        updateRoomDisplay(rooms);
    });

    // Set up auto-refresh (every 30 seconds)
    setInterval(async () => {
        const updatedRooms = await fetchRoomStatus();
        updateRoomDisplay(updatedRooms);
    }, 30000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializePage); 