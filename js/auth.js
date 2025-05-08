// 模拟用户数据
const users = [
    {
        phone: '13800138000',
        password: '123456',
        name: '张三',
        email: 'zhangsan@example.com',
        membershipLevel: 'gold',
        points: 5000,
        registrationDate: '2023-01-15',
        preferences: {
            roomType: 'deluxe_double',
            floorPreference: 'high',
            smokingPreference: false,
            dietaryRestrictions: ['无麸质', '素食'],
            specialRequests: '需要额外的枕头'
        }
    },
    {
        phone: '13900139000',
        password: '123456',
        name: '李四',
        email: 'lisi@example.com',
        membershipLevel: 'silver',
        points: 2500,
        registrationDate: '2023-03-20',
        preferences: {
            roomType: 'standard_single',
            floorPreference: 'middle',
            smokingPreference: false,
            dietaryRestrictions: [],
            specialRequests: ''
        }
    },
    {
        phone: '13700137000',
        password: '123456',
        name: '王五',
        email: 'wangwu@example.com',
        membershipLevel: 'platinum',
        points: 10000,
        registrationDate: '2022-12-01',
        preferences: {
            roomType: 'deluxe_single',
            floorPreference: 'high',
            smokingPreference: false,
            dietaryRestrictions: ['海鲜过敏'],
            specialRequests: '需要安静的房间'
        }
    },
    {
        phone: '1',
        password: '1',
        name: '测试用户',
        email: 'test@example.com',
        membershipLevel: 'gold',
        points: 3000,
        registrationDate: '2023-06-01',
        preferences: {
            roomType: 'standard_double',
            floorPreference: 'low',
            smokingPreference: false,
            dietaryRestrictions: [],
            specialRequests: '无特殊要求'
        }
    }
];

// 模拟管理员数据
const admins = [
    {
        username: '123',
        password: '123',
        name: '系统管理员',
        role: 'admin'
    }
];

// 处理登录
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const isAdmin = document.getElementById('isAdmin').checked;
    
    if (isAdmin) {
        // 验证管理员
        const admin = admins.find(a => a.username === username && a.password === password);
        if (admin) {
            // 登录成功，保存管理员信息到localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                ...admin,
                isAdmin: true
            }));
            // 跳转到管理页面
            window.location.href = '../backend/states.html';
            return false;
        }
        alert('管理员账号或密码错误！');
        return false;
    }
    
    // 验证普通用户
    const user = users.find(u => u.phone === username && u.password === password);
    if (user) {
        // 登录成功，保存用户信息到localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            ...user,
            isAdmin: false
        }));
        // 跳转到首页
        window.location.href = '../frontend/index.html';
    } else {
        alert('用户名或密码错误！');
    }
    
    return false;
}

// 处理注册
function handleSignup(event) {
    event.preventDefault();
    
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证密码是否匹配
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致！');
        return false;
    }
    
    // 检查手机号是否已注册
    if (users.some(u => u.phone === phone)) {
        alert('该手机号已被注册！');
        return false;
    }
    
    // 创建新用户
    const newUser = {
        phone,
        password,
        name: '新会员',
        email: '',
        membershipLevel: 'bronze',
        points: 0,
        registrationDate: new Date().toISOString().split('T')[0],
        preferences: {
            roomType: 'standard_single',
            floorPreference: 'middle',
            smokingPreference: false,
            dietaryRestrictions: [],
            specialRequests: ''
        }
    };
    
    // 添加新用户
    users.push(newUser);
    
    // 注册成功，保存用户信息到localStorage
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    alert("注册成功！欢迎加入三山酒店！");

    // 跳转到首页
    window.location.href = 'frontend/index.html';
    
    return false;
}

// 检查用户是否已登录
function checkLogin() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        return JSON.parse(currentUser);
    }
    return null;
}

// 检查是否是管理员
function isAdmin() {
    const currentUser = checkLogin();
    return currentUser && currentUser.isAdmin === true;
}

// 退出登录
function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../frontend/logIn.html';
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const currentUser = checkLogin();

    if (currentUser) {
        // 用户已登录
        header.classList.add('logged-in');
        header.classList.remove('not-logged-in');

        // 更新用户信息显示
        const userInfo = document.querySelector('.user-info .username');
        if (userInfo) {
            userInfo.textContent = currentUser.name || currentUser.phone;
        }
    } else {
        // 用户未登录
        header.classList.add('not-logged-in');
        header.classList.remove('logged-in');
    }
});