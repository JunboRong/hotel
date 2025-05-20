// 全局变量
let currentCustomer = null;
let selectedRating = 0;

// 会员等级配置
const membershipLevels = {
    'bronze': {
        name: '青铜会员',
        benefits: ['生日礼券', '积分兑换']
    },
    'silver': {
        name: '白银会员',
        benefits: ['生日礼券', '积分兑换', '免费早餐', '延迟退房']
    },
    'gold': {
        name: '黄金会员',
        benefits: ['生日礼券', '积分兑换', '免费早餐', '延迟退房', 'VIP专属通道', '房型免费升级']
    },
    'platinum': {
        name: '铂金会员',
        benefits: ['生日礼券', '积分兑换', '免费早餐', '延迟退房', 'VIP专属通道', '房型免费升级', '专属管家服务', '机场接送']
    }
};

// 反馈类别
const feedbackCategories = [
    '客房清洁',
    '服务态度',
    '设施设备',
    '餐饮服务',
    '入住体验',
    '其他'
];

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
        window.location.href = 'logIn.html';
        return;
    }
    
    try {
        // 获取当前用户数据
        currentCustomer = JSON.parse(currentUserStr);
        
        // 如果用户没有反馈记录，初始化一个空数组
        if (!currentCustomer.feedback) {
            currentCustomer.feedback = [];
        }
        
        // 如果用户没有入住记录，初始化一个空数组
        if (!currentCustomer.stayHistory) {
            currentCustomer.stayHistory = [];
        }
        
        // 初始化反馈类别
        initializeFeedbackCategories(feedbackCategories);
        
        // 显示用户详情
        showCustomerDetails(currentCustomer);
    } catch (error) {
        console.error('加载数据失败:', error);
        alert('加载数据失败，请刷新页面重试');
    }
});

// 显示客户详情
function showCustomerDetails(customer) {
    // 更新会员信息
    const membershipInfo = membershipLevels[customer.membershipLevel];
    document.getElementById('membershipLevel').textContent = membershipInfo.name;
    document.getElementById('memberPoints').textContent = customer.points;

    // 更新会员权益
    const benefitsContainer = document.getElementById('membershipBenefits');
    benefitsContainer.innerHTML = membershipInfo.benefits.map(benefit => 
        `<span class="benefit-tag">${benefit}</span>`
    ).join('');

    // 更新基本信息
    document.getElementById('customerName').textContent = customer.name;
    document.getElementById('customerPhone').textContent = customer.phone;
    document.getElementById('customerEmail').textContent = customer.email;
    document.getElementById('registrationDate').textContent = formatDate(customer.registrationDate);

    // 更新个人偏好
    document.getElementById('preferredRoomType').textContent = getRoomTypeName(customer.preferences.roomType);
    document.getElementById('floorPreference').textContent = getFloorPreference(customer.preferences.floorPreference);
    document.getElementById('smokingPreference').textContent = customer.preferences.smokingPreference ? '是' : '否';
    document.getElementById('dietaryRestrictions').textContent = customer.preferences.dietaryRestrictions.length > 0 
        ? customer.preferences.dietaryRestrictions.join('、') 
        : '无';
    document.getElementById('specialRequests').textContent = customer.preferences.specialRequests || '无';

    // 更新入住历史
    updateStayHistory(customer.stayHistory);

    // 更新反馈列表
    updateFeedbackList(customer.feedback);
}

