// 认证模块
class Auth {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.admins = [];
        this.init();
    }

    // 初始化
    async init() {
        try {
            // 从文件加载用户数据
            const usersResponse = await fetch('../data/users.json');
            const data = await usersResponse.json();
            this.users = data.users || [];
            this.admins = data.admins || [];
            
            // 保存到localStorage作为备份
            localStorage.setItem('users', JSON.stringify(this.users));
            localStorage.setItem('admins', JSON.stringify(this.admins));
            
            // 检查登录状态
            this.checkLoginStatus();
        } catch (error) {
            console.error('加载用户数据失败:', error);
            // 如果加载失败，尝试从localStorage恢复
            const usersStr = localStorage.getItem('users');
            const adminsStr = localStorage.getItem('admins');
            
            if (usersStr) {
                this.users = JSON.parse(usersStr);
            }
            
            if (adminsStr) {
                this.admins = JSON.parse(adminsStr);
            }
            
            // 检查登录状态
            this.checkLoginStatus();
        }
    }

    // 检查登录状态
    checkLoginStatus() {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
                // 立即更新UI
                this.updateUI();
                return true;
            } catch (error) {
                console.error('解析用户数据失败:', error);
                this.logout();
                return false;
            }
        }
        return false;
    }

    // 更新UI显示
    updateUI() {
        const header = document.querySelector('.header');
        if (!header) return;

        if (this.currentUser) {
            header.classList.add('logged-in');
            header.classList.remove('not-logged-in');

            const usernameElement = header.querySelector('.user-info .username');
            if (usernameElement) {
                usernameElement.textContent = this.currentUser.name || this.currentUser.phone;
            }
        } else {
            header.classList.add('not-logged-in');
            header.classList.remove('logged-in');
        }
    }

    // 用户登录
    login(username, password, isAdmin = false) {
        let user = null;

        if (isAdmin) {
            user = this.admins.find(a => a.username === username && a.password === password);
            if (user) {
                user.isAdmin = true;
            }
        } else {
            user = this.users.find(u => u.phone === username && u.password === password);
        }

        if (user) {
            this.currentUser = user;
            // 保存用户信息到localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            // 更新UI
            this.updateUI();
            return true;
        }
        return false;
    }

    // 用户注册
    register(phone, password, name = '新会员') {
        // 检查手机号是否已注册
        if (this.users.some(u => u.phone === phone)) {
            throw new Error('该手机号已被注册');
        }

        const newUser = {
            id: String(this.users.length + 1),
            phone,
            password,
            name,
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

        this.users.push(newUser);
        this.currentUser = newUser;
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.updateUI();
        return newUser;
    }

    // 退出登录
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        window.location.href = 'logIn.html';
    }

    // 检查是否已登录
    isLoggedIn() {
        // 先检查内存中的状态
        if (this.currentUser) {
            return true;
        }
        // 如果内存中没有，检查localStorage
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
                this.updateUI();
                return true;
            } catch (error) {
                console.error('解析用户数据失败:', error);
                this.logout();
                return false;
            }
        }
        return false;
    }

    // 检查是否是管理员
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin === true;
    }

    // 获取当前用户
    getCurrentUser() {
        if (!this.currentUser) {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                try {
                    this.currentUser = JSON.parse(userStr);
                } catch (error) {
                    console.error('解析用户数据失败:', error);
                    return null;
                }
            }
        }
        return this.currentUser;
    }
}

// 创建全局认证实例
const auth = new Auth();

// 导出认证实例
window.auth = auth; 