// Main application initialization
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Telegram
    const tg = initTelegram();
    
    // Load saved game state
    const loaded = gameState.load();
    
    // Initialize UI
    uiManager.init();
    
    // Initialize TON Connect
    await tonConnectManager.init();
    
    // Set up game loops
    setInterval(() => {
        if (gameState.regenerate()) {
            uiManager.updateEnergyDisplay();
        }
        
        if (gameState.updateMultiplier()) {
            document.getElementById('multiplierBadge').style.display = 'none';
            uiManager.showToast('2x Multiplier has expired', 'info');
        }
        
        // Save game state periodically
        if (Date.now() - gameState.lastSave > 10000) { // Save every 10 seconds
            gameState.save();
        }
    }, 100);
    
    // Show welcome message if this is a new game
    if (!loaded) {
        setTimeout(() => {
            uiManager.showToast('Welcome to CX Miner! Tap the core to earn CX', 'info', 'Welcome');
        }, 1000);
    } else {
        uiManager.showToast('Game progress loaded', 'success');
    }
});

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

// Global function for showing toasts (for backward compatibility)
function showToast(message, type = 'info', title = null) {
    uiManager.showToast(message, type, title);
}

// Global function for updating wallet display (for backward compatibility)
function updateWalletDisplay() {
    uiManager.updateWalletDisplay();
}

// Global function for updating points display (for backward compatibility)
function updatePointsDisplay() {
    uiManager.updatePointsDisplay();
}

// Global function for updating energy display (for backward compatibility)
function updateEnergyDisplay() {
    uiManager.updateEnergyDisplay();
}

// Global function for updating energy regen display (for backward compatibility)
function updateEnergyRegenDisplay() {
    uiManager.updateEnergyRegenDisplay();
}

// Global function for updating total taps display (for backward compatibility)
function updateTotalTapsDisplay() {
    uiManager.updateTotalTapsDisplay();
}

// Global function for updating leaderboard (for backward compatibility)
function updateLeaderboard() {
    uiManager.updateLeaderboard();
}

// Global function for updating notifications (for backward compatibility)
function updateNotifications() {
    uiManager.updateNotifications();
}

// Global function for updating notification badge (for backward compatibility)
function updateNotificationBadge() {
    uiManager.updateNotificationBadge();
}