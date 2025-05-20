// 房间类型和价格映射
const roomPrices = {
    '普通大床房': 388,
    '普通双床房': 428,
    '豪华大床房': 688,
    '豪华双床房': 728
};

// 全局变量存储预订信息
let bookingInfo = {
    checkIn: '',
    checkOut: '',
    adults: 2,
    roomType: '',
    totalPrice: 0
};

// 初始化日期选择器
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

// 更新入住人数
function updateCount(change) {
    const countElement = document.getElementById('adults-count');
    let count = parseInt(countElement.textContent);
    count = Math.max(1, Math.min(2, count + change));
    countElement.textContent = count;
    bookingInfo.adults = count;
    updateBookingSummary();
}

// 选择房间类型
function selectRoomType(element, roomType) {
    // 移除其他房间的选中状态
    document.querySelectorAll('.room-option').forEach(room => {
        room.classList.remove('selected');
    });
    
    // 添加选中状态
    element.classList.add('selected');
    bookingInfo.roomType = roomType;
    updateBookingSummary();
}

// 更新预订摘要
function updateBookingSummary() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    
    if (checkIn && checkOut) {
        const nights = calculateNights(checkIn, checkOut);
        bookingInfo.checkIn = checkIn;
        bookingInfo.checkOut = checkOut;
        
        // 更新晚数显示
        document.querySelector('.stay-nights').textContent = `${nights}晚`;
        
        document.getElementById('summary-checkin').textContent = formatDate(checkIn);
        document.getElementById('summary-checkout').textContent = formatDate(checkOut);
        document.getElementById('summary-guests').textContent = `${bookingInfo.adults}人`;
        document.getElementById('summary-room').textContent = bookingInfo.roomType || '未选择';
        
        if (bookingInfo.roomType) {
            const price = roomPrices[bookingInfo.roomType] * nights;
            bookingInfo.totalPrice = price;
            document.getElementById('summary-total').textContent = `¥${price}`;
        } else {
            document.getElementById('summary-total').textContent = '¥0';
        }
    }
}

// 计算入住天数
function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 提交预订
function submitBooking() {
    if (!bookingInfo.roomType) {
        alert('请选择房间类型');
        return;
    }
    
    if (!bookingInfo.checkIn || !bookingInfo.checkOut) {
        alert('请选择入住和退房日期');
        return;
    }
    
    // 检查是否登录
    if (!auth.isLoggedIn()) {
        alert('请先登录后再预订');
        window.location.href = 'logIn.html';
        return;
    }
    
    // 模拟预订成功
    const bookingData = {
        ...bookingInfo,
        bookingId: generateBookingId(),
        status: '待支付',
        createTime: new Date().toISOString()
    };
    
    // 保存预订信息到localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    alert('预订成功！请前往费用管理页面完成支付。');
    window.location.href = 'expenses.html';
}

// 生成预订ID
function generateBookingId() {
    return 'BK' + Date.now().toString().slice(-8);
}

// 监听日期变化
document.getElementById('checkIn').addEventListener('change', updateBookingSummary);
document.getElementById('checkOut').addEventListener('change', updateBookingSummary);
