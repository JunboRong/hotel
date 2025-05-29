// Fetch member data
async function fetchCustomers() {
    try {
        const response = await fetch('../data/customers.json');
        const data = await response.json();
        return data.mockCustomers || [];
    } catch (error) {
        console.error('Failed to fetch member data:', error);
        return [];
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadMemberData();
        initializeEventListeners();
        console.log('Page initialization complete');
    } catch (error) {
        console.error('Page initialization failed:', error);
    }
});

// Load member data
function createMemberRow(customer) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${customer.id}</td>
        <td>${customer.name}</td>
        <td>${customer.phone}</td>
        <td>${customer.membershipLevel}</td>
        <td>${customer.points}</td>
        <td>${customer.registrationDate}</td>
        <td>
            <button class="action-btn edit-btn" data-id="${customer.id}">Edit</button>
            <button class="action-btn delete-btn" data-id="${customer.id}">Delete</button>
            <button class="action-btn detail-btn" data-id="${customer.id}">Details</button>
        </td>
    `;
    return tr;
}

async function loadMemberData(customers) {
    const tbody = document.querySelector('.member-table tbody');
    tbody.innerHTML = '';
    (customers || await fetchCustomers()).forEach(customer => {
        tbody.appendChild(createMemberRow(customer));
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    document.getElementById('searchBtn').addEventListener('click', async () => {
        const searchTerm = searchInput.value.toLowerCase();
        const customers = await fetchCustomers();
        const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.phone.includes(searchTerm) ||
            customer.id.toLowerCase().includes(searchTerm)
        );
        loadMemberData(filtered);
    });

    // Add member button
    document.getElementById('addMemberBtn').addEventListener('click', () => {
        document.getElementById('addMemberModal').style.display = 'flex';
    });

    // Table operation event delegation
    document.querySelector('.member-table').addEventListener('click', async (e) => {
        const customerId = e.target.dataset.id;
        if (!customerId) return;

        const customers = await fetchCustomers();
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;

        if (e.target.classList.contains('edit-btn')) {
            showEditMemberModal(customer);
        } else if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this member?')) await deleteMember(customerId);
        } else if (e.target.classList.contains('detail-btn')) {
            showCustomerDetails(customer);
        }
    });

    // Add member form submission
    const addMemberForm = document.getElementById('addMemberForm');
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Add member form submitted');
            const newMember = {
                id: generateMemberId(),
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                birthDate: document.getElementById('birthDate').value,
                membershipLevel: document.getElementById('membershipLevel').value,
                points: 0,
                registrationDate: new Date().toISOString().split('T')[0],
                preferences: {
                    roomType: '',
                    floorPreference: '',
                    smokingPreference: false,
                    dietaryRestrictions: [],
                    specialRequests: ''
                },
                stayHistory: [],
                feedback: []
            };

            await addMember(newMember);
            closeModal('addMemberModal');
            e.target.reset();
        });
    } else {
        console.error('Add member form not found');
    }

    // Edit member form submission
    const editMemberForm = document.getElementById('editMemberForm');
    if (editMemberForm) {
        editMemberForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Edit member form submitted');
            const customerId = e.target.dataset.customerId;
            const customers = await fetchCustomers();
            const customer = customers.find(c => c.id === customerId);

            if (customer) {
                const updatedMember = {
                    ...customer,
                    name: document.getElementById('editName').value,
                    phone: document.getElementById('editPhone').value,
                    email: document.getElementById('editEmail').value,
                    birthDate: document.getElementById('editBirthDate').value,
                    membershipLevel: document.getElementById('editMembershipLevel').value,
                    points: parseInt(document.getElementById('editPoints').value)
                };

                await updateMember(updatedMember);
                closeModal('editMemberModal');
            }
        });
    } else {
        console.error('Edit member form not found');
    }

    console.log('Event listeners initialized');
}

// Show edit member modal
function showEditMemberModal(customer) {
    document.getElementById('editName').value = customer.name;
    document.getElementById('editPhone').value = customer.phone;
    document.getElementById('editEmail').value = customer.email;
    document.getElementById('editBirthDate').value = customer.birthDate;
    document.getElementById('editMembershipLevel').value = customer.membershipLevel;
    document.getElementById('editPoints').value = customer.points;
    document.getElementById('editMemberForm').dataset.customerId = customer.id;
    document.getElementById('editMemberModal').style.display = 'flex';
}

// Show customer details
function showCustomerDetails(customer) {
    // Basic information
    document.getElementById('detailId').textContent = customer.id;
    document.getElementById('detailName').textContent = customer.name;
    document.getElementById('detailPhone').textContent = customer.phone;
    document.getElementById('detailEmail').textContent = customer.email;
    document.getElementById('detailBirthDate').textContent = customer.birthDate;
    document.getElementById('detailMembershipLevel').textContent = customer.membershipLevel;
    document.getElementById('detailPoints').textContent = customer.points;
    document.getElementById('detailRegistrationDate').textContent = customer.registrationDate;

    // Preferences
    document.getElementById('detailRoomType').textContent = customer.preferences.roomType || 'None';
    document.getElementById('detailFloorPreference').textContent = customer.preferences.floorPreference || 'None';
    document.getElementById('detailSmokingPreference').textContent = customer.preferences.smokingPreference ? 'Yes' : 'No';
    document.getElementById('detailDietaryRestrictions').textContent = customer.preferences.dietaryRestrictions.join(', ') || 'None';
    document.getElementById('detailSpecialRequests').textContent = customer.preferences.specialRequests || 'None';

    // Stay history
    const stayHistoryHtml = customer.stayHistory.map(stay => `
        <tr>
            <td>${stay.checkIn}</td>
            <td>${stay.checkOut}</td>
            <td>${stay.roomNumber}</td>
            <td>${stay.roomType}</td>
            <td>¥${stay.totalSpent}</td>
            <td>${stay.pointsEarned}</td>
        </tr>
    `).join('');
    document.getElementById('detailStayHistory').innerHTML = stayHistoryHtml;

    // Feedback
    const feedbackHtml = customer.feedback.map(fb => `
        <div class="feedback-item">
            <p><strong>Date:</strong>${fb.date}</p>
            <p><strong>Rating:</strong>${'★'.repeat(fb.rating)}${'☆'.repeat(5-fb.rating)}</p>
            <p><strong>Category:</strong>${fb.category}</p>
            <p><strong>Comment:</strong>${fb.comment}</p>
        </div>
    `).join('');
    document.getElementById('detailFeedback').innerHTML = feedbackHtml;

    document.getElementById('memberDetailModal').style.display = 'flex';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Generate member ID
function generateMemberId() {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const lastId = customers.length > 0 ?
        Math.max(...customers.map(c => parseInt(c.id.substring(1)))) : 0;
    return `C${String(lastId + 1).padStart(3, '0')}`;
}

// Add member
async function addMember(newMember) {
    try {
        const customers = await fetchCustomers();
        customers.push(newMember);
        localStorage.setItem('customers', JSON.stringify(customers));
        await loadMemberData();
        alert('Member added successfully!');
    } catch (error) {
        console.error('Failed to add member:', error);
        alert('Failed to add member, please try again!');
    }
}

// Update member
async function updateMember(updatedMember) {
    try {
        const customers = await fetchCustomers();
        const index = customers.findIndex(c => c.id === updatedMember.id);
        if (index !== -1) {
            customers[index] = updatedMember;
            localStorage.setItem('customers', JSON.stringify(customers));
            await loadMemberData();
            alert('Member information updated successfully!');
        }
    } catch (error) {
        console.error('Failed to update member:', error);
        alert('Failed to update member, please try again!');
    }
}

// Delete member
async function deleteMember(memberId) {
    try {
        const customers = await fetchCustomers();
        const filteredCustomers = customers.filter(c => c.id !== memberId);
        localStorage.setItem('customers', JSON.stringify(filteredCustomers));
        await loadMemberData();
        alert('Member deleted successfully!');
    } catch (error) {
        console.error('Failed to delete member:', error);
        alert('Failed to delete member, please try again!');
    }
}