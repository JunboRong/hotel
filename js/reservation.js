// Room type and price mapping
const roomPrices = {
    'Standard King Room': 388,
    'Standard Twin Room': 428,
    'Deluxe King Room': 688,
    'Deluxe Twin Room': 728
};

// Global variable to store booking information
let bookingInfo = {
    checkIn: '',
    checkOut: '',
    adults: 2,
    roomType: '',
    totalPrice: 0
};

// Initialize date pickers
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('checkIn').min = today.toISOString().split('T')[0];
    document.getElementById('checkIn').value = today.toISOString().split('T')[0];
    document.getElementById('checkOut').min = tomorrow.toISOString().split('T')[0];
    document.getElementById('checkOut').value = tomorrow.toISOString().split('T')[0];
    
    updateBookingSummary();
});

// Update number of guests
function updateCount(change) {
    const countElement = document.getElementById('adults-count');
    let count = parseInt(countElement.textContent);
    count = Math.max(1, Math.min(2, count + change));
    countElement.textContent = count;
    bookingInfo.adults = count;
    updateBookingSummary();
}

// Select room type
function selectRoomType(element, roomType) {
    // Remove selected state from other rooms
    document.querySelectorAll('.room-option').forEach(room => {
        room.classList.remove('selected');
    });
    
    // Add selected state
    element.classList.add('selected');
    bookingInfo.roomType = roomType;
    updateBookingSummary();
}

// Update booking summary
function updateBookingSummary() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    
    if (checkIn && checkOut) {
        const nights = calculateNights(checkIn, checkOut);
        bookingInfo.checkIn = checkIn;
        bookingInfo.checkOut = checkOut;
        
        // Update nights display
        document.querySelector('.stay-nights').textContent = `${nights} nights`;
        
        document.getElementById('summary-checkin').textContent = formatDate(checkIn);
        document.getElementById('summary-checkout').textContent = formatDate(checkOut);
        document.getElementById('summary-guests').textContent = `${bookingInfo.adults} guests`;
        document.getElementById('summary-room').textContent = bookingInfo.roomType || 'Not selected';
        
        if (bookingInfo.roomType) {
            const price = roomPrices[bookingInfo.roomType] * nights;
            bookingInfo.totalPrice = price;
            document.getElementById('summary-total').textContent = `¥${price}`;
        } else {
            document.getElementById('summary-total').textContent = '¥0';
        }
    }
}

// Calculate number of nights
function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// Submit booking
function submitBooking() {
    if (!bookingInfo.roomType) {
        alert('Please select a room type');
        return;
    }
    
    if (!bookingInfo.checkIn || !bookingInfo.checkOut) {
        alert('Please select check-in and check-out dates');
        return;
    }
    
    // Check if logged in
    if (!auth.isLoggedIn()) {
        alert('Please log in before booking');
        window.location.href = 'logIn.html';
        return;
    }
    
    // Simulate successful booking
    const bookingData = {
        ...bookingInfo,
        bookingId: generateBookingId(),
        status: 'Pending',
        createTime: new Date().toISOString()
    };
    
    // Save booking information to localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    alert('Booking successful! Please go to the expenses management page to complete the payment.');
    window.location.href = 'expenses.html';
}

// Generate booking ID
function generateBookingId() {
    return 'BK' + Date.now().toString().slice(-8);
}

// Listen for date changes
document.getElementById('checkIn').addEventListener('change', updateBookingSummary);
document.getElementById('checkOut').addEventListener('change', updateBookingSummary);
