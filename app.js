// Application State
let currentUser = null;
let currentSection = 'overview';

// Mock Data
const mockData = {
    users: [
        {
            id: 1,
            email: 'demo@vaultscope.com',
            password: 'demo123',
            firstName: 'John',
            lastName: 'Doe',
            company: 'Demo Corp',
            plan: 'professional',
            subscriptionStatus: 'active',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            createdAt: new Date('2024-01-15')
        }
    ],
    wallets: [
        {
            id: 'hot_wallet_btc',
            name: 'Hot Wallet BTC',
            asset: 'BTC',
            balance: '1.25000000',
            usdValue: 52500.00,
            status: 'active',
            provider: 'Fireblocks',
            lastUpdated: new Date()
        },
        {
            id: 'cold_wallet_btc',
            name: 'Cold Storage BTC',
            asset: 'BTC',
            balance: '15.75000000',
            usdValue: 661500.00,
            status: 'active',
            provider: 'Fireblocks',
            lastUpdated: new Date()
        },
        {
            id: 'hot_wallet_eth',
            name: 'Hot Wallet ETH',
            asset: 'ETH',
            balance: '45.50000000',
            usdValue: 136500.00,
            status: 'active',
            provider: 'Coinbase Custody',
            lastUpdated: new Date()
        }
    ],
    alerts: [
        {
            id: 1,
            type: 'balance_threshold',
            severity: 'warning',
            message: 'Hot Wallet BTC balance below 2.0 BTC threshold',
            walletId: 'hot_wallet_btc',
            triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'active'
        },
        {
            id: 2,
            type: 'rebalance_completed',
            severity: 'info',
            message: 'Auto-rebalancing completed for ETH wallets',
            walletId: 'hot_wallet_eth',
            triggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'resolved'
        }
    ],
    rebalanceRules: [
        {
            id: 1,
            name: 'Hot Wallet BTC',
            asset: 'BTC',
            minThreshold: 0.1,
            maxThreshold: 2.0,
            targetBalance: 1.0,
            enabled: true
        },
        {
            id: 2,
            name: 'Hot Wallet ETH',
            asset: 'ETH',
            minThreshold: 5.0,
            maxThreshold: 50.0,
            targetBalance: 25.0,
            enabled: true
        }
    ]
};

// Utility Functions
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Authentication Functions
function showLogin() {
    document.getElementById('login-modal').style.display = 'block';
}

function showSignup() {
    document.getElementById('signup-modal').style.display = 'block';
}

function showForgotPassword() {
    alert('Password reset functionality would be implemented here.');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function selectPlan(planName) {
    document.getElementById('signup-plan').value = planName;
    showSignup();
}

function showDemo() {
    // Auto-login with demo account
    const demoUser = mockData.users[0];
    currentUser = demoUser;
    showDashboard();
}

function login(email, password) {
    const user = mockData.users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        showDashboard();
        return true;
    }
    return false;
}

function signup(userData) {
    const newUser = {
        id: mockData.users.length + 1,
        ...userData,
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
    };
    
    mockData.users.push(newUser);
    currentUser = newUser;
    showDashboard();
    return true;
}

function logout() {
    currentUser = null;
    document.getElementById('dashboard').style.display = 'none';
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);
}

