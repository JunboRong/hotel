// 获取房间状态数据
async function fetchRoomStatus() {
    try {
        const response = await fetch('../data/rooms.json');
        const data = await response.json();
        return data.rooms;
    } catch (error) {
        console.error('获取房间状态失败:', error);
        return [];
    }
}

// 更新房间状态显示
function updateRoomDisplay(rooms) {
    const roomGrid = document.getElementById('roomGrid');
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    // 过滤房间
    const filteredRooms = rooms.filter(room => {
        const statusMatch = statusFilter === 'all' || room.status === statusFilter;
        const typeMatch = typeFilter === 'all' || room.type === typeFilter;
        return statusMatch && typeMatch;
    });

    // 生成房间卡片
    roomGrid.innerHTML = filteredRooms.map(room => `
        <div class="room-card">
            <h3>${room.roomNumber} - ${room.type}</h3>
            <div class="status status-${getStatusClass(room.status)}">${room.status}</div>
            <div class="last-update">最后更新: ${formatDate(room.lastUpdate)}</div>
            ${room.notes ? `<div class="notes">备注: ${room.notes}</div>` : ''}
        </div>
    `).join('');
}

// 获取状态对应的 CSS 类名
function getStatusClass(status) {
    const statusMap = {
        '空闲': 'vacant',
        '已入住': 'occupied',
        '打扫中': 'cleaning',
        '维修中': 'maintenance'
    };
    return statusMap[status] || 'vacant';
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 初始化页面
async function initializePage() {
    const rooms = await fetchRoomStatus();
    updateRoomDisplay(rooms);

    // 添加过滤器事件监听
    document.getElementById('statusFilter').addEventListener('change', () => {
        updateRoomDisplay(rooms);
    });
    document.getElementById('typeFilter').addEventListener('change', () => {
        updateRoomDisplay(rooms);
    });

    // 设置定时刷新（每30秒）
    setInterval(async () => {
        const updatedRooms = await fetchRoomStatus();
        updateRoomDisplay(updatedRooms);
    }, 30000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage); 