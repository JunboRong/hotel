// 服务请求列表
let serviceRequests = JSON.parse(localStorage.getItem('serviceRequests')) || [];

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('serviceRequestForm');
    const trackingList = document.getElementById('trackingList');

    // 表单提交处理
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 检查用户是否登录
        const username = localStorage.getItem('username');
        if (!username) {
            alert('请先登录后再提交服务申请');
            window.location.href = 'logIn.html';
            return;
        }

        // 获取表单数据
        const requestData = {
            id: Date.now(),
            roomNumber: document.getElementById('roomNumber').value,
            serviceType: document.getElementById('serviceType').value,
            description: document.getElementById('description').value,
            expectedTime: document.getElementById('expectedTime').value,
            status: 'pending',
            username: username,
            submitTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
        };

        // 保存服务请求
        serviceRequests.unshift(requestData);
        localStorage.setItem('serviceRequests', JSON.stringify(serviceRequests));

        // 更新显示
        updateTrackingList();
        
        // 重置表单
        form.reset();
        
        alert('服务申请已提交成功！');
    });

    // 初始化显示服务记录
    updateTrackingList();
});

// 更新服务跟踪列表
function updateTrackingList() {
    const trackingList = document.getElementById('trackingList');
    const username = localStorage.getItem('username');
    
    // 过滤出当前用户的服务请求
    const userRequests = serviceRequests.filter(request => request.username === username);
    
    if (userRequests.length === 0) {
        trackingList.innerHTML = '<p class="no-records">暂无服务记录</p>';
        return;
    }

    trackingList.innerHTML = userRequests.map(request => `
        <div class="service-record">
            <h3>${getServiceTypeName(request.serviceType)}</h3>
            <p><strong>房间号：</strong>${request.roomNumber}</p>
            <p><strong>具体需求：</strong>${request.description}</p>
            <p><strong>期望服务时间：</strong>${formatDateTime(request.expectedTime)}</p>
            <p><strong>提交时间：</strong>${formatDateTime(request.submitTime)}</p>
            <p><strong>状态：</strong><span class="service-status status-${request.status}">${getStatusName(request.status)}</span></p>
        </div>
    `).join('');
}

// 获取服务类型名称
function getServiceTypeName(type) {
    const types = {
        'cleaning': '客房清洁',
        'supplies': '物品补充',
        'maintenance': '设备报修',
        'other': '其他服务'
    };
    return types[type] || '未知服务';
}

// 获取状态名称
function getStatusName(status) {
    const statuses = {
        'pending': '待处理',
        'in-progress': '处理中',
        'completed': '已完成'
    };
    return statuses[status] || '未知状态';
}

// 格式化日期时间
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
} 