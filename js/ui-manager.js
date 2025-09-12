// UI management and updates
const UI = {
    // Initialize UI elements
    init() {
        this.updateAllDisplays();
        this.setupEventListeners();
    },
    
    // Update all UI displays
    updateAllDisplays() {
        this.updatePointsDisplay();
        this.updateEnergyDisplay();
        this.updateEnergyRegenDisplay();
        this.updateTotalTapsDisplay();
        this.updateWalletDisplay();
        this.updateLevelDisplay();
        this.updateStreakDisplay();
        this.updateLeaderboard();
        this.updateNotifications();
    },
    
    // Update points display
    updatePointsDisplay() {
        const points = Math.floor(GameState.data.points);
        document.getElementById('pointsBalance').textContent = points;
        document.getElementById('modalEarned').textContent = points;
        
        // Update leaderboard with current user's points
        const userIndex = GameState.data.leaderboard.findIndex(player => player.username === "User");
        if (userIndex !== -1) {
            GameState.data.leaderboard[userIndex].points = points;
            GameState.data.leaderboard[userIndex].level = GameState.data.level;
        }
    },
    
    // Update energy display
    updateEnergyDisplay() {
        const energyPercent = (GameState.data.energy / GameState.data.maxEnergy) * 100;
        document.getElementById('energyBarFill').style.width = `${energyPercent}%`;
        document.getElementById('energyDisplay').textContent = 
            `${Math.floor(GameState.data.energy)} / ${GameState.data.maxEnergy}`;
    },
    
    // Update energy regen display with fixed decimal places
    updateEnergyRegenDisplay() {
        const cleanRegenValue = parseFloat(GameState.data.energyRegen.toFixed(1));
        document.getElementById('energyRegenStat').textContent = `${cleanRegenValue}/s`;
    },
    
    // Update total taps display
    updateTotalTapsDisplay() {
        document.getElementById('totalTapsStat').textContent = GameState.data.totalTaps;
        document.getElementById('modalTotalTaps').textContent = GameState.data.totalTaps;
    },
    
    // Update wallet balances display
    updateWalletDisplay() {
        document.getElementById('modalTonBalance').textContent = `${GameState.data.tonBalance.toFixed(2)} TON`;
        document.getElementById('modalStarBalance').textContent = `${GameState.data.starBalance} Stars`;
    },
    
    // Update level display
    updateLevelDisplay() {
        document.getElementById('levelBadge').textContent = GameState.data.level;
        document.getElementById('modalLevel').textContent = GameState.data.level;
    },
    
    // Update wallet connection status
    updateWalletStatus(connected) {
        const walletBtn = document.getElementById('walletBtn');
        const disconnectBtn = document.getElementById('disconnectWallet');
        
        if (connected) {
            walletBtn.classList.add('wallet-connected');
            disconnectBtn.style.display = 'block';
        } else {
            walletBtn.classList.remove('wallet-connected');
            disconnectBtn.style.display = 'none';
        }
    },
    
    // Update streak display
    updateStreakDisplay() {
        document.getElementById('streakCount').textContent = `${GameState.data.streakCount} days`;
    },
    
    // Update leaderboard
    updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        // Sort leaderboard by points
        const sortedLeaderboard = [...GameState.data.leaderboard].sort((a, b) => b.points - a.points);
        
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
    },
    
    // Update notifications
    updateNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        notificationsList.innerHTML = '';
        
        // Sort notifications by time (newest first)
        const sortedNotifications = [...GameState.data.notifications].sort((a, b) => new Date(b.time) - new Date(a.time));
        
        sortedNotifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
            
            const timeAgo = GameState.getTimeAgo(new Date(notification.time));
            
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
                GameState.save();
            });
            
            notificationsList.appendChild(notificationItem);
        });
        
        this.updateNotificationBadge();
    },
    
    // Update notification badge
    updateNotificationBadge() {
        const unreadCount = GameState.data.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    },
    
    // Show wallet loading state
    showWalletLoading(show, message = 'Connecting...') {
        const statusElement = document.getElementById('walletConnectionStatus');
        const statusText = document.getElementById('walletStatusText');
        
        if (show) {
            statusElement.style.display = 'block';
            statusText.textContent = message;
        } else {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 2000);
        }
    },
    
    // Show toast notification
    showToast(message, type = 'info', title = null) {
        const toastContainer = document.getElementById('toastContainer');
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Set icon based on type
        let iconClass = 'fas fa-info-circle';
        switch(type) {
            case 'success': iconClass = 'fas fa-check-circle'; break;
            case 'error': iconClass = 'fas fa-exclamation-circle'; break;
            case 'warning': iconClass = 'fas fa-exclamation-triangle'; break;
        }
        
        // Set title based on type if not provided
        if (!title) {
            switch(type) {
                case 'success': title = 'Success'; break;
                case 'error': title = 'Error'; break;
                case 'warning': title = 'Warning'; break;
                default: title = 'Information';
            }
        }
        
        toast.innerHTML = `
            <div class="toast-icon"><i class="${iconClass}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Show toast with animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Add close button event
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.hideToast(toast);
        });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideToast(toast);
        }, 5000);
        
        return toast;
    },
    
    // Hide toast notification
    hideToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Mining object click
        document.getElementById('miningObject').addEventListener('click', this.handleMiningClick);
        
        // Modal buttons
        document.getElementById('walletBtn').addEventListener('click', () => {
            document.getElementById('walletModal').classList.add('show');
        });
        
        document.getElementById('notificationsBtn').addEventListener('click', () => {
            document.getElementById('notificationsModal').classList.add('show');
        });
        
        document.getElementById('profileBtn').addEventListener('click', () => {
            document.getElementById('modalTotalTaps').textContent = GameState.data.totalTaps;
            document.getElementById('modalEarned').textContent = Math.floor(GameState.data.points);
            this.updateWalletDisplay();
            document.getElementById('profileModal').classList.add('show');
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('settingsModal').classList.add('show');
        });
        
        document.getElementById('boostsBtn').addEventListener('click', () => {
            document.getElementById('boostsModal').classList.add('show');
        });
        
        document.getElementById('shopBtn').addEventListener('click', () => {
            document.getElementById('shopModal').classList.add('show');
        });
        
        document.getElementById('tasksBtn').addEventListener('click', () => {
            document.getElementById('tasksModal').classList.add('show');
        });
        
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            this.updateLeaderboard();
            document.getElementById('leaderboardModal').classList.add('show');
        });
        
        // Wallet connection buttons
        document.getElementById('connectTonKeeper').addEventListener('click', () => {
            TONConnect.connectWallet('tonkeeper');
        });
        
        document.getElementById('connectTonHub').addEventListener('click', () => {
            TONConnect.connectWallet('tonhub');
        });
        
        document.getElementById('connectTelegramWallet').addEventListener('click', () => {
            this.showToast('Telegram wallet integration coming soon', 'info');
        });
        
        document.getElementById('disconnectWallet').addEventListener('click', () => {
            TONConnect.disconnectWallet();
        });
        
        // Daily streak claim
        document.getElementById('claimStreakBtn').addEventListener('click', () => {
            const reward = GameState.claimDailyStreak();
            if (reward) {
                this.updatePointsDisplay();
                this.updateStreakDisplay();
                this.showToast(`Daily reward claimed! +${reward} CX (${GameState.data.streakCount} day streak)`, 'success');
            } else {
                this.showToast('You have already claimed your daily reward today!', 'error');
            }
        });
        
        // Referral system
        document.getElementById('copyReferralBtn').addEventListener('click', this.copyReferralLink);
        document.getElementById('shareProfileBtn').addEventListener('click', this.shareProfile);
        
        // Settings
        document.getElementById('saveSettingsBtn').addEventListener('click', this.saveSettings);
    },
    
    // Handle mining click
    handleMiningClick(e) {
        const now = Date.now();
        if (now - GameState.data.lastTapTime < GameState.data.tapCooldown) {
            return;
        }
        GameState.data.lastTapTime = now;
        
        if (GameState.data.energy < 1) {
            UI.showToast('Not enough energy!', 'error');
            return;
        }
        
        // Calculate click position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create effects
        Effects.createTapEffect(e.clientX, e.clientY);
        Effects.createParticles(e.clientX, e.clientY);
        
        // Play sound and vibration
        Effects.playSound();
        Effects.vibrate();
        
        // Deduct energy
        GameState.data.energy = Math.max(0, GameState.data.energy - 1);
        UI.updateEnergyDisplay();
        
        // Calculate points earned
        let pointsEarned = GameState.data.multitap;
        if (GameState.data.multiplierActive) {
            pointsEarned *= 2;
        }
        
        // Add points
        GameState.data.points += pointsEarned;
        GameState.data.totalTaps += 1;
        
        // Update displays
        UI.updatePointsDisplay();
        UI.updateTotalTapsDisplay();
        
        // Show earning text
        UI.showToast(`+${pointsEarned} CX`, 'success');
        
        // Check for level up
        if (GameState.checkLevelUp()) {
            UI.updateLevelDisplay();
            UI.updateWalletDisplay();
            UI.showToast(`Level Up! You're now level ${GameState.data.level}`, 'success', 'Congratulations!');
            UI.showToast(`+5 Stars for leveling up!`, 'success');
        }
        
        // Save game state
        GameState.save();
    },
    
    // Copy referral link to clipboard
    copyReferralLink() {
        const referralInput = document.getElementById('referralInput');
        referralInput.select();
        document.execCommand('copy');
        UI.showToast('Referral link copied to clipboard!', 'success');
    },
    
    // Share profile using Web Share API
    shareProfile() {
        if (navigator.share) {
            navigator.share({
                title: 'CX Miner',
                text: 'Check out my CX Miner profile!',
                url: document.getElementById('referralInput').value
            })
            .catch(error => {
                console.log('Error sharing:', error);
                UI.showToast('Sharing failed. Link copied to clipboard.', 'error');
                this.copyReferralLink();
            });
        } else {
            UI.showToast('Web Share API not supported. Link copied to clipboard.', 'info');
            this.copyReferralLink();
        }
    },
    
    // Save settings to localStorage
    saveSettings() {
        GameState.data.soundEnabled = document.getElementById('soundToggle').checked;
        GameState.data.vibrationEnabled = document.getElementById('vibrationToggle').checked;
        GameState.data.reduceAnimations = document.getElementById('reduceAnimationsToggle').checked;
        
        GameState.save();
        UI.showToast('Settings saved successfully!', 'success');
        
        // Test sound if enabled
        if (GameState.data.soundEnabled) {
            Effects.playSound();
        }
        
        // Test vibration if enabled
        if (GameState.data.vibrationEnabled) {
            Effects.vibrate();
        }
    }
};