// 假数据
const mockMembers = [
    {
        id: 'M001',
        name: '张三',
        phone: '13800138000',
        level: '黄金会员',
        points: 1500,
        registerDate: '2024-01-01'
    },
    {
        id: 'M002',
        name: '李四',
        phone: '13900139000',
        level: '钻石会员',
        points: 3000,
        registerDate: '2023-12-15'
    },
    {
        id: 'M003',
        name: '王五',
        phone: '13700137000',
        level: '普通会员',
        points: 500,
        registerDate: '2024-02-01'
    },
    {
        id: 'M004',
        name: '赵六',
        phone: '13600136000',
        level: '黄金会员',
        points: 1800,
        registerDate: '2023-11-20'
    }
];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadMemberData();
    initializeEventListeners();
});

// 加载会员数据
function loadMemberData() {
    const tbody = document.querySelector('.member-table tbody');
    tbody.innerHTML = ''; // 清空现有数据

    mockMembers.forEach(member => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.phone}</td>
            <td>${member.level}</td>
            <td>${member.points}</td>
            <td>${member.registerDate}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${member.id}">编辑</button>
                <button class="action-btn delete-btn" data-id="${member.id}">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 初始化事件监听
function initializeEventListeners() {
    // 搜索功能
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box .btn:first-child');
    
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredMembers = mockMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm) ||
            member.phone.includes(searchTerm) ||
            member.id.toLowerCase().includes(searchTerm)
        );
        displayFilteredMembers(filteredMembers);
    });

    // 添加会员按钮
    const addButton = document.querySelector('.search-box .btn:last-child');
    addButton.addEventListener('click', () => {
        // TODO: 实现添加会员功能
        alert('添加会员功能待实现');
    });

    // 编辑和删除按钮事件委托
    document.querySelector('.member-table').addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const memberId = e.target.dataset.id;
            // TODO: 实现编辑功能
            alert(`编辑会员 ${memberId} 的功能待实现`);
        } else if (e.target.classList.contains('delete-btn')) {
            const memberId = e.target.dataset.id;
            if (confirm('确定要删除该会员吗？')) {
                // TODO: 实现删除功能
                alert(`删除会员 ${memberId} 的功能待实现`);
            }
        }
    });
}

// 显示过滤后的会员数据
function displayFilteredMembers(members) {
    const tbody = document.querySelector('.member-table tbody');
    tbody.innerHTML = '';

    members.forEach(member => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.phone}</td>
            <td>${member.level}</td>
            <td>${member.points}</td>
            <td>${member.registerDate}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${member.id}">编辑</button>
                <button class="action-btn delete-btn" data-id="${member.id}">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
} 