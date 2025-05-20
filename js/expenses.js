// 全局变量
let selectedPaymentMethod = null;
let expenses = [];

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!auth.isLoggedIn()) {
        alert('请先登录');
        window.location.href = '../frontend/logIn.html';
        return;
    }

    // 加载费用数据
    loadExpenses();
    
    // 设置日期选择器的默认值
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    document.getElementById('startDate').value = lastMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    
    // 添加事件监听器
    document.getElementById('typeFilter').addEventListener('change', filterExpenses);
    document.getElementById('statusFilter').addEventListener('change', filterExpenses);
    document.getElementById('startDate').addEventListener('change', filterExpenses);
    document.getElementById('endDate').addEventListener('change', filterExpenses);

    // 初始化费用总览为零
    resetSummary();
});

// 加载费用数据
function loadExpenses() {
    // 从localStorage获取预订数据
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // 转换预订数据为费用数据
    expenses = bookings.map(booking => ({
        id: booking.bookingId,
        date: booking.createTime,
        item: booking.roomType,
        type: '房费',
        quantity: calculateNights(booking.checkIn, booking.checkOut),
        unitPrice: getRoomPrice(booking.roomType),
        amount: booking.totalPrice,
        status: booking.status
    }));
    
    // 显示费用数据
    displayExpenses(expenses);
    updateSummary();
}

// 显示费用数据
function displayExpenses(expensesToShow) {
    const tbody = document.getElementById('expensesTableBody');
    tbody.innerHTML = '';
    const discountRate = 0.05;
    expensesToShow.forEach((expense, idx) => {
        let payAmount = expense.amount;
        if (expense.type === '房费') {
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
        // 只允许点击待支付的行
        if (expense.status === '待支付') {
            row.style.cursor = 'pointer';
            row.addEventListener('click', function() {
                showSummaryForExpense(expense);
                // 记录当前选中的待支付订单
                window.selectedExpenseForPay = expense;
            });
        }
        tbody.appendChild(row);
    });
}

// 显示某条订单的费用到右侧
function showSummaryForExpense(expense) {
    const discountRate = 0.05;
    let discount = 0;
    let grandTotal = expense.amount;
    if (expense.type === '房费') {
        discount = (expense.amount * discountRate).toFixed(2);
        grandTotal = (expense.amount - discount).toFixed(2);
    }
    document.getElementById('roomTotal').textContent = expense.type === '房费' ? `¥${expense.amount}` : '¥0.00';
    document.getElementById('diningTotal').textContent = expense.type === '餐饮' ? `¥${expense.amount}` : '¥0.00';
    document.getElementById('serviceTotal').textContent = expense.type === '服务' ? `¥${expense.amount}` : '¥0.00';
    document.getElementById('discountAmount').textContent = expense.type === '房费' ? `-¥${discount}` : '-¥0.00';
    document.getElementById('grandTotal').textContent = `¥${grandTotal}`;
}

// 重置费用总览为零
function resetSummary() {
    document.getElementById('roomTotal').textContent = '¥0.00';
    document.getElementById('diningTotal').textContent = '¥0.00';
    document.getElementById('serviceTotal').textContent = '¥0.00';
    document.getElementById('discountAmount').textContent = '-¥0.00';
    document.getElementById('grandTotal').textContent = '¥0.00';
    window.selectedExpenseForPay = null;
}

// 更新费用汇总
function updateSummary() {
    const roomTotal = expenses
        .filter(e => e.type === '房费')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const diningTotal = expenses
        .filter(e => e.type === '餐饮')
        .reduce((sum, e) => sum + e.amount, 0);
    
    const serviceTotal = expenses
        .filter(e => e.type === '服务')
        .reduce((sum, e) => sum + e.amount, 0);
    
    // 计算会员折扣（示例：95折）
    const discount = ((roomTotal + diningTotal + serviceTotal) * 0.05).toFixed(2);
    const grandTotal = (roomTotal + diningTotal + serviceTotal - discount).toFixed(2);
    
    document.getElementById('roomTotal').textContent = `¥${roomTotal}`;
    document.getElementById('diningTotal').textContent = `¥${diningTotal}`;
    document.getElementById('serviceTotal').textContent = `¥${serviceTotal}`;
    document.getElementById('discountAmount').textContent = `-¥${discount}`;
    document.getElementById('grandTotal').textContent = `¥${grandTotal}`;
}

// 筛选费用
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

// 选择支付方式
function selectPayment(method) {
    selectedPaymentMethod = method;
    
    // 更新UI
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-key="${method}"]`).classList.add('selected');
    
    // 启用支付按钮
    document.querySelector('.pay-btn').disabled = false;
}

// 处理支付
function handlePayment() {
    if (!selectedPaymentMethod) {
        alert('请选择支付方式');
        return;
    }
    // 只支付当前选中的待支付订单
    const expense = window.selectedExpenseForPay;
    if (!expense || expense.status !== '待支付') {
        alert('请先点击左侧待支付的订单');
        return;
    }
    // 模拟支付过程
    alert(`正在使用${selectedPaymentMethod}支付...`);
    // 更新费用状态
    expense.status = '已支付';
    // 更新localStorage中的预订状态
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.forEach(booking => {
        if (booking.bookingId === expense.id) {
            booking.status = '已支付';
        }
    });
    localStorage.setItem('bookings', JSON.stringify(bookings));
    // 刷新显示
    loadExpenses();
    // 支付完成后，费用总汇内容全部初始化为零
    resetSummary();
    alert('支付成功！');
}

// 辅助函数
function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getRoomPrice(roomType) {
    const prices = {
        '普通大床房': 388,
        '普通双床房': 428,
        '豪华大床房': 688,
        '豪华双床房': 728
    };
    return prices[roomType] || 0;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
