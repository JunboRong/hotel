// 服务请求列表
let serviceRequests = JSON.parse(localStorage.getItem('serviceRequests')) || [];

// 获取服务数据
async function fetchServices() {
    try {
        const response = await fetch('../data/services.json');
        const data = await response.json();
        return data.services;
    } catch (error) {
        console.error('获取服务数据失败:', error);
        return [];
    }
}

// 更新服务显示
function updateServiceDisplay(services) {
    const serviceGrid = document.getElementById('serviceGrid');
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    // 过滤服务
    const filteredServices = services.filter(service => {
        const typeMatch = typeFilter === 'all' || service.type === typeFilter;
        const statusMatch = statusFilter === 'all' || service.status === statusFilter;
        return typeMatch && statusMatch;
    });

    // 生成服务卡片
    serviceGrid.innerHTML = filteredServices.map(service => `
        <div class="service-card">
            <h3>
                房间 ${service.roomNumber}
                <span class="service-id">${service.id}</span>
            </h3>
            <div class="service-info">
                <p>服务类型：<span class="service-type type-${getTypeClass(service.type)}">${service.type}</span></p>
                <p>状态：<span class="service-status status-${getStatusClass(service.status)}">${service.status}</span></p>
                <p>优先级：<span class="service-priority priority-${getPriorityClass(service.priority)}">${service.priority}</span></p>
                <p>请求时间：${formatDate(service.requestTime)}</p>
                <p>描述：${service.description}</p>
            </div>
            <div class="service-actions">
                ${getActionButtons(service)}
            </div>
        </div>
    `).join('');

    // 添加按钮事件监听
    addButtonEventListeners();
}

// 获取服务类型对应的 CSS 类名
function getTypeClass(type) {
    const typeMap = {
        '清洁服务': 'cleaning',
        '维修服务': 'repair',
        '餐饮服务': 'food',
        '其他服务': 'other'
    };
    return typeMap[type] || 'other';
}

// 获取状态对应的 CSS 类名
function getStatusClass(status) {
    const statusMap = {
        '待处理': 'pending',
        '处理中': 'processing',
        '已完成': 'completed'
    };
    return statusMap[status] || 'pending';
}

// 获取优先级对应的 CSS 类名
function getPriorityClass(priority) {
    const priorityMap = {
        '普通': 'normal',
        '紧急': 'urgent'
    };
    return priorityMap[priority] || 'normal';
}

// 根据服务状态获取操作按钮
function getActionButtons(service) {
    if (service.status === '待处理') {
        return `<button class="accept-btn" data-id="${service.id}">接受服务</button>`;
    } else if (service.status === '处理中') {
        return `<button class="complete-btn" data-id="${service.id}">完成服务</button>`;
    }
    return '';
}

// 添加按钮事件监听
function addButtonEventListeners() {
    document.querySelectorAll('.accept-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const serviceId = e.target.dataset.id;
            await updateServiceStatus(serviceId, '处理中');
        });
    });

    document.querySelectorAll('.complete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const serviceId = e.target.dataset.id;
            await updateServiceStatus(serviceId, '已完成');
        });
    });
}

// 更新服务状态
async function updateServiceStatus(serviceId, newStatus) {
    try {
        const services = await fetchServices();
        const serviceIndex = services.findIndex(s => s.id === serviceId);
        if (serviceIndex !== -1) {
            services[serviceIndex].status = newStatus;
            // 在实际应用中，这里应该调用后端 API 来更新数据
            // 这里仅作为演示，直接更新显示
            updateServiceDisplay(services);
        }
    } catch (error) {
        console.error('更新服务状态失败:', error);
    }
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
    const services = await fetchServices();
    updateServiceDisplay(services);

    // 添加过滤器事件监听
    document.getElementById('typeFilter').addEventListener('change', () => {
        updateServiceDisplay(services);
    });
    document.getElementById('statusFilter').addEventListener('change', () => {
        updateServiceDisplay(services);
    });

    // 设置定时刷新（每30秒）
    setInterval(async () => {
        const updatedServices = await fetchServices();
        updateServiceDisplay(updatedServices);
    }, 30000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage);