// Game state
let gameState = {
    points: 0,
    energy: 100,
    maxEnergy: 100,
    energyRegen: 0.5,
    multitap: 1,
    totalTaps: 0,
    level: 1,
    multiplierActive: false,
    multiplierTime: 0,
    walletConnected: false,
    lastSave: Date.now(),
    tonBalance: 0, // Changed to 0 initially
    starBalance: 0, // Changed to 0 initially
    notifications: [
        {
            id: 1,
            title: "Welcome to CX Miner!",
            message: "Start tapping to earn CX coins. Connect your wallet to purchase boosts.",
            time: new Date().toISOString(),
            read: false
        },
        {
            id: 2,
            title: "Daily Bonus Available",
            message: "Claim your daily bonus of 50 CX coins in the tasks section.",
            time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false
        },
        {
            id: 3,
            title: "New Boost Available",
            message: "2x Multiplier boost is now available in the shop for 10 Stars.",
            time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            read: true
        }
    ],
    leaderboard: [
        { username: "CryptoKing", points: 12500, level: 25, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
        { username: "MinerMax", points: 10800, level: 23, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
        { username: "TapMaster", points: 9200, level: 21, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
        { username: "User", points: 0, level: 1, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" }
    ]
};

// TON Connect connector
let connector = null;

// Toast notification system
function showToast(message, type = 'info', title = null) {
    const toast = document.getElementById('toast');
    const toastContainer = document.getElementById('toastContainer');
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
        hideToast();
    }, 5000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('show');
}

// Create tap effect
function createTapEffect(x, y) {
    const tapEffect = document.createElement('div');
    tapEffect.className = 'tap-effect';
    tapEffect.style.left = `${x}px`;
    tapEffect.style.top = `${y}px`;
    document.getElementById('tapEffects').appendChild(tapEffect);
    
    // Remove effect after animation completes
    setTimeout(() => {
        tapEffect.remove();
    }, 500);
}

// Create particle effects
function createParticles(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random angle and distance
        const angle = (i / count) * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        
        // Calculate target position
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        // Set custom properties
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        // Position at click
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        document.getElementById('particleEffects').appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Handle mining click
function handleMiningClick(e) {
    if (gameState.energy < 1) {
        showToast('Not enough energy!', 'error');
        return;
    }
    
    // Calculate click position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create effects
    createTapEffect(e.clientX, e.clientY);
    createParticles(e.clientX, e.clientY);
    
    // Deduct energy
    gameState.energy = Math.max(0, gameState.energy - 1);
    updateEnergyDisplay();
    
    // Calculate points earned
    let pointsEarned = gameState.multitap;
    if (gameState.multiplierActive) {
        pointsEarned *= 2;
    }
    
    // Add points
    gameState.points += pointsEarned;
    gameState.totalTaps += 1;
    
    // Update displays
    updatePointsDisplay();
    updateTotalTapsDisplay();
    
    // Show earning text
    showToast(`+${pointsEarned} CX`, 'success');
    
    // Check for level up
    checkLevelUp();
    
    // Save game state
    saveGameState();
}

// Update points display
function updatePointsDisplay() {
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
function updateEnergyDisplay() {
    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    document.getElementById('energyBarFill').style.width = `${energyPercent}%`;
    document.getElementById('energyDisplay').textContent = `${Math.floor(gameState.energy)} / ${gameState.maxEnergy}`;
}

// Update energy regen display with fixed decimal places
function updateEnergyRegenDisplay() {
    // Fix the floating point precision issue
    const cleanRegenValue = parseFloat(gameState.energyRegen.toFixed(1));
    document.getElementById('energyRegenStat').textContent = `${cleanRegenValue}/s`;
}

// Update total taps display
function updateTotalTapsDisplay() {
    document.getElementById('totalTapsStat').textContent = gameState.totalTaps;
    document.getElementById('modalTotalTaps').textContent = gameState.totalTaps;
}

// Update wallet balances display
function updateWalletDisplay() {
    document.getElementById('modalTonBalance').textContent = `${gameState.tonBalance.toFixed(2)} TON`;
    document.getElementById('modalStarBalance').textContent = `${gameState.starBalance} Stars`;
}

// Check for level up
function checkLevelUp() {
    const oldLevel = gameState.level;
    const newLevel = Math.floor(gameState.totalTaps / 1000) + 1;
    
    if (newLevel > oldLevel) {
        gameState.level = newLevel;
        document.querySelector('.level-badge').textContent = newLevel;
        showToast(`Level Up! You're now level ${newLevel}`, 'success', 'Congratulations!');
        
        // Reward user with stars on level up (like other Telegram games)
        gameState.starBalance += 5;
        updateWalletDisplay();
        showToast(`+5 Stars for leveling up!`, 'success');
    }
}

// Energy regeneration
function regenerateEnergy() {
    if (gameState.energy < gameState.maxEnergy) {
        gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + gameState.energyRegen / 10);
        updateEnergyDisplay();
        
        // Save game state periodically
        if (Date.now() - gameState.lastSave > 10000) { // Save every 10 seconds
            saveGameState();
            gameState.lastSave = Date.now();
        }
    }
}

// Multiplier timer
function updateMultiplier() {
    if (gameState.multiplierActive) {
        gameState.multiplierTime -= 0.1;
        
        if (gameState.multiplierTime <= 0) {
            gameState.multiplierActive = false;
            document.getElementById('multiplierBadge').style.display = 'none';
            showToast('2x Multiplier has expired', 'info');
        }
    }
}

// Initialize TON Connect properly
async function initTONConnect() {
    try {
        // Create a connector instance
        connector = new TonConnectSDK.TonConnect({
            manifestUrl: 'https://muntasil79.github.io/Cx-Miner/tonconnect-manifest.json'
        });
        
        // Check if connection is already restored
        if (connector.connected) {
            gameState.walletConnected = true;
            document.getElementById('walletBtn').classList.add('wallet-connected');
            
            // Get wallet information
            const walletInfo = connector.wallet;
            if (walletInfo) {
                // Fetch real balance from blockchain
                await fetchRealBalances(walletInfo.account.address);
            }
        }
        
        // Subscribe to connection changes
        connector.onStatusChange(async walletInfo => {
            if (walletInfo) {
                gameState.walletConnected = true;
                document.getElementById('walletBtn').classList.add('wallet-connected');
                document.getElementById('disconnectWallet').style.display = 'block';
                
                // Fetch real balances
                await fetchRealBalances(walletInfo.account.address);
                
                showToast('Wallet connected successfully', 'success');
            } else {
                gameState.walletConnected = false;
                document.getElementById('walletBtn').classList.remove('wallet-connected');
                document.getElementById('disconnectWallet').style.display = 'none';
                gameState.tonBalance = 0;
                updateWalletDisplay();
            }
        });
        
    } catch (error) {
        console.error('TON Connect initialization failed:', error);
        showToast('Failed to initialize wallet connection', 'error');
    }
}

// Fetch real balances from blockchain
async function fetchRealBalances(walletAddress) {
    try {
        // Show loading state
        document.getElementById('walletConnectionStatus').style.display = 'block';
        document.getElementById('walletStatusText').textContent = 'Fetching balances...';
        
        // Fetch TON balance
        const tonResponse = await fetch(`https://toncenter.com/api/v2/getAddressInformation?address=${walletAddress}`);
        const tonData = await tonResponse.json();
        
        if (tonData.result && tonData.result.balance) {
            // Convert nanoton to TON
            gameState.tonBalance = tonData.result.balance / 1000000000;
            updateWalletDisplay();
            document.getElementById('walletStatusText').textContent = 'Balances updated successfully!';
        } else {
            document.getElementById('walletStatusText').textContent = 'Failed to fetch balances';
        }
        
        // Hide loading state after a delay
        setTimeout(() => {
            document.getElementById('walletConnectionStatus').style.display = 'none';
        }, 2000);
        
    } catch (error) {
        console.error('Failed to fetch balances:', error);
        document.getElementById('walletStatusText').textContent = 'Error fetching balances';
        showToast('Failed to fetch wallet balances', 'error');
    }
}

// Purchase item with real transaction
async function purchaseItem(itemId, price, currency) {
    if (!gameState.walletConnected) {
        showToast('Please connect your wallet first', 'error');
        return false;
    }
    
    if (currency === 'stars') {
        // For demo purposes, we'll handle star purchases differently
        if (gameState.starBalance >= price) {
            gameState.starBalance -= price;
            applyItemEffect(itemId);
            updateWalletDisplay();
            saveGameState();
            showToast(`Purchase successful! -${price} Stars`, 'success');
            return true;
        } else {
            showToast(`Not enough Stars for this purchase`, 'error');
            return false;
        }
    }
    
    try {
        // Show transaction status
        document.getElementById('walletConnectionStatus').style.display = 'block';
        document.getElementById('walletStatusText').textContent = 'Preparing transaction...';
        
        // Create transaction
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
            messages: [
                {
                    address: 'EQCDYpQNUpU5pqSzcbkryrfrQkXm5p5s3y5QHZ5qVXqncq6o', // Test recipient address
                    amount: (price * 1000000000).toString(), // Convert to nanoton
                    payload: '' // Optional payload
                }
            ]
        };
        
        // Send transaction request to wallet
        const result = await connector.sendTransaction(transaction);
        
        if (result) {
            document.getElementById('walletStatusText').textContent = 'Transaction sent! Waiting for confirmation...';
            
            // Simulate transaction confirmation (in a real app, you would verify on-chain)
            setTimeout(() => {
                // Apply the item effect after "confirmation"
                applyItemEffect(itemId);
                
                // Update balances
                gameState.tonBalance -= price;
                updateWalletDisplay();
                saveGameState();
                
                document.getElementById('walletStatusText').textContent = 'Transaction confirmed!';
                showToast('Purchase confirmed!', 'success');
                
                // Hide status after delay
                setTimeout(() => {
                    document.getElementById('walletConnectionStatus').style.display = 'none';
                }, 2000);
            }, 3000);
            
            return true;
        }
        
    } catch (error) {
        console.error('Transaction failed:', error);
        document.getElementById('walletConnectionStatus').style.display = 'none';
        showToast('Transaction failed or was rejected', 'error');
        return false;
    }
}

// Apply item effect
function applyItemEffect(itemId) {
    switch(itemId) {
        case 'energyRegen':
            gameState.energyRegen += 0.2;
            updateEnergyRegenDisplay();
            break;
        case 'multitap':
            gameState.multitap += 1;
            document.getElementById('multitapStat').textContent = gameState.multitap;
            break;
        case 'multiplier':
            gameState.multiplierActive = true;
            gameState.multiplierTime = 1800; // 30 minutes in seconds
            document.getElementById('multiplierBadge').style.display = 'block';
            break;
        case 'energyPack':
            gameState.energy = gameState.maxEnergy;
            updateEnergyDisplay();
            break;
        case 'starterPack':
            gameState.points += 500;
            gameState.energy = gameState.maxEnergy;
            updatePointsDisplay();
            updateEnergyDisplay();
            break;
        case 'premiumPack':
            gameState.multitap += 1;
            document.getElementById('multitapStat').textContent = gameState.multitap;
            break;
        case 'dragonPack':
            gameState.multiplierActive = true;
            gameState.multiplierTime = 3600; // 1 hour in seconds
            document.getElementById('multiplierBadge').style.display = 'block';
            break;
    }
}

// Update leaderboard
function updateLeaderboard() {
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
function updateNotifications() {
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
            updateNotificationBadge();
            saveGameState();
        });
        
        notificationsList.appendChild(notificationItem);
    });
    
    updateNotificationBadge();
}

