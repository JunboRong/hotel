// Global variables
let currentCustomer = null;
let selectedRating = 0;

// Membership level configuration
const membershipLevels = {
    'bronze': {
        name: 'Bronze Member',
        benefits: ['Birthday Voucher', 'Points Exchange']
    },
    'silver': {
        name: 'Silver Member',
        benefits: ['Birthday Voucher', 'Points Exchange', 'Free Breakfast', 'Late Checkout']
    },
    'gold': {
        name: 'Gold Member',
        benefits: ['Birthday Voucher', 'Points Exchange', 'Free Breakfast', 'Late Checkout', 'VIP Exclusive Channel', 'Free Room Upgrade']
    },
    'platinum': {
        name: 'Platinum Member',
        benefits: ['Birthday Voucher', 'Points Exchange', 'Free Breakfast', 'Late Checkout', 'VIP Exclusive Channel', 'Free Room Upgrade', 'Exclusive Butler Service', 'Airport Transfer']
    }
};

// Feedback categories
const feedbackCategories = [
    'Room Cleaning',
    'Service Attitude',
    'Facilities',
    'Dining Service',
    'Stay Experience',
    'Other'
];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
        window.location.href = 'logIn.html';
        return;
    }
    
    try {
        // Get current user data
        currentCustomer = JSON.parse(currentUserStr);
        
        // If user has no feedback records, initialize an empty array
        if (!currentCustomer.feedback) {
            currentCustomer.feedback = [];
        }
        
        // If user has no stay records, initialize an empty array
        if (!currentCustomer.stayHistory) {
            currentCustomer.stayHistory = [];
        }
        
        // Initialize feedback categories
        initializeFeedbackCategories(feedbackCategories);
        
        // Display user details
        showCustomerDetails(currentCustomer);
    } catch (error) {
        console.error('Failed to load data:', error);
        alert('Failed to load data, please refresh the page and try again');
    }
});

// Display customer details
function showCustomerDetails(customer) {
    // Update membership information
    const membershipInfo = membershipLevels[customer.membershipLevel];
    document.getElementById('membershipLevel').textContent = membershipInfo.name;
    document.getElementById('memberPoints').textContent = customer.points;

    // Update membership benefits
    const benefitsContainer = document.getElementById('membershipBenefits');
    benefitsContainer.innerHTML = membershipInfo.benefits.map(benefit => 
        `<span class="benefit-tag">${benefit}</span>`
    ).join('');

    // Update basic information
    document.getElementById('customerName').textContent = customer.name;
    document.getElementById('customerPhone').textContent = customer.phone;
    document.getElementById('customerEmail').textContent = customer.email;
    document.getElementById('registrationDate').textContent = formatDate(customer.registrationDate);

    // Update personal preferences
    document.getElementById('preferredRoomType').textContent = getRoomTypeName(customer.preferences.roomType);
    document.getElementById('floorPreference').textContent = getFloorPreference(customer.preferences.floorPreference);
    document.getElementById('smokingPreference').textContent = customer.preferences.smokingPreference ? 'Yes' : 'No';
    document.getElementById('dietaryRestrictions').textContent = customer.preferences.dietaryRestrictions.length > 0 
        ? customer.preferences.dietaryRestrictions.join(', ') 
        : 'None';
    document.getElementById('specialRequests').textContent = customer.preferences.specialRequests || 'None';

    // Update stay history
    updateStayHistory(customer.stayHistory);

    // Update feedback list
    updateFeedbackList(customer.feedback);
}

