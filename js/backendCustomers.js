// 获取会员数据
async function fetchCustomers() {
    try {
        const response = await fetch('../data/customers.json');
        const data = await response.json();
        return data.mockCustomers || [];
    } catch (error) {
        console.error('获取会员数据失败:', error);
        return [];
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadMemberData();
        initializeEventListeners();
        console.log('页面初始化完成');
    } catch (error) {
        console.error('页面初始化失败:', error);
    }
});

// 加载会员数据
function createMemberRow(customer) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${customer.id}</td>
        <td>${customer.name}</td>
        <td>${customer.phone}</td>
        <td>${customer.membershipLevel}</td>
        <td>${customer.points}</td>
        <td>${customer.registrationDate}</td>
        <td>
            <button class="action-btn edit-btn" data-id="${customer.id}">编辑</button>
            <button class="action-btn delete-btn" data-id="${customer.id}">删除</button>
            <button class="action-btn detail-btn" data-id="${customer.id}">详情</button>
        </td>
    `;
    return tr;
}

async function loadMemberData(customers) {
    const tbody = document.querySelector('.member-table tbody');
    tbody.innerHTML = '';
    (customers || await fetchCustomers()).forEach(customer => {
        tbody.appendChild(createMemberRow(customer));
    });
}

// 初始化事件监听
function initializeEventListeners() {
    // 搜索功能
    const searchInput = document.querySelector('.search-box input');
    document.getElementById('searchBtn').addEventListener('click', async () => {
        const searchTerm = searchInput.value.toLowerCase();
        const customers = await fetchCustomers();
        const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.phone.includes(searchTerm) ||
            customer.id.toLowerCase().includes(searchTerm)
        );
        loadMemberData(filtered);
    });

    // 添加会员按钮
    document.getElementById('addMemberBtn').addEventListener('click', () => {
        document.getElementById('addMemberModal').style.display = 'flex';
    });

    // 表格操作事件委托
    document.querySelector('.member-table').addEventListener('click', async (e) => {
        const customerId = e.target.dataset.id;
        if (!customerId) return;

        const customers = await fetchCustomers();
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;

        if (e.target.classList.contains('edit-btn')) {
            showEditMemberModal(customer);
        } else if (e.target.classList.contains('delete-btn')) {
            if (confirm('确定要删除该会员吗？')) await deleteMember(customerId);
        } else if (e.target.classList.contains('detail-btn')) {
            showCustomerDetails(customer);
        }
    });

    // 添加会员表单提交
    const addMemberForm = document.getElementById('addMemberForm');
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('添加会员表单提交');
            const newMember = {
                id: generateMemberId(),
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                birthDate: document.getElementById('birthDate').value,
                membershipLevel: document.getElementById('membershipLevel').value,
                points: 0,
                registrationDate: new Date().toISOString().split('T')[0],
                preferences: {
                    roomType: '',
                    floorPreference: '',
                    smokingPreference: false,
                    dietaryRestrictions: [],
                    specialRequests: ''
                },
                stayHistory: [],
                feedback: []
            };

            await addMember(newMember);
            closeModal('addMemberModal');
            e.target.reset();
        });
    } else {
        console.error('添加会员表单未找到');
    }

    // 编辑会员表单提交
    const editMemberForm = document.getElementById('editMemberForm');
    if (editMemberForm) {
        editMemberForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('编辑会员表单提交');
            const customerId = e.target.dataset.customerId;
            const customers = await fetchCustomers();
            const customer = customers.find(c => c.id === customerId);

            if (customer) {
                const updatedMember = {
                    ...customer,
                    name: document.getElementById('editName').value,
                    phone: document.getElementById('editPhone').value,
                    email: document.getElementById('editEmail').value,
                    birthDate: document.getElementById('editBirthDate').value,
                    membershipLevel: document.getElementById('editMembershipLevel').value,
                    points: parseInt(document.getElementById('editPoints').value)
                };

                await updateMember(updatedMember);
                closeModal('editMemberModal');
            }
        });
    } else {
        console.error('编辑会员表单未找到');
    }

    console.log('事件监听器初始化完成');
}



// 显示编辑会员模态框
function showEditMemberModal(customer) {
    document.getElementById('editName').value = customer.name;
    document.getElementById('editPhone').value = customer.phone;
    document.getElementById('editEmail').value = customer.email;
    document.getElementById('editBirthDate').value = customer.birthDate;
    document.getElementById('editMembershipLevel').value = customer.membershipLevel;
    document.getElementById('editPoints').value = customer.points;
    document.getElementById('editMemberForm').dataset.customerId = customer.id;
    document.getElementById('editMemberModal').style.display = 'flex';
}

// 显示会员详情
function showCustomerDetails(customer) {
    // 基本信息
    document.getElementById('detailId').textContent = customer.id;
    document.getElementById('detailName').textContent = customer.name;
    document.getElementById('detailPhone').textContent = customer.phone;
    document.getElementById('detailEmail').textContent = customer.email;
    document.getElementById('detailBirthDate').textContent = customer.birthDate;
    document.getElementById('detailMembershipLevel').textContent = customer.membershipLevel;
    document.getElementById('detailPoints').textContent = customer.points;
    document.getElementById('detailRegistrationDate').textContent = customer.registrationDate;

    // 偏好设置
    document.getElementById('detailRoomType').textContent = customer.preferences.roomType || '无';
    document.getElementById('detailFloorPreference').textContent = customer.preferences.floorPreference || '无';
    document.getElementById('detailSmokingPreference').textContent = customer.preferences.smokingPreference ? '是' : '否';
    document.getElementById('detailDietaryRestrictions').textContent = customer.preferences.dietaryRestrictions.join(', ') || '无';
    document.getElementById('detailSpecialRequests').textContent = customer.preferences.specialRequests || '无';

    // 入住历史
    const stayHistoryHtml = customer.stayHistory.map(stay => `
        <tr>
            <td>${stay.checkIn}</td>
            <td>${stay.checkOut}</td>
            <td>${stay.roomNumber}</td>
            <td>${stay.roomType}</td>
            <td>¥${stay.totalSpent}</td>
            <td>${stay.pointsEarned}</td>
        </tr>
    `).join('');
    document.getElementById('detailStayHistory').innerHTML = stayHistoryHtml;

    // 反馈评价
    const feedbackHtml = customer.feedback.map(fb => `
        <div class="feedback-item">
            <p><strong>日期：</strong>${fb.date}</p>
            <p><strong>评分：</strong>${'★'.repeat(fb.rating)}${'☆'.repeat(5-fb.rating)}</p>
            <p><strong>类别：</strong>${fb.category}</p>
            <p><strong>评价：</strong>${fb.comment}</p>
        </div>
    `).join('');
    document.getElementById('detailFeedback').innerHTML = feedbackHtml;

    document.getElementById('memberDetailModal').style.display = 'flex';
}

// 关闭模态框
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 生成会员ID
function generateMemberId() {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const lastId = customers.length > 0 ?
        Math.max(...customers.map(c => parseInt(c.id.substring(1)))) : 0;
    return `C${String(lastId + 1).padStart(3, '0')}`;
}

// 添加会员
async function addMember(newMember) {
    try {
        const customers = await fetchCustomers();
        customers.push(newMember);
        localStorage.setItem('customers', JSON.stringify(customers));
        await loadMemberData();
        alert('会员添加成功！');
    } catch (error) {
        console.error('添加会员失败:', error);
        alert('添加会员失败，请重试！');
    }
}

// 更新会员
async function updateMember(updatedMember) {
    try {
        const customers = await fetchCustomers();
        const index = customers.findIndex(c => c.id === updatedMember.id);
        if (index !== -1) {
            customers[index] = updatedMember;
            localStorage.setItem('customers', JSON.stringify(customers));
            await loadMemberData();
            alert('会员信息更新成功！');
        }
    } catch (error) {
        console.error('更新会员失败:', error);
        alert('更新会员失败，请重试！');
    }
}

// 删除会员
async function deleteMember(memberId) {
    try {
        const customers = await fetchCustomers();
        const filteredCustomers = customers.filter(c => c.id !== memberId);
        localStorage.setItem('customers', JSON.stringify(filteredCustomers));
        await loadMemberData();
        alert('会员删除成功！');
    } catch (error) {
        console.error('删除会员失败:', error);
        alert('删除会员失败，请重试！');
    }
}