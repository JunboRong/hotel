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