// Service request list
let serviceRequests = JSON.parse(localStorage.getItem('serviceRequests')) || [];

// Fetch service data
async function fetchServices() {
    try {
        // Get data from services.json
        const response = await fetch('../data/services.json');
        const data = await response.json();
        
        // Get data from localStorage
        const savedServices = localStorage.getItem('serviceRequests');
        if (savedServices) {
            const savedData = JSON.parse(savedServices);
            // Merge data, prioritize data from localStorage
            return data.services.map(service => {
                const savedService = savedData.find(s => s.id === service.id);
                return savedService || service;
            });
        }
        
        return data.services;
    } catch (error) {
        console.error('Failed to fetch service data:', error);
        return [];
    }
}

// Update service display
function updateServiceDisplay(services) {
    const serviceGrid = document.getElementById('serviceGrid');
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    // Filter services
    const filteredServices = services.filter(service => {
        const typeMatch = typeFilter === 'all' || service.type === typeFilter;
        const statusMatch = statusFilter === 'all' || service.status === statusFilter;
        return typeMatch && statusMatch;
    });

    // Generate service cards
    serviceGrid.innerHTML = filteredServices.map(service => `
        <div class="service-card">
            <h3>
                Room ${service.roomNumber}
                <span class="service-id">${service.id}</span>
            </h3>
            <div class="service-info">
                <p>Service Type: <span class="service-type type-${getTypeClass(service.type)}">${service.type}</span></p>
                <p>Status: <span class="service-status status-${getStatusClass(service.status)}">${service.status}</span></p>
                <p>Priority: <span class="service-priority priority-${getPriorityClass(service.priority)}">${service.priority}</span></p>
                <p>Request Time: ${formatDate(service.requestTime)}</p>
                <p>Description: ${service.description}</p>
            </div>
            <div class="service-actions">
                ${getActionButtons(service)}
            </div>
        </div>
    `).join('');

    // Add button event listeners
    addButtonEventListeners();
}

// Get CSS class for service type
function getTypeClass(type) {
    const typeMap = {
        'Cleaning Service': 'cleaning',
        'Repair Service': 'repair',
        'Food Service': 'food',
        'Other Service': 'other'
    };
    return typeMap[type] || 'other';
}

// Get CSS class for status
function getStatusClass(status) {
    const statusMap = {
        'Pending': 'pending',
        'Processing': 'processing',
        'Completed': 'completed'
    };
    return statusMap[status] || 'pending';
}

// Get CSS class for priority
function getPriorityClass(priority) {
    const priorityMap = {
        'Normal': 'normal',
        'Urgent': 'urgent'
    };
    return priorityMap[priority] || 'normal';
}

// Get action buttons based on service status
function getActionButtons(service) {
    if (service.status === 'Pending') {
        return `<button class="accept-btn" data-id="${service.id}">Accept Service</button>`;
    } else if (service.status === 'Processing') {
        return `<button class="complete-btn" data-id="${service.id}">Complete Service</button>`;
    }
    return '';
}

// Add button event listeners
function addButtonEventListeners() {
    document.querySelectorAll('.accept-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const serviceId = e.target.dataset.id;
            await updateServiceStatus(serviceId, 'Processing');
        });
    });

    document.querySelectorAll('.complete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const serviceId = e.target.dataset.id;
            await updateServiceStatus(serviceId, 'Completed');
        });
    });
}

// Update service status
async function updateServiceStatus(serviceId, newStatus) {
    try {
        const services = await fetchServices();
        const serviceIndex = services.findIndex(s => s.id === serviceId);
        if (serviceIndex !== -1) {
            services[serviceIndex].status = newStatus;
            
            // Save updated data to localStorage
            localStorage.setItem('serviceRequests', JSON.stringify(services));
            
            // Update display
            updateServiceDisplay(services);
        }
    } catch (error) {
        console.error('Failed to update service status:', error);
    }
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
    const services = await fetchServices();
    updateServiceDisplay(services);

    // Add filter event listeners
    document.getElementById('typeFilter').addEventListener('change', () => {
        updateServiceDisplay(services);
    });
    document.getElementById('statusFilter').addEventListener('change', () => {
        updateServiceDisplay(services);
    });

    // Set interval for refresh (every 30 seconds)
    setInterval(async () => {
        const updatedServices = await fetchServices();
        updateServiceDisplay(updatedServices);
    }, 30000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializePage);