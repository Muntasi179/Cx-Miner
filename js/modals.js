// Modal management
const Modals = {
    // Initialize modals
    init() {
        this.setupModalListeners();
        this.setupPurchaseHandlers();
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
            document.getElementById(id).addEventListener('click', () => {
                const modal = document.getElementById(id.replace('close', '').replace('Modal', 'Modal'));
                if (modal) {
                    modal.classList.remove('show');
                }
            });
        });
        
        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
        
        // Modal close buttons
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
            });
        });
        
        // Clear notifications
        document.getElementById('clearNotifications').addEventListener('click', () => {
            GameState.data.notifications = [];
            UI.updateNotifications();
            GameState.save();
        });
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
                    UI.showToast('Purchase successful!', 'success');
                } else {
                    UI.showToast('Not enough coins for this purchase', 'error');
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
                    UI.showToast('Purchase successful!', 'success');
                } else {
                    UI.showToast('Not enough coins for this purchase', 'error');
                }
            });
        });
        
        // Social tasks
        document.querySelectorAll('.social-action').forEach(action => {
            action.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                window.open(url, '_blank');
                
                // Award points for completing social task
                GameState.data.p