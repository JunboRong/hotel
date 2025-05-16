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

// 服务管理类
class ServiceManager {
    constructor() {
        this.currentUser = null;
        this.services = {
            laundry: { name: '洗衣服务', price: 100 },
            massage: { name: '按摩服务', price: 298 },
            carService: { name: '接送服务', price: 200 },
            roomCleaning: { name: '客房清洁', price: 50 }
        };
    }

    // 初始化
    async initialize() {
        try {
            // 从localStorage获取当前用户
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!this.currentUser) {
                throw new Error('用户未登录');
            }

            // 加载服务历史
            this.loadServiceHistory();
        } catch (error) {
            console.error('初始化失败:', error);
            window.location.href = 'logIn.html';
        }
    }

    // 加载服务历史
    loadServiceHistory() {
        const serviceHistory = JSON.parse(localStorage.getItem(`serviceHistory_${this.currentUser.id}`)) || [];
        this.updateServiceHistoryDisplay(serviceHistory);
    }

    // 更新服务历史显示
    updateServiceHistoryDisplay(history) {
        const historyContainer = document.getElementById('serviceHistory');
        if (!historyContainer) return;

        historyContainer.innerHTML = '';
        
        if (history.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">暂无服务记录</p>';
            return;
        }

        history.forEach(service => {
            const serviceElement = document.createElement('div');
            serviceElement.className = 'service-item';
            serviceElement.innerHTML = `
                <div class="service-info">
                    <h3>${service.name}</h3>
                    <p>预约时间：${this.formatDateTime(service.scheduledTime)}</p>
                    <p>价格：¥${service.price}</p>
                    <p>状态：${service.status}</p>
                </div>
            `;
            historyContainer.appendChild(serviceElement);
        });
    }

    // 格式化日期时间
    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 请求服务
    async requestService(serviceType, scheduledTime) {
        try {
            // 验证服务类型
            if (!this.services[serviceType]) {
                throw new Error('无效的服务类型');
            }

            // 验证预约时间
            const scheduledDate = new Date(scheduledTime);
            if (scheduledDate < new Date()) {
                throw new Error('预约时间不能早于当前时间');
            }

            // 创建服务记录
            const service = {
                id: Date.now().toString(),
                userId: this.currentUser.id,
                type: serviceType,
                name: this.services[serviceType].name,
                price: this.services[serviceType].price,
                scheduledTime: scheduledTime,
                status: '待确认',
                createTime: new Date().toISOString()
            };

            // 保存服务记录
            const serviceHistory = JSON.parse(localStorage.getItem(`serviceHistory_${this.currentUser.id}`)) || [];
            serviceHistory.push(service);
            localStorage.setItem(`serviceHistory_${this.currentUser.id}`, JSON.stringify(serviceHistory));

            // 添加到费用系统
            const serviceData = {
                name: service.name,
                quantity: 1,
                price: service.price
            };
            
            // 调用费用管理器添加服务费用
            if (typeof expenseManager !== 'undefined') {
                expenseManager.addServiceCharge(serviceData);
            }

            // 更新显示
            this.updateServiceHistoryDisplay(serviceHistory);

            return true;
        } catch (error) {
            console.error('请求服务失败:', error);
            throw error;
        }
    }

    // 取消服务
    async cancelService(serviceId) {
        try {
            const serviceHistory = JSON.parse(localStorage.getItem(`serviceHistory_${this.currentUser.id}`)) || [];
            const serviceIndex = serviceHistory.findIndex(s => s.id === serviceId);
            
            if (serviceIndex === -1) {
                throw new Error('服务记录不存在');
            }

            const service = serviceHistory[serviceIndex];
            if (service.status !== '待确认') {
                throw new Error('只能取消待确认的服务');
            }

            // 更新服务状态
            service.status = '已取消';
            localStorage.setItem(`serviceHistory_${this.currentUser.id}`, JSON.stringify(serviceHistory));

            // 更新显示
            this.updateServiceHistoryDisplay(serviceHistory);

            return true;
        } catch (error) {
            console.error('取消服务失败:', error);
            throw error;
        }
    }
}

// 创建服务管理器实例
const serviceManager = new ServiceManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await serviceManager.initialize();
    } catch (error) {
        console.error('初始化失败:', error);
        window.location.href = 'logIn.html';
    }
}); 