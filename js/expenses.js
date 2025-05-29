// Global variables
let selectedPaymentMethod = null;
let expenses = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    if (!auth.isLoggedIn()) {
        alert('Please log in first');
        window.location.href = '../frontend/logIn.html';
        return;
    }

    // Load expense data
    loadExpenses();
    
    // Set default values for date pickers
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    document.getElementById('startDate').value = lastMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    
    // Add event listeners
    document.getElementById('typeFilter').addEventListener('change', filterExpenses);
    document.getElementById('statusFilter').addEventListener('change', filterExpenses);
    document.getElementById('startDate').addEventListener('change', filterExpenses);
    document.getElementById('endDate').addEventListener('change', filterExpenses);

    // Initialize expense summary to zero
    resetSummary();
});

// Load expense data
function loadExpenses() {
    // Get booking data from localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Convert booking data to expense data
    expenses = bookings.map(booking => ({
        id: booking.bookingId,
        date: booking.createTime,
        item: booking.roomType,
        type: 'Room Fee',
        quantity: calculateNights(booking.checkIn, booking.checkOut),
        unitPrice: getRoomPrice(booking.roomType),
        amount: booking.totalPrice,
        status: booking.status
    }));
    
    // Display expense data
    displayExpenses(expenses);
    updateSummary();
}

// Display expense data
function displayExpenses(expensesToShow) {
    const tbody = document.getElementById('expensesTableBody');
    tbody.innerHTML = '';
    const discountRate = 0.05;
    expensesToShow.forEach((expense, idx) => {
        let payAmount = expense.amount;
        if (expense.type === 'Room Fee') {
            payAmount = (expense.amount * (1 - discountRate)).toFixed(2);
        }
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${expense.item}</td>
            <td>${expense.type}</td>
            <td>¥${expense.amount}</td>
            <td>¥${payAmount}</td>
            <td>${expense.status}</td>
        `;
        // Only allow clicking on pending payment rows
        if (expense.status === 'Pending') {
            row.style.cursor = 'pointer';
            row.addEventListener('click', function() {
                showSummaryForExpense(expense);
                // Record the currently selected pending payment order
                window.selectedExpenseForPay = expense;
            });
        }
        tbody.appendChild(row);
    });
}

// Display expense summary for a specific order on the right
function showSummaryForExpense(expense) {
    const discountRate = 0.05;
    let discount = 0;
    let grandTotal = expense.amount;
    if (expense.type === 'Room Fee') {
        discount = (expense.amount * discountRate).toFixed(2);
        grandTotal = (expense.amount - discount).toFixed(2);
    }
    document.getElementById('roomTotal').textContent = expense.type === 'Room Fee' ? `¥${expense.amount}` : '¥0.00';
    document.getElementById('diningTotal').textContent = expense.type === 'Dining' ? `¥${expense.amount}` : '¥0.00';
    document.getElementById('serviceTotal').textContent = expense.type === 'Service' ? `¥${expense.amount}` : '¥0.00';
    document.getElementById('discountAmount').textContent = expense.type === 'Room Fee' ? `-¥${discount}` : '-¥0.00';
    document.getElementById('grandTotal').textContent = `¥${grandTotal}`;
}

// Reset expense summary to zero
function resetSummary() {
    document.getElementById('roomTotal').textContent = '¥0.00';
    document.getElementById('diningTotal').textContent = '¥0.00';
    document.getElementById('serviceTotal').textContent = '¥0.00';
    document.getElementById('discountAmount').textContent = '-¥0.00';
    document.getElementById('grandTotal').textContent = '¥0.00';
    window.selectedExpenseForPay = null;
}

// Update expense summary
function updateSummary() {
    const roomTotal = expenses
        .filter(e => e.type === 'Room Fee')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const diningTotal = expenses
        .filter(e => e.type === 'Dining')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const serviceTotal = expenses
        .filter(e => e.type === 'Service')
        .reduce((sum, e) => sum + e.amount, 0);
    
    // Calculate member discount (example: 95% off)
    const discount = ((roomTotal + diningTotal + serviceTotal) * 0.05).toFixed(2);
    const grandTotal = (roomTotal + diningTotal + serviceTotal - discount).toFixed(2);
    
    document.getElementById('roomTotal').textContent = `¥${roomTotal}`;
    document.getElementById('diningTotal').textContent = `¥${diningTotal}`;
    document.getElementById('serviceTotal').textContent = `¥${serviceTotal}`;
    document.getElementById('discountAmount').textContent = `-¥${discount}`;
    document.getElementById('grandTotal').textContent = `¥${grandTotal}`;
}

// Filter expenses
function filterExpenses() {
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    
    let filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const typeMatch = typeFilter === 'all' || expense.type === typeFilter;
        const statusMatch = statusFilter === 'all' || expense.status === statusFilter;
        const dateMatch = expenseDate >= startDate && expenseDate <= endDate;
        
        return typeMatch && statusMatch && dateMatch;
    });
    
    displayExpenses(filteredExpenses);
}

// Select payment method
function selectPayment(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-key="${method}"]`).classList.add('selected');
    
    // Enable payment button
    document.querySelector('.pay-btn').disabled = false;
}

// Handle payment
function handlePayment() {
    if (!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
    }
    // Only pay for the currently selected pending payment order
    const expense = window.selectedExpenseForPay;
    if (!expense || expense.status !== 'Pending') {
        alert('Please click on a pending payment order first');
        return;
    }
    // Simulate payment process
    alert(`Processing payment with ${selectedPaymentMethod}...`);
    // Update expense status
    expense.status = 'Paid';
    // Update booking status in localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.forEach(booking => {
        if (booking.bookingId === expense.id) {
            booking.status = 'Paid';
        }
    });
    localStorage.setItem('bookings', JSON.stringify(bookings));
    // Refresh display
    loadExpenses();
    // Reset expense summary to zero after payment
    resetSummary();
    alert('Payment successful!');
}

// Helper functions
function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getRoomPrice(roomType) {
    const prices = {
        'Standard King Room': 388,
        'Standard Twin Room': 428,
        'Deluxe King Room': 688,
        'Deluxe Twin Room': 728
    };
    return prices[roomType] || 0;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
