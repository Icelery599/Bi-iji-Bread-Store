// Authentication functionality
class Auth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.init();
    }
    
    init() {
        this.setupTabs();
        this.setupForms();
        
        // If user is logged in, show dashboard
        if (this.currentUser && document.getElementById('auth-container')) {
            this.showDashboard();
        }
    }
    
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const forms = document.querySelectorAll('.auth-form');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                // Update active tab
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show active form
                forms.forEach(form => form.classList.remove('active'));
                document.getElementById(`${tab}-form`).classList.add('active');
            });
        });
    }
    
    setupForms() {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.signup();
            });
        }
        
        // Forgot password
        const forgotPassword = document.querySelector('.forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPassword();
            });
        }
    }
    
    login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Basic validation
        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        // Find user
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = {
                name: user.name,
                email: user.email
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            this.showMessage('Login successful!', 'success');
            
            // Redirect to home page after 1 second
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            this.showMessage('Invalid email or password', 'error');
        }
    }
    
    signup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        // Validation
        if (!name || !email || !password || !confirm) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirm) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }
        
        // Check if user already exists
        if (this.users.some(u => u.email === email)) {
            this.showMessage('Email already registered', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        this.currentUser = {
            name: newUser.name,
            email: newUser.email
        };
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        this.showMessage('Account created successfully!', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'account.html';
    }
    
    showDashboard() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        authContainer.innerHTML = `
            <div class="dashboard">
                <h2>Welcome, ${this.currentUser.name}!</h2>
                <div class="user-info">
                    <p><strong>Email:</strong> ${this.currentUser.email}</p>
                    <p><strong>Member since:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="dashboard-actions">
                    <button class="btn btn-secondary" id="view-orders">View My Orders</button>
                    <button class="btn btn-primary" id="edit-profile">Edit Profile</button>
                    <button class="btn btn-logout" id="logout-btn">Log Out</button>
                </div>
            </div>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }
    
    showForgotPassword() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        authContainer.innerHTML = `
            <div class="forgot-password-form">
                <h2>Reset Password</h2>
                <p>Enter your email to receive a password reset link</p>
                <div class="form-group">
                    <input type="email" id="reset-email" class="form-control" placeholder="Your email address">
                </div>
                <button class="btn btn-primary" id="send-reset">Send Reset Link</button>
                <button class="btn btn-secondary" id="back-to-login">Back to Login</button>
            </div>
        `;
        
        document.getElementById('send-reset').addEventListener('click', () => {
            const email = document.getElementById('reset-email').value;
            if (email) {
                this.showMessage('Reset link sent to your email', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        });
        
        document.getElementById('back-to-login').addEventListener('click', () => {
            window.location.reload();
        });
    }
    
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMsg = document.querySelector('.auth-message');
        if (existingMsg) existingMsg.remove();
        
        // Create message element
        const msg = document.createElement('div');
        msg.className = `auth-message ${type}`;
        msg.textContent = message;
        
        // Style
        msg.style.cssText = `
            padding: 15px;
            margin: 20px 0;
            border-radius: var(--radius);
            text-align: center;
            font-weight: 600;
        `;
        
        if (type === 'success') {
            msg.style.backgroundColor = '#d4edda';
            msg.style.color = '#155724';
            msg.style.border = '1px solid #c3e6cb';
        } else if (type === 'error') {
            msg.style.backgroundColor = '#f8d7da';
            msg.style.color = '#721c24';
            msg.style.border = '1px solid #f5c6cb';
        } else {
            msg.style.backgroundColor = '#d1ecf1';
            msg.style.color = '#0c5460';
            msg.style.border = '1px solid #bee5eb';
        }
        
        // Insert message
        const container = document.getElementById('auth-container') || document.querySelector('.form-container');
        if (container) {
            container.insertBefore(msg, container.firstChild);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (msg.parentNode) {
                    msg.remove();
                }
            }, 5000);
        }
    }
}

// Initialize auth
document.addEventListener('DOMContentLoaded', () => {
    const auth = new Auth();
    
    // Add additional CSS for auth forms
    const style = document.createElement('style');
    style.textContent = `
        .form-tabs {
            display: flex;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
        }
        
        .tab-btn {
            flex: 1;
            padding: 15px;
            background: none;
            border: none;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            color: var(--gray);
            border-bottom: 3px solid transparent;
        }
        
        .tab-btn.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
        }
        
        .auth-form {
            display: none;
        }
        
        .auth-form.active {
            display: block;
        }
        
        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }
        
        .forgot-password {
            color: var(--primary);
            text-decoration: none;
        }
        
        .forgot-password:hover {
            text-decoration: underline;
        }
        
        .btn-block {
            width: 100%;
        }
        
        .dashboard {
            text-align: center;
        }
        
        .user-info {
            background: var(--light);
            padding: 25px;
            border-radius: var(--radius);
            margin: 30px 0;
            text-align: left;
        }
        
        .dashboard-actions {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .btn-logout {
            background-color: #dc3545;
            color: white;
        }
        
        .btn-logout:hover {
            background-color: #c82333;
        }
    `;
    document.head.appendChild(style);
});