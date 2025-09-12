// Modal management
const Modals = {
    // Initialize modals
    init() {
        this.setupModalListeners();
        this.setupPurchaseHandlers();
        this.setupSocialTaskHandlers();
        this.setupTaskHandlers();
    },
    
    // Setup modal event listeners
    setupModalListeners() {
        // Close modal buttons
        const closeButtons = [
            'closeWalletModal', 'closeNotificationsModal', 'closeProfileModal',
            'closeSettingsModal', 'closeBoostsModal', 'closeShopModal',
            'closeTasksModal', 'closeLeaderboardModal'
        ];
        
        closeButtons.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    const modalId = id.replace('close', '');
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        modal.classList.remove('show');
                    }
                });
            }
        });
        
        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
        
        // Modal close buttons (X buttons)
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('show');
                }
            });
        });
        
        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Add floating text effect on nav click
                const rect = this.getBoundingClientRect();
                Effects.createFloatingText(rect.left + rect.width/2, rect.top, "+1", "nav");
            });
        });
        
        // Clear notifications
        const clearNotificationsBtn = document.getElementById('clearNotifications');
        if (clearNotificationsBtn) {
            clearNotificationsBtn.addEventListener('click', () => {
                GameState.data.notifications = [];
                UI.updateNotifications();
                GameState.save();
                UI.showToast('All notifications cleared', 'info');
            });
        }
    },
    
    // Setup purchase handlers
    setupPurchaseHandlers() {
        // Boost items
        document.querySelectorAll('.boost-item').forEach(item => {
            item.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const price = parseFloat(this.getAttribute('data-price'));
                const currency = this.getAttribute('data-currency');
                
                if (GameState.purchaseItem(itemId, price, currency)) {
                    UI.updatePointsDisplay();
                    UI.updateWalletDisplay();
                    UI.updateEnergyRegenDisplay();
                    document.getElementById('multitapStat').textContent = GameState.data.multitap;
                    
                    // Create floating text effect
                    const rect = this.getBoundingClientRect();
                    Effects.createFloatingText(rect.left + rect.width/2, rect.top, "Purchased!", "success");
                    
                    UI.showToast('Purchase successful!', 'success');
                } else {
                    UI.showToast('Not enough coins for this purchase', 'error');
                    
                    // Create floating text effect for error
                    const rect = this.getBoundingClientRect();
                    Effects.createFloatingText(rect.left + rect.width/2, rect.top, "Not Enough!", "error");
                }
            });
        });
        
        // Shop items
        document.querySelectorAll('.shop-item').forEach(item => {
            item.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const price = parseFloat(this.getAttribute('data-price'));
                const currency = this.getAttribute('data-currency');
                
                if (GameState.purchaseItem(itemId, price, currency)) {
                    UI.updatePointsDisplay();
                    UI.updateWalletDisplay();
                    UI.updateEnergyDisplay();
                    document.getElementById('multitapStat').textContent = GameState.data.multitap;
                    
                    // Create floating text effect
                    const rect = this.getBoundingClientRect();
                    Effects.createFloatingText(rect.left + rect.width/2, rect.top, "Purchased!", "success");
                    
                    UI.showToast('Purchase successful!', 'success');
                } else {
                    UI.showToast('Not enough coins for this purchase', 'error');
                    
                    // Create floating text effect for error
                    const rect = this.getBoundingClientRect();
                    Effects.createFloatingText(rect.left + rect.width/2, rect.top, "Not Enough!", "error");
                }
            });
        });
        
        // Premium shop items (TON purchases)
        document.querySelectorAll('.premium-item').forEach(item => {
            item.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const price = parseFloat(this.getAttribute('data-price'));
                
                if (GameState.data.tonBalance >= price) {
                    GameState.data.tonBalance -= price;
                    GameState.applyItemEffect(itemId);
                    GameState.save();
                    
                    UI.updateWalletDisplay();
                    UI.updatePointsDisplay();
                    
                    // Create floating text effect
                    const rect = this.getBoundingClientRect();
                    Effects.createFloatingText(rect.left + rect.width/2, rect.top, "Premium Unlocked!", "premium");
                    
                    UI.showToast('Premium item purchased!', 'success');
                } else {
                    UI.showToast('Not enough TON for this purchase', 'error');
                    
                    // Create floating text effect for error
                    const rect = this.getBoundingClientRect();
                    Effects.createFloatingText(rect.left + rect.width/2, rect.top, "Need More TON!", "error");
                }
            });
        });
    },
    
    // Setup social task handlers
    setupSocialTaskHandlers() {
        document.querySelectorAll('.social-action').forEach(action => {
            action.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                const reward = parseInt(this.getAttribute('data-reward'));
                
                window.open(url, '_blank');
                
                // Award points for completing social task
                GameState.data.points += reward;
                UI.updatePointsDisplay();
                
                // Create floating text effect
                const rect = this.getBoundingClientRect();
                Effects.createFloatingText(rect.left + rect.width/2, rect.top, `+${reward} CX`, "social");
                
                UI.showToast(`+${reward} CX for completing task!`, 'success');
                GameState.save();
            });
        });
    },
    
    // Setup task handlers
    setupTaskHandlers() {
        // Daily tasks
        document.querySelectorAll('.task-action').forEach(task => {
            task.addEventListener('click', function() {
                if (this.classList.contains('completed')) return;
                
                const taskId = this.getAttribute('data-id');
                const reward = parseInt(this.getAttribute('data-reward'));
                
                // Mark as completed
                this.classList.add('completed');
                this.innerHTML = 'Claimed';
                
                // Award points
                GameState.data.points += reward;
                UI.updatePointsDisplay();
                
                // Create floating text effect
                const rect = this.getBoundingClientRect();
                Effects.createFloatingText(rect.left + rect.width/2, rect.top, `+${reward} CX`, "task");
                
                UI.showToast(`Task completed! +${reward} CX`, 'success');
                GameState.save();
            });
        });
        
        // Claim all tasks button
        const claimAllBtn = document.getElementById('claimAllTasks');
        if (claimAllBtn) {
            claimAllBtn.addEventListener('click', () => {
                let totalReward = 0;
                let claimedCount = 0;
                
                document.querySelectorAll('.task-action:not(.completed)').forEach(task => {
                    task.classList.add('completed');
                    task.innerHTML = 'Claimed';
                    
                    const reward = parseInt(task.getAttribute('data-reward'));
                    totalReward += reward;
                    claimedCount++;
                });
                
                if (claimedCount > 0) {
                    GameState.data.points += totalReward;
                    UI.updatePointsDisplay();
                    
                    // Create floating text effect
                    const rect = claimAllBtn.getBoundingClientRect();
                    Effects.createFloatingText(rect.left + rect.width/2, rect.top, `+${totalReward} CX`, "task");
                    
                    UI.showToast(`Claimed ${claimedCount} tasks! +${totalReward} CX`, 'success');
                    GameState.save();
                } else {
                    UI.showToast('No tasks to claim', 'info');
                }
            });
        }
    }
};