// Update notification badge
function updateNotificationBadge() {
    const unreadCount = gameState.notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
}

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('cxMiner_save', JSON.stringify({
        points: gameState.points,
        energy: gameState.energy,
        maxEnergy: gameState.maxEnergy,
        energyRegen: gameState.energyRegen,
        multitap: gameState.multitap,
        totalTaps: gameState.totalTaps,
        level: gameState.level,
        multiplierActive: gameState.multiplierActive,
        multiplierTime: gameState.multiplierTime,
        walletConnected: gameState.walletConnected,
        tonBalance: gameState.tonBalance,
        starBalance: gameState.starBalance,
        notifications: gameState.notifications,
        leaderboard: gameState.leaderboard
    }));
}

// Load game state from localStorage
function loadGameState() {
    const saved = localStorage.getItem('cxMiner_save');
    if (saved) {
        try {
            const savedState = JSON.parse(saved);
            // Merge with current state
            gameState = {...gameState, ...savedState};
            
            // Update UI with loaded state
            updatePointsDisplay();
            updateEnergyDisplay();
            updateEnergyRegenDisplay();
            updateTotalTapsDisplay();
            updateWalletDisplay();
            updateLeaderboard();
            updateNotifications();
            
            document.querySelector('.level-badge').textContent = gameState.level;
            
            if (gameState.multiplierActive) {
                document.getElementById('multiplierBadge').style.display = 'block';
            }
            
            if (gameState.walletConnected) {
                document.getElementById('walletBtn').classList.add('wallet-connected');
                document.getElementById('disconnectWallet').style.display = 'block';
            }
            
            showToast('Game progress loaded', 'success');
        } catch (e) {
            console.error('Error loading saved game:', e);
        }
    }
}

