// 预订状态管理
const bookingState = {
    checkIn: '',
    checkOut: '',
    adults: 2,
    selectedRoom: null,
    roomPrices: {
        '普通大床房': 388,
        '普通双床房': 428,
        '豪华大床房': 688,
        '豪华双床房': 728
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'logIn.html';
        return;
    }

    // 设置日期选择器的最小值为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkIn').min = today;
    document.getElementById('checkOut').min = today;

    // 加载用户的预订历史
    loadBookingHistory();
});

// 加载预订历史
function loadBookingHistory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const bookingHistory = JSON.parse(localStorage.getItem(`bookingHistory_${currentUser.id}`)) || [];
    
    // 更新预订历史显示
    updateBookingHistoryDisplay(bookingHistory);
}

// 更新预订历史显示
function updateBookingHistoryDisplay(history) {
    const historyContainer = document.getElementById('bookingHistory');
    if (!historyContainer) return;

    historyContainer.innerHTML = '';
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">暂无预订记录</p>';
        return;
    }

    history.forEach(booking => {
        const bookingElement = document.createElement('div');
        bookingElement.className = 'booking-item';
        bookingElement.innerHTML = `
            <div class="booking-info">
                <h3>${booking.roomType}</h3>
                <p>入住日期：${formatDate(booking.checkIn)}</p>
                <p>退房日期：${formatDate(booking.checkOut)}</p>
                <p>入住人数：${booking.adults}人</p>
                <p>总价：¥${booking.totalPrice}</p>
                <p>状态：${booking.status}</p>
            </div>
        `;
        historyContainer.appendChild(bookingElement);
    });
}

// 更新计数器显示
function updateCount(change) {
    const count = document.getElementById('adults-count');
    let currentValue = parseInt(count.textContent);
    let newValue = currentValue + change;

    // 设置限制
    newValue = Math.max(1, Math.min(newValue, 2)); // 成人数量限制在1-2之间

    count.textContent = newValue;
    bookingState.adults = newValue;
    updateSummary();
}

// 更新按钮状态
function updateButtonStates() {
    const adultsCount = parseInt(document.getElementById('adults-count').textContent);
    const minusBtn = document.querySelector('.minus');
    const plusBtn = document.querySelector('.plus');
    
    minusBtn.classList.toggle('disabled', adultsCount <= 1);
    plusBtn.classList.toggle('disabled', adultsCount >= 2);
}

// 选择房间类型
function selectRoomType(element, roomType) {
    // 移除其他房间的选中状态
    document.querySelectorAll('.room-option').forEach(room => {
        room.classList.remove('selected');
    });
    
    // 添加当前房间的选中状态
    element.classList.add('selected');
    
    // 更新预订状态
    bookingState.selectedRoom = roomType;
    
    // 更新摘要
    updateSummary();
}

// 更新预订摘要
function updateSummary() {
    // 更新日期
    document.getElementById('summary-checkin').textContent = formatDate(bookingState.checkIn);
    document.getElementById('summary-checkout').textContent = formatDate(bookingState.checkOut);
    
    // 更新人数
    document.getElementById('summary-guests').textContent = `${bookingState.adults}人`;
    
    // 更新房间类型
    document.getElementById('summary-room').textContent = bookingState.selectedRoom || '未选择';
    
    // 计算并更新总价
    if (bookingState.selectedRoom) {
        const nights = calculateNights();
        const price = bookingState.roomPrices[bookingState.selectedRoom];
        const total = nights * price;
        document.getElementById('summary-total').textContent = `¥${total}`;
    } else {
        document.getElementById('summary-total').textContent = '¥0';
    }
}

