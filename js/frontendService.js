document.addEventListener('DOMContentLoaded', function () {
    // Check login
    if (!auth.isLoggedIn()) {
        alert('Please log in first');
        window.location.href = '../frontend/logIn.html';
        return;
    }

    // Load service tracking
    loadServiceTracking();

    // Form submission event
    document.getElementById('serviceRequestForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const user = auth.getCurrentUser();
        const roomNumber = document.getElementById('roomNumber').value.trim();
        const serviceType = document.getElementById('serviceType').value;
        const description = document.getElementById('description').value.trim();
        const expectedTime = document.getElementById('expectedTime').value;

        if (!roomNumber || !serviceType || !description || !expectedTime) {
            alert('Please fill in all information completely');
            return;
        }

        // Save to localStorage
        const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
        requests.push({
            userId: user.id,
            userName: user.name,
            roomNumber,
            serviceType,
            description,
            expectedTime,
            submitTime: new Date().toISOString(),
            status: 'Pending'
        });
        localStorage.setItem('serviceRequests', JSON.stringify(requests));

        alert('Service request submitted!');
        this.reset();
        loadServiceTracking();
    });
});

// Load and display current user's service tracking
function loadServiceTracking() {
    const user = auth.getCurrentUser();
    const list = document.getElementById('trackingList');
    list.innerHTML = '';
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const myRequests = requests.filter(r => r.userId === user.id);
    if (myRequests.length === 0) {
        list.innerHTML = '<p>No service records.</p>';
        return;
    }
    myRequests.reverse().forEach(req => {
        const div = document.createElement('div');
        div.className = 'tracking-item';
        div.innerHTML = `
            <div><strong>Room Number:</strong>${req.roomNumber}</div>
            <div><strong>Type:</strong>${req.serviceType}</div>
            <div><strong>Request:</strong>${req.description}</div>
            <div><strong>Expected Time:</strong>${formatDateTime(req.expectedTime)}</div>
            <div><strong>Submit Time:</strong>${formatDateTime(req.submitTime)}</div>
            <div><strong>Status:</strong><span class="status">${req.status}</span></div>
            <hr>
        `;
        list.appendChild(div);
    });
}

// Format date and time
function formatDateTime(str) {
    if (!str) return '';
    const d = new Date(str);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}