// Update stay history
function updateStayHistory(history) {
    const historyBody = document.getElementById('stayHistoryBody');
    historyBody.innerHTML = '';

    if (history && history.length > 0) {
        history.forEach(stay => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(stay.checkIn)}</td>
                <td>${formatDate(stay.checkOut)}</td>
                <td>${stay.roomNumber}</td>
                <td>${getRoomTypeName(stay.roomType)}</td>
                <td>¥${stay.totalSpent.toFixed(2)}</td>
                <td>${stay.pointsEarned}</td>
            `;
            historyBody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center;">No stay records</td>';
        historyBody.appendChild(row);
    }
}

// Update feedback list
function updateFeedbackList(feedbackList) {
    const feedbackContainer = document.getElementById('feedbackList');
    feedbackContainer.innerHTML = '';

    if (feedbackList && feedbackList.length > 0) {
        feedbackList.forEach(feedback => {
            const feedbackItem = document.createElement('div');
            feedbackItem.className = 'feedback-item';
            feedbackItem.innerHTML = `
                <div class="feedback-header">
                    <span>${formatDate(feedback.date)} - ${feedback.category}</span>
                    <span class="rating">${'★'.repeat(feedback.rating)}${'☆'.repeat(5-feedback.rating)}</span>
                </div>
                <div class="feedback-content">${feedback.comment}</div>
            `;
            feedbackContainer.appendChild(feedbackItem);
        });
    } else {
        feedbackContainer.innerHTML = '<div class="feedback-item">No feedback records</div>';
    }
}

// Initialize feedback categories
function initializeFeedbackCategories(categories) {
    const categorySelect = document.getElementById('feedbackCategory');
    categorySelect.innerHTML = '<option value="">Please select a category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Switch tabs
function switchTab(tabName) {
    // Update button state
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
        if (button.textContent.toLowerCase().includes(tabName)) {
            button.classList.add('active');
        }
    });

    // Update content display
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`${tabName}Tab`).style.display = 'block';
}

// Set rating
function setRating(rating) {
    selectedRating = rating;
    document.querySelectorAll('.rating-input button').forEach((button, index) => {
        button.classList.toggle('selected', index < rating);
    });
}

// Submit feedback
function submitFeedback() {
    if (!selectedRating) {
        alert('Please select a rating');
        return;
    }

    const category = document.getElementById('feedbackCategory').value;
    if (!category) {
        alert('Please select a feedback category');
        return;
    }

    const content = document.getElementById('feedbackContent').value.trim();
    if (!content) {
        alert('Please enter feedback content');
        return;
    }

    // Create new feedback
    const newFeedback = {
        date: new Date().toISOString().split('T')[0],
        rating: selectedRating,
        category: category,
        comment: content
    };

    // Add to current customer's feedback list
    if (!currentCustomer.feedback) {
        currentCustomer.feedback = [];
    }
    currentCustomer.feedback.unshift(newFeedback);

    // Update user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentCustomer));

    // Update display
    updateFeedbackList(currentCustomer.feedback);

    // Reset form
    resetFeedbackForm();

    alert('Feedback submitted successfully!');
}

// Reset feedback form
function resetFeedbackForm() {
    selectedRating = 0;
    document.querySelectorAll('.rating-input button').forEach(button => {
        button.classList.remove('selected');
    });
    document.getElementById('feedbackCategory').value = '';
    document.getElementById('feedbackContent').value = '';
}

// Edit customer information
function editCustomer() {
    // Show edit input fields
    document.querySelectorAll('.edit-input').forEach(input => {
        input.style.display = 'block';
    });
    
    // Hide display text
    document.querySelectorAll('.customer-info span').forEach(span => {
        span.style.display = 'none';
    });
    
    // Show edit button group
    document.querySelector('.edit-buttons').style.display = 'block';
    
    // Hide edit info button
    document.querySelector('.details-header .secondary-button').style.display = 'none';
    
    // Fill current values into input fields
    document.getElementById('editName').value = currentCustomer.name;
    document.getElementById('editPhone').value = currentCustomer.phone;
    document.getElementById('editEmail').value = currentCustomer.email;
}

// Save customer information
function saveCustomerInfo() {
    // Get input values
    const newName = document.getElementById('editName').value.trim();
    const newPhone = document.getElementById('editPhone').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();
    
    // Validate input
    if (!newName || !newPhone || !newEmail) {
        alert('Please fill in all required information');
        return;
    }
    
    // Validate phone number format
    if (!/^1[3-9]\d{9}$/.test(newPhone)) {
        alert('Please enter a valid phone number');
        return;
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Update customer information
    currentCustomer.name = newName;
    currentCustomer.phone = newPhone;
    currentCustomer.email = newEmail;
    
    // Update localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentCustomer));
    
    // Update display
    showCustomerDetails(currentCustomer);
    
    // Exit edit mode
    cancelEdit();
    
    alert('Information updated successfully!');
}

// Cancel edit
function cancelEdit() {
    // Hide edit input fields
    document.querySelectorAll('.edit-input').forEach(input => {
        input.style.display = 'none';
    });
    
    // Show text
    document.querySelectorAll('.customer-info span').forEach(span => {
        span.style.display = 'block';
    });
    
    // Hide edit button group
    document.querySelector('.edit-buttons').style.display = 'none';
    
    // Show edit info button
    document.querySelector('.details-header .secondary-button').style.display = 'block';
}

// Get room type name
function getRoomTypeName(roomType) {
    const roomTypes = {
        'standard_single': 'Standard Single Room',
        'standard_double': 'Standard Twin Room',
        'deluxe_single': 'Deluxe King Room',
        'deluxe_double': 'Deluxe Twin Room'
    };
    return roomTypes[roomType] || roomType;
}

// Get floor preference description
function getFloorPreference(preference) {
    const preferences = {
        'high': 'High Floor',
        'middle': 'Middle Floor',
        'low': 'Low Floor'
    };
    return preferences[preference] || preference;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
} 