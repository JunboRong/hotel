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

// 计算入住晚数
function calculateNights() {
    if (!bookingState.checkIn || !bookingState.checkOut) return 0;
    const checkIn = new Date(bookingState.checkIn);
    const checkOut = new Date(bookingState.checkOut);
    return Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
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
function submitBooking() {
    if (!bookingState.selectedRoom) {
        alert('请选择客房类型');
        return;
    }
    
    // 这里可以添加提交预订的逻辑
    console.log('提交预订信息：', bookingState);
    alert('预订成功！');
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeDatePickers();
    updateButtonStates();
    updateSummary();
});