// 更新入住历史
function updateStayHistory(history) {
    const historyBody = document.getElementById('stayHistoryBody');
    historyBody.innerHTML = '';

    if (history && history.length > 0) {
        history.forEach(stay => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(stay.checkIn)}</td>
                <td>${formatDate(stay.checkOut)}</td>
                <td>${stay.roomNumber}</td>
                <td>${getRoomTypeName(stay.roomType)}</td>
                <td>¥${stay.totalSpent.toFixed(2)}</td>
                <td>${stay.pointsEarned}</td>
            `;
            historyBody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center;">暂无入住记录</td>';
        historyBody.appendChild(row);
    }
}

// 更新反馈列表
function updateFeedbackList(feedbackList) {
    const feedbackContainer = document.getElementById('feedbackList');
    feedbackContainer.innerHTML = '';

    if (feedbackList && feedbackList.length > 0) {
        feedbackList.forEach(feedback => {
            const feedbackItem = document.createElement('div');
            feedbackItem.className = 'feedback-item';
            feedbackItem.innerHTML = `
                <div class="feedback-header">
                    <span>${formatDate(feedback.date)} - ${feedback.category}</span>
                    <span class="rating">${'★'.repeat(feedback.rating)}${'☆'.repeat(5-feedback.rating)}</span>
                </div>
                <div class="feedback-content">${feedback.comment}</div>
            `;
            feedbackContainer.appendChild(feedbackItem);
        });
    } else {
        feedbackContainer.innerHTML = '<div class="feedback-item">暂无反馈记录</div>';
    }
}

// 初始化反馈类别
function initializeFeedbackCategories(categories) {
    const categorySelect = document.getElementById('feedbackCategory');
    categorySelect.innerHTML = '<option value="">请选择类别</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// 切换选项卡
function switchTab(tabName) {
    // 更新按钮状态
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
        if (button.textContent.toLowerCase().includes(tabName)) {
            button.classList.add('active');
        }
    });

    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`${tabName}Tab`).style.display = 'block';
}

// 设置评分
function setRating(rating) {
    selectedRating = rating;
    document.querySelectorAll('.rating-input button').forEach((button, index) => {
        button.classList.toggle('selected', index < rating);
    });
}

// 提交反馈
function submitFeedback() {
    if (!selectedRating) {
        alert('请选择评分');
        return;
    }

    const category = document.getElementById('feedbackCategory').value;
    if (!category) {
        alert('请选择反馈类别');
        return;
    }

    const content = document.getElementById('feedbackContent').value.trim();
    if (!content) {
        alert('请输入反馈内容');
        return;
    }

    // 创建新反馈
    const newFeedback = {
        date: new Date().toISOString().split('T')[0],
        rating: selectedRating,
        category: category,
        comment: content
    };

    // 添加到当前客户的反馈列表
    if (!currentCustomer.feedback) {
        currentCustomer.feedback = [];
    }
    currentCustomer.feedback.unshift(newFeedback);

    // 更新 localStorage 中的用户数据
    localStorage.setItem('currentUser', JSON.stringify(currentCustomer));

    // 更新显示
    updateFeedbackList(currentCustomer.feedback);

    // 重置表单
    resetFeedbackForm();

    alert('反馈提交成功！');
}

// 重置反馈表单
function resetFeedbackForm() {
    selectedRating = 0;
    document.querySelectorAll('.rating-input button').forEach(button => {
        button.classList.remove('selected');
    });
    document.getElementById('feedbackCategory').value = '';
    document.getElementById('feedbackContent').value = '';
}

// 编辑客户信息
function editCustomer() {
    // 显示编辑输入框
    document.querySelectorAll('.edit-input').forEach(input => {
        input.style.display = 'block';
    });
    
    // 隐藏显示文本
    document.querySelectorAll('.customer-info span').forEach(span => {
        span.style.display = 'none';
    });
    
    // 显示编辑按钮组
    document.querySelector('.edit-buttons').style.display = 'block';
    
    // 隐藏编辑信息按钮
    document.querySelector('.details-header .secondary-button').style.display = 'none';
    
    // 填充当前值到输入框
    document.getElementById('editName').value = currentCustomer.name;
    document.getElementById('editPhone').value = currentCustomer.phone;
    document.getElementById('editEmail').value = currentCustomer.email;
}

// 保存客户信息
function saveCustomerInfo() {
    // 获取输入值
    const newName = document.getElementById('editName').value.trim();
    const newPhone = document.getElementById('editPhone').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();
    
    // 验证输入
    if (!newName || !newPhone || !newEmail) {
        alert('请填写所有必填信息');
        return;
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(newPhone)) {
        alert('请输入正确的手机号码');
        return;
    }
    
    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        alert('请输入正确的邮箱地址');
        return;
    }
    
    // 更新客户信息
    currentCustomer.name = newName;
    currentCustomer.phone = newPhone;
    currentCustomer.email = newEmail;
    
    // 更新localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentCustomer));
    
    // 更新显示
    showCustomerDetails(currentCustomer);
    
    // 退出编辑模式
    cancelEdit();
    
    alert('信息更新成功！');
}

// 取消编辑
function cancelEdit() {
    // 隐藏编辑输入框
    document.querySelectorAll('.edit-input').forEach(input => {
        input.style.display = 'none';
    });
    
    // 显示文本
    document.querySelectorAll('.customer-info span').forEach(span => {
        span.style.display = 'block';
    });
    
    // 隐藏编辑按钮组
    document.querySelector('.edit-buttons').style.display = 'none';
    
    // 显示编辑信息按钮
    document.querySelector('.details-header .secondary-button').style.display = 'block';
}

// 获取房型名称
function getRoomTypeName(roomType) {
    const roomTypes = {
        'standard_single': '标准单人房',
        'standard_double': '标准双床房',
        'deluxe_single': '豪华大床房',
        'deluxe_double': '豪华双床房'
    };
    return roomTypes[roomType] || roomType;
}

// 获取楼层偏好描述
function getFloorPreference(preference) {
    const preferences = {
        'high': '高楼层',
        'middle': '中楼层',
        'low': '低楼层'
    };
    return preferences[preference] || preference;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
} 