function showDashboard() {
    document.getElementById('dashboard').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Update user info
    document.getElementById('user-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('user-plan').textContent = `${currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1)} Plan`;
    
    // Load initial section
    loadDashboardSection('overview');
    
    // Close any open modals
    closeModal('login-modal');
    closeModal('signup-modal');
}

// Dashboard Functions
function loadDashboardSection(section) {
    currentSection = section;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update section title
    const titles = {
        overview: 'Dashboard Overview',
        wallets: 'Wallet Management',
        alerts: 'Alert Management',
        rebalancing: 'Rebalancing Rules',
        compliance: 'Compliance & Audit',
        settings: 'Account Settings',
        billing: 'Billing & Subscription'
    };
    
    document.getElementById('section-title').textContent = titles[section];
    
    // Load section content
    const content = document.getElementById('dashboard-content');
    content.innerHTML = getSectionContent(section);
    content.classList.add('fade-in');
}

function getSectionContent(section) {
    switch (section) {
        case 'overview':
            return getOverviewContent();
        case 'wallets':
            return getWalletsContent();
        case 'alerts':
            return getAlertsContent();
        case 'rebalancing':
            return getRebalancingContent();
        case 'compliance':
            return getComplianceContent();
        case 'settings':
            return getSettingsContent();
        case 'billing':
            return getBillingContent();
        default:
            return '<p>Section not found</p>';
    }
}

function getOverviewContent() {
    const totalValue = mockData.wallets.reduce((sum, wallet) => sum + wallet.usdValue, 0);
    const activeWallets = mockData.wallets.filter(w => w.status === 'active').length;
    const activeAlerts = mockData.alerts.filter(a => a.status === 'active').length;
    
    return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total Portfolio Value</span>
                    <div class="stat-card-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                </div>
                <div class="stat-card-value">${formatCurrency(totalValue)}</div>
                <div class="stat-card-change positive">
                    <i class="fas fa-arrow-up"></i>
                    <span>+5.2% from last month</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Active Wallets</span>
                    <div class="stat-card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <i class="fas fa-wallet"></i>
                    </div>
                </div>
                <div class="stat-card-value">${activeWallets}</div>
                <div class="stat-card-change positive">
                    <i class="fas fa-arrow-up"></i>
                    <span>+2 this month</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Active Alerts</span>
                    <div class="stat-card-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                        <i class="fas fa-bell"></i>
                    </div>
                </div>
                <div class="stat-card-value">${activeAlerts}</div>
                <div class="stat-card-change ${activeAlerts > 0 ? 'negative' : 'positive'}">
                    <i class="fas fa-${activeAlerts > 0 ? 'exclamation-triangle' : 'check'}"></i>
                    <span>${activeAlerts > 0 ? 'Requires attention' : 'All clear'}</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Rebalance Rules</span>
                    <div class="stat-card-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                        <i class="fas fa-balance-scale"></i>
                    </div>
                </div>
                <div class="stat-card-value">${mockData.rebalanceRules.filter(r => r.enabled).length}</div>
                <div class="stat-card-change positive">
                    <i class="fas fa-check"></i>
                    <span>All rules active</span>
                </div>
            </div>
        </div>
        
        <div class="content-card">
            <div class="content-card-header">
                <h3 class="content-card-title">Recent Activity</h3>
                <button class="btn btn-outline btn-small">View All</button>
            </div>
            <div class="content-card-body">
                <div class="activity-list">
                    ${mockData.alerts.slice(0, 5).map(alert => `
                        <div class="activity-item">
                            <div class="activity-icon ${alert.severity}">
                                <i class="fas fa-${alert.severity === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-message">${alert.message}</div>
                                <div class="activity-time">${formatDate(alert.triggeredAt)}</div>
                            </div>
                            <div class="activity-status">
                                <span class="status-badge ${alert.status === 'active' ? 'warning' : 'active'}">${alert.status}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <style>
        .activity-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .activity-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        
        .activity-icon.warning {
            background: #f59e0b;
        }
        
        .activity-icon.info {
            background: #3b82f6;
        }
        
        .activity-content {
            flex: 1;
        }
        
        .activity-message {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        
        .activity-time {
            font-size: 0.9rem;
            color: #666;
        }
        </style>
    `;
}

function getWalletsContent() {
    return `
        <div class="content-card">
            <div class="content-card-header">
                <h3 class="content-card-title">Connected Wallets</h3>
                <button class="btn btn-primary" onclick="addWallet()">
                    <i class="fas fa-plus"></i>
                    Add Wallet
                </button>
            </div>
            <div class="content-card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Wallet Name</th>
                            <th>Asset</th>
                            <th>Balance</th>
                            <th>USD Value</th>
                            <th>Provider</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mockData.wallets.map(wallet => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem; font-weight: 600;">
                                            ${wallet.asset}
                                        </div>
                                        <span style="font-weight: 600;">${wallet.name}</span>
                                    </div>
                                </td>
                                <td><span style="font-weight: 600; color: #667eea;">${wallet.asset}</span></td>
                                <td><span style="font-family: monospace;">${wallet.balance}</span></td>
                                <td><span style="font-weight: 600;">${formatCurrency(wallet.usdValue)}</span></td>
                                <td>${wallet.provider}</td>
                                <td><span class="status-badge ${wallet.status}">${wallet.status}</span></td>
                                <td>
                                    <button class="btn btn-outline btn-small" onclick="editWallet('${wallet.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function getAlertsContent() {
    return `
        <div class="content-card">
            <div class="content-card-header">
                <h3 class="content-card-title">Alert Management</h3>
                <button class="btn btn-primary" onclick="createAlert()">
                    <i class="fas fa-plus"></i>
                    Create Alert
                </button>
            </div>
            <div class="content-card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Alert Type</th>
                            <th>Message</th>
                            <th>Severity</th>
                            <th>Triggered</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mockData.alerts.map(alert => `
                            <tr>
                                <td><span style="text-transform: capitalize;">${alert.type.replace('_', ' ')}</span></td>
                                <td>${alert.message}</td>
                                <td><span class="status-badge ${alert.severity}">${alert.severity}</span></td>
                                <td>${formatDate(alert.triggeredAt)}</td>
                                <td><span class="status-badge ${alert.status === 'active' ? 'warning' : 'active'}">${alert.status}</span></td>
                                <td>
                                    ${alert.status === 'active' ? 
                                        `<button class="btn btn-outline btn-small" onclick="resolveAlert(${alert.id})">
                                            <i class="fas fa-check"></i>
                                        </button>` : 
                                        '<span style="color: #666;">Resolved</span>'
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function getRebalancingContent() {
    return `
        <div class="content-card">
            <div class="content-card-header">
                <h3 class="content-card-title">Rebalancing Rules</h3>
                <button class="btn btn-primary" onclick="createRebalanceRule()">
                    <i class="fas fa-plus"></i>
                    Add Rule
                </button>
            </div>
            <div class="content-card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Rule Name</th>
                            <th>Asset</th>
                            <th>Min Threshold</th>
                            <th>Max Threshold</th>
                            <th>Target Balance</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mockData.rebalanceRules.map(rule => `
                            <tr>
                                <td><span style="font-weight: 600;">${rule.name}</span></td>
                                <td><span style="font-weight: 600; color: #667eea;">${rule.asset}</span></td>
                                <td><span style="font-family: monospace;">${rule.minThreshold}</span></td>
                                <td><span style="font-family: monospace;">${rule.maxThreshold}</span></td>
                                <td><span style="font-family: monospace;">${rule.targetBalance}</span></td>
                                <td><span class="status-badge ${rule.enabled ? 'active' : 'warning'}">${rule.enabled ? 'enabled' : 'disabled'}</span></td>
                                <td>
                                    <button class="btn btn-outline btn-small" onclick="editRebalanceRule(${rule.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline btn-small" onclick="toggleRebalanceRule(${rule.id})">
                                        <i class="fas fa-${rule.enabled ? 'pause' : 'play'}"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function getComplianceContent() {
    return `
        <div class="stats-grid" style="margin-bottom: 30px;">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Audit Logs</span>
                    <div class="stat-card-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <i class="fas fa-file-alt"></i>
                    </div>
                </div>
                <div class="stat-card-value">1,247</div>
                <div class="stat-card-change positive">
                    <i class="fas fa-check"></i>
                    <span>All logged</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Compliance Score</span>
                    <div class="stat-card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <i class="fas fa-shield-check"></i>
                    </div>
                </div>
                <div class="stat-card-value">98%</div>
                <div class="stat-card-change positive">
                    <i class="fas fa-arrow-up"></i>
                    <span>Excellent</span>
                </div>
            </div>
        </div>
        
        <div class="content-card">
            <div class="content-card-header">
                <h3 class="content-card-title">Compliance Reports</h3>
                <button class="btn btn-primary" onclick="generateReport()">
                    <i class="fas fa-download"></i>
                    Generate Report
                </button>
            </div>
            <div class="content-card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <div style="padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #10b981;">
                        <h4 style="margin-bottom: 10px; color: #333;">MASAK Compliance</h4>
                        <p style="color: #666; margin-bottom: 15px;">Turkish regulatory compliance reporting</p>
                        <button class="btn btn-outline btn-small">Download Report</button>
                    </div>
                    
                    <div style="padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #667eea;">
                        <h4 style="margin-bottom: 10px; color: #333;">SPK Compliance</h4>
                        <p style="color: #666; margin-bottom: 15px;">Capital Markets Board compliance</p>
                        <button class="btn btn-outline btn-small">Download Report</button>
                    </div>
                    
                    <div style="padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <h4 style="margin-bottom: 10px; color: #333;">Audit Trail</h4>
                        <p style="color: #666; margin-bottom: 15px;">Complete transaction and access logs</p>
                        <button class="btn btn-outline btn-small">Download Report</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getSettingsContent() {
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 30px;">
            <div class="content-card">
                <div class="content-card-header">
                    <h3 class="content-card-title">Account Information</h3>
                </div>
                <div class="content-card-body">
                    <form class="settings-form">
                        <div class="form-group">
                            <label>First Name</label>
                            <input type="text" value="${currentUser.firstName}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Last Name</label>
                            <input type="text" value="${currentUser.lastName}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" value="${currentUser.email}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Company</label>
                            <input type="text" value="${currentUser.company}" readonly>
                        </div>
                        <button type="button" class="btn btn-primary" onclick="editProfile()">Edit Profile</button>
                    </form>
                </div>
            </div>
            
            <div class="content-card">
                <div class="content-card-header">
                    <h3 class="content-card-title">Security Settings</h3>
                </div>
                <div class="content-card-body">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; margin-bottom: 5px;">Two-Factor Authentication</div>
                                <div style="font-size: 0.9rem; color: #666;">Add an extra layer of security</div>
                            </div>
                            <button class="btn btn-outline btn-small">Enable</button>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; margin-bottom: 5px;">API Keys</div>
                                <div style="font-size: 0.9rem; color: #666;">Manage your API access keys</div>
                            </div>
                            <button class="btn btn-outline btn-small">Manage</button>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; margin-bottom: 5px;">Change Password</div>
                                <div style="font-size: 0.9rem; color: #666;">Update your account password</div>
                            </div>
                            <button class="btn btn-outline btn-small">Change</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .settings-form .form-group {
            margin-bottom: 20px;
        }
        
        .settings-form label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #333;
        }
        
        .settings-form input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 14px;
            background: #f8fafc;
        }
        </style>
    `;
}

function getBillingContent() {
    const trialDaysLeft = Math.ceil((currentUser.trialEndsAt - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
        <div class="stats-grid" style="margin-bottom: 30px;">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Current Plan</span>
                    <div class="stat-card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <i class="fas fa-crown"></i>
                    </div>
                </div>
                <div class="stat-card-value" style="font-size: 1.5rem; text-transform: capitalize;">${currentUser.plan}</div>
                <div class="stat-card-change ${currentUser.subscriptionStatus === 'trial' ? 'warning' : 'positive'}">
                    <i class="fas fa-${currentUser.subscriptionStatus === 'trial' ? 'clock' : 'check'}"></i>
                    <span>${currentUser.subscriptionStatus === 'trial' ? `${trialDaysLeft} days left in trial` : 'Active subscription'}</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Monthly Cost</span>
                    <div class="stat-card-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                </div>
                <div class="stat-card-value">${currentUser.plan === 'starter' ? '$299' : currentUser.plan === 'professional' ? '$899' : '$2,499'}</div>
                <div class="stat-card-change positive">
                    <i class="fas fa-calendar"></i>
                    <span>Per month</span>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 30px;">
            <div class="content-card">
                <div class="content-card-header">
                    <h3 class="content-card-title">Subscription Details</h3>
                </div>
                <div class="content-card-body">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #e1e5e9;">
                            <span style="font-weight: 600;">Plan</span>
                            <span style="text-transform: capitalize;">${currentUser.plan}</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #e1e5e9;">
                            <span style="font-weight: 600;">Status</span>
                            <span class="status-badge ${currentUser.subscriptionStatus === 'active' ? 'active' : 'warning'}" style="text-transform: capitalize;">${currentUser.subscriptionStatus}</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #e1e5e9;">
                            <span style="font-weight: 600;">${currentUser.subscriptionStatus === 'trial' ? 'Trial Ends' : 'Next Billing'}</span>
                            <span>${formatDate(currentUser.trialEndsAt)}</span>
                        </div>
                        
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            ${currentUser.subscriptionStatus === 'trial' ? 
                                '<button class="btn btn-primary" onclick="upgradePlan()">Upgrade Now</button>' :
                                '<button class="btn btn-outline" onclick="changePlan()">Change Plan</button>'
                            }
                            <button class="btn btn-outline" onclick="downloadInvoice()">Download Invoice</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="content-card">
                <div class="content-card-header">
                    <h3 class="content-card-title">Payment Method</h3>
                </div>
                <div class="content-card-body">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8fafc; border-radius: 8px;">
                            <div style="width: 40px; height: 40px; background: #667eea; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white;">
                                <i class="fas fa-credit-card"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600; margin-bottom: 5px;">•••• •••• •••• 4242</div>
                                <div style="font-size: 0.9rem; color: #666;">Expires 12/25</div>
                            </div>
                            <button class="btn btn-outline btn-small">Update</button>
                        </div>
                        
                        <button class="btn btn-outline" onclick="addPaymentMethod()">
                            <i class="fas fa-plus"></i>
                            Add Payment Method
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Event Handlers
function addWallet() {
    alert('Add wallet functionality would open a modal to connect new wallets.');
}

function editWallet(walletId) {
    alert(`Edit wallet ${walletId} functionality would open a configuration modal.`);
}

function createAlert() {
    alert('Create alert functionality would open a modal to configure new alerts.');
}

function resolveAlert(alertId) {
    const alert = mockData.alerts.find(a => a.id === alertId);
    if (alert) {
        alert.status = 'resolved';
        loadDashboardSection('alerts');
    }
}

function createRebalanceRule() {
    alert('Create rebalance rule functionality would open a configuration modal.');
}

function editRebalanceRule(ruleId) {
    alert(`Edit rebalance rule ${ruleId} functionality would open a configuration modal.`);
}

function toggleRebalanceRule(ruleId) {
    const rule = mockData.rebalanceRules.find(r => r.id === ruleId);
    if (rule) {
        rule.enabled = !rule.enabled;
        loadDashboardSection('rebalancing');
    }
}

function generateReport() {
    alert('Report generation functionality would create and download compliance reports.');
}

function editProfile() {
    alert('Edit profile functionality would allow updating user information.');
}

function upgradePlan() {
    alert('Upgrade plan functionality would show pricing options and payment flow.');
}

function changePlan() {
    alert('Change plan functionality would show available plan options.');
}

function downloadInvoice() {
    alert('Download invoice functionality would generate and download billing invoices.');
}

function addPaymentMethod() {
    alert('Add payment method functionality would show payment form.');
}

// Pricing Toggle
function togglePricing() {
    const toggle = document.getElementById('pricing-toggle');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const annualPrices = document.querySelectorAll('.annual-price');
    
    if (toggle.checked) {
        monthlyPrices.forEach(price => price.style.display = 'none');
        annualPrices.forEach(price => price.style.display = 'inline');
    } else {
        monthlyPrices.forEach(price => price.style.display = 'inline');
        annualPrices.forEach(price => price.style.display = 'none');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Pricing toggle
    const pricingToggle = document.getElementById('pricing-toggle');
    if (pricingToggle) {
        pricingToggle.addEventListener('change', togglePricing);
    }
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (login(email, password)) {
                // Success handled in login function
            } else {
                alert('Invalid credentials. Try demo@vaultscope.com / demo123');
            }
        });
    }
    
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userData = {
                firstName: document.getElementById('signup-firstname').value,
                lastName: document.getElementById('signup-lastname').value,
                email: document.getElementById('signup-email').value,
                company: document.getElementById('signup-company').value,
                password: document.getElementById('signup-password').value,
                plan: document.getElementById('signup-plan').value
            };
            
            if (signup(userData)) {
                // Success handled in signup function
            } else {
                alert('Signup failed. Please try again.');
            }
        });
    }
    
    // Dashboard navigation
    document.addEventListener('click', function(e) {
        if (e.target.matches('.nav-item') || e.target.closest('.nav-item')) {
            e.preventDefault();
            const navItem = e.target.matches('.nav-item') ? e.target : e.target.closest('.nav-item');
            const section = navItem.getAttribute('data-section');
            if (section) {
                loadDashboardSection(section);
            }
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Initialize demo data on page load
console.log('VaultScope SaaS Application Loaded');
console.log('Demo credentials: demo@vaultscope.com / demo123');
console.log('Or click "Request Demo" for instant access');