// 计算入住天数
function calculateNights() {
    if (!bookingState.checkIn || !bookingState.checkOut) return 0;
    
    const checkIn = new Date(bookingState.checkIn);
    const checkOut = new Date(bookingState.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '未选择';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 更新晚数显示
function updateNightsDisplay() {
    const nights = calculateNights();
    document.querySelector('.stay-nights').textContent = `${nights}晚`;
}

// 初始化日期选择器
function initializeDatePickers() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkIn = document.getElementById('checkIn');
    const checkOut = document.getElementById('checkOut');

    // 设置最小日期为今天
    checkIn.min = today.toISOString().split('T')[0];
    checkOut.min = tomorrow.toISOString().split('T')[0];

    // 设置默认值
    checkIn.value = today.toISOString().split('T')[0];
    checkOut.value = tomorrow.toISOString().split('T')[0];
    
    // 更新状态
    bookingState.checkIn = checkIn.value;
    bookingState.checkOut = checkOut.value;

    // 监听日期变化
    checkIn.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // 更新退房日期最小值和当前值
        checkOut.min = nextDay.toISOString().split('T')[0];
        if (new Date(checkOut.value) <= selectedDate) {
            checkOut.value = nextDay.toISOString().split('T')[0];
        }
        
        // 更新状态
        bookingState.checkIn = this.value;
        bookingState.checkOut = checkOut.value;
        
        // 更新晚数显示
        updateNightsDisplay();
        
        // 更新摘要
        updateSummary();
    });
    
    checkOut.addEventListener('change', function() {
        bookingState.checkOut = this.value;
        // 更新晚数显示
        updateNightsDisplay();
        updateSummary();
    });
}

// 提交预订
async function submitBooking() {
    // 验证必填信息
    if (!bookingState.checkIn || !bookingState.checkOut || !bookingState.selectedRoom) {
        alert('请填写完整的预订信息');
        return;
    }

    // 验证日期
    const checkIn = new Date(bookingState.checkIn);
    const checkOut = new Date(bookingState.checkOut);
    if (checkIn >= checkOut) {
        alert('退房日期必须晚于入住日期');
        return;
    }

    // 获取当前用户
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'logIn.html';
        return;
    }

    // 创建预订记录
    const booking = {
        id: Date.now().toString(),
        userId: currentUser.id,
        roomType: bookingState.selectedRoom,
        checkIn: bookingState.checkIn,
        checkOut: bookingState.checkOut,
        adults: bookingState.adults,
        totalPrice: bookingState.roomPrices[bookingState.selectedRoom] * calculateNights(),
        status: '已确认',
        createTime: new Date().toISOString()
    };

    // 保存预订记录
    const bookingHistory = JSON.parse(localStorage.getItem(`bookingHistory_${currentUser.id}`)) || [];
    bookingHistory.push(booking);
    localStorage.setItem(`bookingHistory_${currentUser.id}`, JSON.stringify(bookingHistory));

    // 添加到费用系统
    const roomData = {
        type: booking.roomType,
        nights: calculateNights(),
        price: bookingState.roomPrices[bookingState.selectedRoom],
        roomNumber: generateRoomNumber() // 生成随机房间号
    };
    
    // 调用费用管理器添加房费
    if (typeof expenseManager !== 'undefined') {
        expenseManager.addRoomCharge(roomData);
    }

    // 显示成功消息
    alert('预订成功！');
    
    // 重置表单
    resetBookingForm();
    
    // 更新预订历史显示
    updateBookingHistoryDisplay(bookingHistory);
}

// 生成随机房间号
function generateRoomNumber() {
    return Math.floor(Math.random() * 900 + 100).toString(); // 生成3位随机数
}

// 重置预订表单
function resetBookingForm() {
    bookingState.checkIn = '';
    bookingState.checkOut = '';
    bookingState.adults = 2;
    bookingState.selectedRoom = null;
    
    document.getElementById('checkIn').value = '';
    document.getElementById('checkOut').value = '';
    document.getElementById('adults-count').textContent = '2';
    document.querySelectorAll('.room-option').forEach(room => {
        room.classList.remove('selected');
    });
    
    updateSummary();
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeDatePickers();
    updateButtonStates();
    updateSummary();
});
