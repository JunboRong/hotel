// Authentication Module
class Auth {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.admins = [];
        this.init();
    }

    // Initialize
    async init() {
        try {
            // Load user data from file
            const usersResponse = await fetch('../data/users.json');
            const data = await usersResponse.json();
            this.users = data.users || [];
            this.admins = data.admins || [];
            
            // Save to localStorage as backup
            localStorage.setItem('users', JSON.stringify(this.users));
            localStorage.setItem('admins', JSON.stringify(this.admins));
            
            // Check login status
            this.checkLoginStatus();
        } catch (error) {
            console.error('Failed to load user data:', error);
            // If loading fails, try to recover from localStorage
            const usersStr = localStorage.getItem('users');
            const adminsStr = localStorage.getItem('admins');
            
            if (usersStr) {
                this.users = JSON.parse(usersStr);
            }
            
            if (adminsStr) {
                this.admins = JSON.parse(adminsStr);
            }
            
            // Check login status
            this.checkLoginStatus();
        }
    }

    // Check login status
    checkLoginStatus() {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
                // Update UI immediately
                this.updateUI();
                return true;
            } catch (error) {
                console.error('Failed to parse user data:', error);
                this.logout();
                return false;
            }
        }
        return false;
    }

    // Update UI display
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

    // User login
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
            // Save user info to localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            // Update UI
            this.updateUI();
            return true;
        }
        return false;
    }

    // User registration
    register(phone, password, name = 'New Member') {
        // Check if phone number is already registered
        if (this.users.some(u => u.phone === phone)) {
            throw new Error('This phone number is already registered');
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

    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        window.location.href = '../frontend/logIn.html';
    }

    // Check if logged in
    isLoggedIn() {
        // First check the state in memory
        if (this.currentUser) {
            return true;
        }
        // If not in memory, check localStorage
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
                this.updateUI();
                return true;
            } catch (error) {
                console.error('Failed to parse user data:', error);
                this.logout();
                return false;
            }
        }
        return false;
    }

    // Check if admin
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin === true;
    }

    // Get current user
    getCurrentUser() {
        if (!this.currentUser) {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                try {
                    this.currentUser = JSON.parse(userStr);
                } catch (error) {
                    console.error('Failed to parse user data:', error);
                    return null;
                }
            }
        }
        return this.currentUser;
    }
}

// Create global authentication instance
const auth = new Auth();

// Export authentication instance
window.auth = auth; 