// Initialize Telegram Web App
function initTelegram() {
    try {
        const tg = window.Telegram.WebApp;
        tg.expand();
        tg.enableClosingConfirmation();
        
        // Set up user data
        const user = tg.initDataUnsafe?.user;
        if (user) {
            document.getElementById('usernameDisplay').textContent = user.first_name || 'User';
            document.getElementById('modalUsername').textContent = user.first_name || 'User';
            
            if (user.photo_url) {
                document.getElementById('profilePic').src = user.photo_url;
            }
        }
        
        return tg;
    } catch (error) {
        console.error('Telegram Web App not available:', error);
        return null;
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram
    const tg = initTelegram();
    
    // Load saved game state
    loadGameState();
    
    // Initialize TON Connect
    initTONConnect();
    
    // Set up modal buttons
    document.getElementById('walletBtn').addEventListener('click', function() {
        document.getElementById('walletModal').classList.add('show');
    });
    
    document.getElementById('notificationsBtn').addEventListener('click', function() {
        document.getElementById('notificationsModal').classList.add('show');
    });
    
    document.getElementById('profileBtn').addEventListener('click', function() {
        document.getElementById('modalTotalTaps').textContent = gameState.totalTaps;
        document.getElementById('modalEarned').textContent = Math.floor(gameState.points);
        updateWalletDisplay();
        document.getElementById('profileModal').classList.add('show');
    });
    
    document.getElementById('settingsBtn').addEventListener('click', function() {
        document.getElementById('settingsModal').classList.add('show');
    });
    
    document.getElementById('boostsBtn').addEventListener('click', function() {
        document.getElementById('boostsModal').classList.add('show');
    });
    
    document.getElementById('shopBtn').addEventListener('click', function() {
        document.getElementById('shopModal').classList.add('show');
    });
    
    document.getElementById('tasksBtn').addEventListener('click', function() {
        document.getElementById('tasksModal').classList.add('show');
    });
    
    document.getElementById('leaderboardBtn').addEventListener('click', function() {
        updateLeaderboard();
        document.getElementById('leaderboardModal').classList.add('show');
    });
    
    // Set up wallet connection buttons
    document.getElementById('connectTonKeeper').addEventListener('click', function() {
        if (connector) {
            const universalLink = connector.connect({
                tonkeeper: 'tonkeeper' 
            });
            window.open(universalLink, '_blank');
        }
    });
    
    document.getElementById('connectTonHub').addEventListener('click', function() {
        if (connector) {
            const universalLink = connector.connect({
                tonhub: 'tonhub'
            });
            window.open(universalLink, '_blank');
        }
    });
    
    document.getElementById('connectTelegramWallet').addEventListener('click', function() {
        showToast('Telegram wallet integration coming soon', 'info');
    });
    
    document.getElementById('disconnectWallet').addEventListener('click', function() {
        if (connector) {
            connector.disconnect();
            gameState.walletConnected = false;
            document.getElementById('walletBtn').classList.remove('wallet-connected');
            this.style.display = 'none';
            gameState.tonBalance = 0;
            updateWalletDisplay();
            showToast('Wallet disconnected', 'info');
        }
    });
    
    // Set up purchase buttons
    document.querySelectorAll('.boost-item').forEach(item => {
        item.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            const price = parseFloat(this.getAttribute('data-price'));
            const currency = this.getAttribute('data-currency');
            
            purchaseItem(itemId, price, currency);
        });
    });
    
    document.querySelectorAll('.shop-item').forEach(item => {
        item.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            const price = parseFloat(this.getAttribute('data-price'));
            const currency = this.getAttribute('data-currency');
            
            purchaseItem(itemId, price, currency);
        });
    });
    
    // Close modal buttons
    document.getElementById('closeWalletModal').addEventListener('click', function() {
        document.getElementById('walletModal').classList.remove('show');
    });
    
    document.getElementById('closeNotificationsModal').addEventListener('click', function() {
        document.getElementById('notificationsModal').classList.remove('show');
    });
    
    document.getElementById('clearNotifications').addEventListener('click', function() {
        gameState.notifications = [];
        updateNotifications();
        saveGameState();
    });
    
    document.getElementById('closeProfileModal').addEventListener('click', function() {
        document.getElementById('profileModal').classList.remove('show');
    });
    
    document.getElementById('closeSettingsModal').addEventListener('click', function() {
        document.getElementById('settingsModal').classList.remove('show');
    });
    
    document.getElementById('closeBoostsModal').addEventListener('click', function() {
        document.getElementById('boostsModal').classList.remove('show');
    });
    
    document.getElementById('closeShopModal').addEventListener('click', function() {
        document.getElementById('shopModal').classList.remove('show');
    });
    
    document.getElementById('closeTasksModal').addEventListener('click', function() {
        document.getElementById('tasksModal').classList.remove('show');
    });
    
    document.getElementById('closeLeaderboardModal').addEventListener('click', function() {
        document.getElementById('leaderboardModal').classList.remove('show');
    });
    
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
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
        miningObject.addEventListener('click', handleMiningClick);
    }
    
    // Set up game loops
    setInterval(regenerateEnergy, 100);
    setInterval(updateMultiplier, 100);
    
    // Show welcome message
    setTimeout(() => {
        showToast('Welcome to CX Miner! Tap the core to earn CX', 'info', 'Welcome');
    }, 1000);
    
    // Initialize toast close button
    document.querySelector('.toast-close').addEventListener('click', hideToast);
});