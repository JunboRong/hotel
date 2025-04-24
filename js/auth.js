// 模拟用户数据
const users = [
    { phone: '123456', password: '123456' },
    { phone: '1', password: '1' }
];

// 处理登录
function handleLogin(event) {
    event.preventDefault();
    
    const phone = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 验证用户
    const user = users.find(u => u.phone === phone && u.password === password);
    
    if (user) {
        // 登录成功，保存用户信息到localStorage
        localStorage.setItem('currentUser', JSON.stringify({ phone: user.phone }));
        // 跳转到首页
        window.location.href = 'index.html';
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
    
    // 添加新用户
    users.push({ phone, password });
    
    // 注册成功，保存用户信息到localStorage
    localStorage.setItem('currentUser', JSON.stringify({ phone }));

    alert("注册成功")

    // 跳转到首页
    window.location.href = 'index.html';
    
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

// 退出登录
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'logIn.html';
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
            userInfo.textContent = currentUser.phone;
        }
    } else {
        // 用户未登录
        header.classList.add('not-logged-in');
        header.classList.remove('logged-in');
    }
});
// 处理退出登录
function handleLogout() {
    logout();
}