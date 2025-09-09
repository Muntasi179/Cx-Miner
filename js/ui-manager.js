// UI management system
class UIManager {
    constructor() {
        this.modals = {};
        this.toastContainer = document.getElementById('toastContainer');
        this.modalsContainer = document.getElementById('modals-container');
    }

    // Initialize UI
    init() {
        this.createToastSystem();
        this.createModals();
        this.setupEventListeners();
        this.updateAllDisplays();
    }

    // Create toast system
    createToastSystem() {
        const toastTemplate = `
            <div class="toast" id="toast">
                <div class="toast-icon"><i class="fas fa-info-circle"></i></div>
                <div class="toast-content">
                    <div class="toast-title">Information</div>
                    <div class="toast-message">This is a notification message</div>
                </div>
                <button class="toast-close">&times;</button>
            </div>
        `;
        this.toastContainer.innerHTML = toastTemplate;
        
        // Set up toast close button
        document.querySelector('.toast-close').addEventListener('click', this.hideToast);
    }

    // Show toast notification
    showToast(message, type = 'info', title = null) {
        const toast = document.getElementById('toast');
        const toastIcon = toast.querySelector('.toast-icon');
        const toastTitle = toast.querySelector('.toast-title');
        const toastMessage = toast.querySelector('.toast-message');
        
        // Set toast content
        toastMessage.textContent = message;
        
        // Set title based on type if not provided
        if (!title) {
            switch(type) {
                case 'success': title = 'Success'; break;
                case 'error': title = 'Error'; break;
                case 'warning': title = 'Warning'; break;
                default: title = 'Information';
            }
        }
        toastTitle.textContent = title;
        
        // Set icon based on type
        let iconClass = 'fas fa-info-circle';
        switch(type) {
            case 'success': iconClass = 'fas fa-check-circle'; break;
            case 'error': iconClass = 'fas fa-exclamation-circle'; break;
            case 'warning': iconClass = 'fas fa-exclamation-triangle'; break;
        }
        toastIcon.innerHTML = `<i class="${iconClass}"></i>`;
        
        // Set toast class
        toast.className = 'toast';
        toast.classList.add(`toast-${type}`);
        
        // Show toast
        toast.classList.add('show');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideToast();
        }, 5000);
    }

    // Hide toast
    hideToast() {
        const toast = document.getElementById('toast');
        toast.classList.remove('show');
    }

    // Create all modals
    createModals() {
        const modalsHTML = `
            <!-- Wallet Modal -->
            <div class="modal" id="walletModal">
                ${this.createWalletModalContent()}
            </div>

            <!-- Boosts Modal -->
            <div class="modal" id="boostsModal">
                ${this.createBoostsModalContent()}
            </div>

            <!-- Shop Modal -->
            <div class="modal" id="shopModal">
                ${this.createShopModalContent()}
            </div>

            <!-- Tasks Modal -->
            <div class="modal" id="tasksModal">
                ${this.createTasksModalContent()}
            </div>

            <!-- Leaderboard Modal -->
            <div class="modal" id="leaderboardModal">
                ${this.createLeaderboardModalContent()}
            </div>

            <!-- Notifications Modal -->
            <div class="modal" id="notificationsModal">
                ${this.createNotificationsModalContent()}
            </div>

            <!-- Profile Modal -->
            <div class="modal" id="profileModal">
                ${this.createProfileModalContent()}
            </div>

            <!-- Settings Modal -->
            <div class="modal" id="settingsModal">
                ${this.createSettingsModalContent()}
            </div>
        `;

        this.modalsContainer.innerHTML = modalsHTML;
        this.registerModals();
    }

    // Create wallet modal content
    createWalletModalContent() {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Connect Wallet</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="wallet-options">
                        <div class="wallet-option" id="tonKeeperOption">
                            <div class="wallet-option-icon"><i class="fas fa-wallet"></i></div>
                            <div class="wallet-option-content">
                                <div class="wallet-option-title">Tonkeeper</div>
                                <div class="wallet-option-desc">Connect using Tonkeeper wallet</div>
                            </div>
                            <div class="wallet-option-action" id="connectTonKeeper">Connect</div>
                        </div>
                        <div class="wallet-option" id="tonHubOption">
                            <div class="wallet-option-icon"><i class="fas fa-wallet"></i></div>
                            <div class="wallet-option-content">
                                <div class="wallet-option-title">TonHub</div>
                                <div class="wallet-option-desc">Connect using TonHub wallet</div>
                            </div>
                            <div class="wallet-option-action" id="connectTonHub">Connect</div>
                        </div>
                        <div class="wallet-option" id="telegramWalletOption">
                            <div class="wallet-option-icon"><i class="fab fa-telegram"></i></div>
                            <div class="wallet-option-content">
                                <div class="wallet-option-title">Telegram Wallet</div>
                                <div class="wallet-option-desc">Connect using Telegram built-in wallet</div>
                            </div>
                            <div class="wallet-option-action" id="connectTelegramWallet">Connect</div>
                        </div>
                    </div>
                    <div id="walletConnectionStatus" style="margin-top: 20px; padding: 15px; background: var(--bg-tertiary); border-radius: var(--radius-md); display: none;">
                        <h4 style="margin-bottom: 10px;">Connection Status</h4>
                        <div id="walletStatusText">Connecting...</div>
                        <div class="spinner" style="margin: 10px auto;"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeWalletModal">Cancel</button>
                    <button class="btn" id="disconnectWallet" style="display: none;">Disconnect</button>
                </div>
            </div>
        `;
    }

        // Create boosts modal content
    createBoostsModalContent() {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Boosts</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="boost-items">
                        <div class="boost-item" data-id="energyRegen" data-price="0.5" data-currency="ton">
                            <div class="boost-item-icon"><i class="fas fa-bolt"></i></div>
                            <div class="boost-item-content">
                                <div class="boost-item-title">Energy Regen Boost</div>
                                <div class="boost-item-desc">Increase energy regeneration by 0.2/s</div>
                            </div>
                            <div class="boost-item-action">
                                <span class="currency-badge ton-badge"><i class="fas fa-coins"></i> 0.5 TON</span>
                            </div>
                        </div>
                        <div class="boost-item" data-id="multitap" data-price="1" data-currency="ton">
                            <div class="boost-item-icon"><i class="fas fa-hand-point-up"></i></div>
                            <div class="boost-item-content">
                                <div class="boost-item-title">Multitap Upgrade</div>
                                <div class="boost-item-desc">Get +1 tap per click</div>
                            </div>
                            <div class="boost-item-action">
                                <span class="currency-badge ton-badge"><i class="fas fa-coins"></i> 1 TON</span>
                            </div>
                        </div>
                        <div class="boost-item" data-id="multiplier" data-price="10" data-currency="stars">
                            <div class="boost-item-icon"><i class="fas fa-gem"></i></div>
                            <div class="boost-item-content">
                                <div class="boost-item-title">2x Multiplier</div>
                                <div class="boost-item-desc">Double your earnings for 30 minutes</div>
                            </div>
                            <div class="boost-item-action">
                                <span class="currency-badge star-badge"><i class="fas fa-star"></i> 10 Stars</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeBoostsModal">Cancel</button>
                </div>
            </div>
        `;
    }

    // Create shop modal content
    createShopModalContent() {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Premium Shop</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="shop-items">
                        <div class="shop-item" data-id="energyPack" data-price="0.2" data-currency="ton">
                            <div class="shop-item-icon"><i class="fas fa-bolt"></i></div>
                            <div class="shop-item-title">Energy Pack</div>
                            <div class="shop-item-desc">Instantly refill your energy</div>
                            <div class="shop-item-price">
                                <span class="currency-badge ton-badge"><i class="fas fa-coins"></i> 0.2 TON</span>
                            </div>
                        </div>
                        <div class="shop-item" data-id="starterPack" data-price="1.5" data-currency="ton">
                            <div class="shop-item-icon"><i class="fas fa-coins"></i></div>
                            <div class="shop-item-title">Starter Pack</div>
                            <div class="shop-item-desc">500 CX + Energy Refill</div>
                            <div class="shop-item-price">
                                <span class="currency-badge ton-badge"><i class="fas fa-coins"></i> 1.5 TON</span>
                            </div>
                        </div>
                        <div class="shop-item" data-id="premiumPack" data-price="15" data-currency="stars">
                            <div class="shop-item-icon"><i class="fas fa-crown"></i></div>
                            <div class="shop-item-title">Premium Pack</div>
                            <div class="shop-item-desc">Permanent +1 Tap</div>
                            <div class="shop-item-price">
                                <span class="currency-badge star-badge"><i class="fas fa-star"></i> 15 Stars</span>
                            </div>
                        </div>
                        <div class="shop-item" data-id="dragonPack" data-price="25" data-currency="stars">
                            <div class="shop-item-icon"><i class="fas fa-dragon"></i></div>
                            <div class="shop-item-title">Dragon Pack</div>
                            <div class="shop-item-desc">2x Multiplier (1h)</div>
                            <div class="shop-item-price">
                                <span class="currency-badge star-badge"><i class="fas fa-star"></i> 25 Stars</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeShopModal">Cancel</button>
                </div>
            </div>
        `;
    }

    // Create tasks modal content
    createTasksModalContent() {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Daily Tasks</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="task-items">
                        <div class="task-item">
                            <div class="task-item-check"></div>
                            <div class="task-item-content">
                                <div class="task-item-title">Mine 100 times</div>
                                <div class="task-item-desc">Tap the mining core 100 times</div>
                            </div>
                            <div class="task-item-reward">+20 CX</div>
                        </div>
                        <div class="task-item">
                            <div class="task-item-check"></div>
                            <div class="task-item-content">
                                <div class="task-item-title">Reach 500 CX</div>
                                <div class="task-item-desc">Accumulate 500 CX in your balance</div>
                            </div>
                            <div class="task-item-reward">+50 CX</div>
                        </div>
                        <div class="task-item">
                            <div class="task-item-check"></div>
                            <div class="task-item-content">
                                <div class="task-item-title">Invite a Friend</div>
                                <div class="task-item-desc">Share your referral link</div>
                            </div>
                            <div class="task-item-reward">+100 CX</div>
                        </div>
                        <div class="task-item">
                            <div class="task-item-check completed"></div>
                            <div class="task-item-content">
                                <div class="task-item-title">Connect Wallet</div>
                                <div class="task-item-desc">Connect your TON wallet</div>
                            </div>
                            <div class="task-item-reward">+30 CX</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeTasksModal">Close</button>
                    <button class="btn">Claim All</button>
                </div>
            </div>
        `;
    }

    // Create leaderboard modal content
    createLeaderboardModalContent() {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Leaderboard</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="leaderboard" id="leaderboardList">
                        <!-- Leaderboard will be populated dynamically -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeLeaderboardModal">Close</button>
                </div>
            </div>
        `;
    }

    // Create notifications modal content
    createNotificationsModalContent() {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Notifications</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="notification-items" id="notificationsList">
                        <!-- Notifications will be populated dynamically -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeNotificationsModal">Close</button>
                    <button class="btn" id="clearNotifications">Clear All</button>
                </div>
            </div>
        `;
    }

    // Create profile modal content
    createProfileModalContent() {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Your Profile</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img class="user-avatar" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" alt="Profile" style="width: 80px; height: 80px;">
                        <h3 id="modalUsername">User</h3>
                        <p>Level <span class="level-badge">1</span></p>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                        <div style="background: var(--bg-tertiary); padding: 15px; border-radius: var(--radius-md); text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: 700;" id="modalTotalTaps">0</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Total Taps</div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 15px; border-radius: var(--radius-md); text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: 700;" id="modalEarned">0</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Total Earned</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px;">Wallet Balances</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="background: var(--bg-tertiary); padding: 15px; border-radius: var(--radius-md); text-align: center;">
                                <div style="font-size: 1.2rem; font-weight: 700; color: #0088cc;" id="modalTonBalance">0 TON</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">TON Balance</div>
                            </div>
                            <div style="background: var(--bg-tertiary); padding: 15px; border-radius: var(--radius-md); text-align: center;">
                                <div style="font-size: 1.2rem; font-weight: 700; color: #FFD700;" id="modalStarBalance">0 Stars</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">Star Balance</div>
                            </div>
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px;">Referral Link</h4>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" value="https://t.me/CXMinerBot?start=ref123" readonly style="flex: 1; background: var(--bg-tertiary); border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 10px; color: var(--text-primary);">
                            <button class="btn btn-sm">Copy</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeProfileModal">Close</button>
                    <button class="btn">Share Profile</button>
                </div>
            </div>
        `;
    }

    // Create settings modal content
    createSettingsModalContent() {
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Settings</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px;">Sound Effects</h4>
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Enable Sounds</span>
                            <input type="checkbox" checked>
                        </label>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px;">Vibration</h4>
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Enable Vibration</span>
                            <input type="checkbox" checked>
                        </label>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px;">Theme</h4>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-sm btn-secondary">Light</button>
                            <button class="btn btn-sm">Dark</button>
                        </div>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 10px;">Language</h4>
                        <select style="width: 100%; background: var(--bg-tertiary); border: 1px solid var(--card-border); border-radius: var(--radius-md); padding: 10px; color: var(--text-primary);">
                            <option>English</option>
                            <option>Russian</option>
                            <option>Spanish</option>
                            <option>Chinese</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeSettingsModal">Cancel</button>
                    <button class="btn">Save Changes</button>
                </div>
            </div>
        `;
    }

    // Register all modals
    registerModals() {
        this.modals = {
            wallet: document.getElementById('walletModal'),
            boosts: document.getElementById('boostsModal'),
            shop: document.getElementById('shopModal'),
            tasks: document.getElementById('tasksModal'),
            leaderboard: document.getElementById('leaderboardModal'),
            notifications: document.getElementById('notificationsModal'),
            profile: document.getElementById('profileModal'),
            settings: document.getElementById('settingsModal')
        };
    }

    // Show modal
    showModal(modalId) {
        if (this.modals[modalId]) {
            this.modals[modalId].classList.add('show');
        }
    }

    // Hide modal
    hideModal(modalId) {
        if (this.modals[modalId]) {
            this.modals[modalId].classList.remove('show');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Set up modal buttons
        document.getElementById('walletBtn').addEventListener('click', () => {
            this.showModal('wallet');
        });
        
        document.getElementById('notificationsBtn').addEventListener('click', () => {
            this.updateNotifications();
            this.showModal('notifications');
        });
        
        document.getElementById('profileBtn').addEventListener('click', () => {
            document.getElementById('modalTotalTaps').textContent = gameState.totalTaps;
            document.getElementById('modalEarned').textContent = Math.floor(gameState.points);
            this.updateWalletDisplay();
            this.showModal('profile');
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showModal('settings');
        });
        
        document.getElementById('boostsBtn').addEventListener('click', () => {
            this.showModal('boosts');
        });
        
        document.getElementById('shopBtn').addEventListener('click', () => {
            this.showModal('shop');
        });
        
        document.getElementById('tasksBtn').addEventListener('click', () => {
            this.showModal('tasks');
        });
        
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            this.updateLeaderboard();
            this.showModal('leaderboard');
        });
        
        // Set up wallet connection buttons
        document.getElementById('connectTonKeeper').addEventListener('click', () => {
            tonConnectManager.connectWallet('tonkeeper');
        });
        
        document.getElementById('connectTonHub').addEventListener('click', () => {
            tonConnectManager.connectWallet('tonhub');
        });
        
        document.getElementById('connectTelegramWallet').addEventListener('click', () => {
            this.showToast('Telegram wallet integration coming soon', 'info');
        });
        
        document.getElementById('disconnectWallet').addEventListener('click', () => {
            tonConnectManager.disconnectWallet();
        });
        
        // Set up purchase buttons
        document.querySelectorAll('.boost-item, .shop-item').forEach(item => {
            item.addEventListener('click', purchaseManager.handlePurchaseClick.bind(purchaseManager));
        });
        
        // Close modal buttons
        document.getElementById('closeWalletModal').addEventListener('click', () => {
            this.hideModal('wallet');
        });
        
        document.getElementById('closeNotificationsModal').addEventListener('click', () => {
            this.hideModal('notifications');
        });
        
        document.getElementById('clearNotifications').addEventListener('click', () => {
            gameState.notifications = [];
            this.updateNotifications();
            gameState.save();
        });
        
        document.getElementById('closeProfileModal').addEventListener('click', () => {
            this.hideModal('profile');
        });
        
        document.getElementById('closeSettingsModal').addEventListener('click', () => {
            this.hideModal('settings');
        });
        
        document.getElementById('closeBoostsModal').addEventListener('click', () => {
            this.hideModal('boosts');
        });
        
        document.getElementById('closeShopModal').addEventListener('click', () => {
            this.hideModal('shop');
        });
        
        document.getElementById('closeTasksModal').addEventListener('click', () => {
            this.hideModal('tasks');
        });
        
        document.getElementById('closeLeaderboardModal').addEventListener('click', () => {
            this.hideModal('leaderboard');
        });
        
        // Close modals when clicking outside or on close button
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.remove('show');
                }
            });
        });
        
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
        
        // Initialize navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Initialize mining object interaction
        const miningObject = document.getElementById('miningObject');
        if (miningObject) {
            miningObject.addEventListener('click', this.handleMiningClick.bind(this));
        }
    }

    // Handle mining click
    handleMiningClick(e) {
        if (gameState.energy < 1) {
            this.showToast('Not enough energy!', 'error');
            return;
        }
        
        // Calculate click position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create effects
        createTapEffect(e.clientX, e.clientY);
        createParticles(e.clientX, e.clientY);
        
        // Process mining
        const result = gameState.mine();
        
        if (result.success) {
            // Update displays
            this.updatePointsDisplay();
            this.updateEnergyDisplay();
            this.updateTotalTapsDisplay();
            
            // Show earning text
            this.showToast(`+${result.pointsEarned} CX`, 'success');
            
            // Check for level up
            if (result.leveledUp) {
                this.showToast(`Level Up! You're now level ${result.newLevel}`, 'success', 'Congratulations!');
                this.showToast(`+5 Stars for leveling up!`, 'success');
            }
            
            // Save game state
            gameState.save();
        }
    }

    // Update points display
    updatePointsDisplay() {
        document.getElementById('pointsBalance').textContent = Math.floor(gameState.points);
        document.getElementById('modalEarned').textContent = Math.floor(gameState.points);
        
        // Update leaderboard with current user's points
        const userIndex = gameState.leaderboard.findIndex(player => player.username === "User");
        if (userIndex !== -1) {
            gameState.leaderboard[userIndex].points = Math.floor(gameState.points);
            gameState.leaderboard[userIndex].level = gameState.level;
        }
    }
    
    // Update energy display
    updateEnergyDisplay() {
        const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
        document.getElementById('energyBarFill').style.width = `${energyPercent}%`;
        document.getElementById('energyDisplay').textContent = `${Math.floor(gameState.energy)} / ${gameState.maxEnergy}`;
    }
    
    // Update energy regen display with fixed decimal places
    updateEnergyRegenDisplay() {
        // Fix the floating point precision issue
        const cleanRegenValue = parseFloat(gameState.energyRegen.toFixed(1));
        document.getElementById('energyRegenStat').textContent = `${cleanRegenValue}/s`;
    }
    
    // Update total taps display
    updateTotalTapsDisplay() {
        document.getElementById('totalTapsStat').textContent = gameState.totalTaps;
        document.getElementById('modalTotalTaps').textContent = gameState.totalTaps;
    }
    
    // Update wallet balances display
    updateWalletDisplay() {
        document.getElementById('modalTonBalance').textContent = `${gameState.tonBalance.toFixed(2)} TON`;
        document.getElementById('modalStarBalance').textContent = `${gameState.starBalance} Stars`;
    }
    
    // Update leaderboard
    updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        // Sort leaderboard by points
        const sortedLeaderboard = [...gameState.leaderboard].sort((a, b) => b.points - a.points);
        
        sortedLeaderboard.forEach((player, index) => {
            const rank = index + 1;
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = 'leaderboard-item';
            
            leaderboardItem.innerHTML = `
                <div class="leaderboard-rank">${rank}</div>
                <img class="leaderboard-avatar" src="${player.avatar}" alt="${player.username}">
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${player.username}</div>
                    <div class="leaderboard-value">Level ${player.level}</div>
                </div>
                <div class="leaderboard-score">${player.points.toLocaleString()} CX</div>
            `;
            
            leaderboardList.appendChild(leaderboardItem);
        });
    }
    
    // Update notifications
    updateNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        notificationsList.innerHTML = '';
        
        // Sort notifications by time (newest first)
        const sortedNotifications = [...gameState.notifications].sort((a, b) => new Date(b.time) - new Date(a.time));
        
        sortedNotifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
            
            const timeAgo = getTimeAgo(new Date(notification.time));
            
            notificationItem.innerHTML = `
                <div class="notification-icon"><i class="fas fa-bell"></i></div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
            `;
            
            notificationItem.addEventListener('click', () => {
                notification.read = true;
                notificationItem.classList.remove('unread');
                this.updateNotificationBadge();
                gameState.save();
            });
            
            notificationsList.appendChild(notificationItem);
        });
        
        this.updateNotificationBadge();
    }
    
    // Update notification badge
    updateNotificationBadge() {
        const unreadCount = gameState.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    // Update all displays
    updateAllDisplays() {
        this.updatePointsDisplay();
        this.updateEnergyDisplay();
        this.updateEnergyRegenDisplay();
        this.updateTotalTapsDisplay();
        this.updateWalletDisplay();
        this.updateLeaderboard();
        this.updateNotifications();
        
        document.querySelector('.level-badge').textContent = gameState.level;
        
        if (gameState.multiplierActive) {
            document.getElementById('multiplierBadge').style.display = 'block';
        }
        
        if (gameState.walletConnected) {
            document.getElementById('walletBtn').classList.add('wallet-connected');
            document.getElementById('disconnectWallet').style.display = 'block';
        }
    }
}

// Create global UI manager instance
const uiManager = new UIManager();