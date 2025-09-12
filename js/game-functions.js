// Game functions and utilities
const GameFunctions = {
    // Initialize the game
    init() {
        // Initialize Telegram
        this.initTelegram();
        
        // Load game state
        GameState.init();
        
        // Initialize TON Connect
        TONConnect.init();
        
        // Initialize UI
        UI.init();
        
        // Initialize modals
        Modals.init();
        
        // Set up game loops
        this.setupGameLoops();
        
        // Show welcome message
        setTimeout(() => {
            UI.showToast('Welcome to CX Miner! Tap the core to earn CX', 'info', 'Welcome');
        }, 1000);
    },
    
    // Initialize Telegram Web App
    initTelegram() {
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
        } catch (error) {
            console.error('Telegram Web App not available:', error);
        }
    },
    
    // Set up game loops
    setupGameLoops() {
        // Energy regeneration
        setInterval(() => {
            if (GameState.data.energy < GameState.data.maxEnergy) {
                GameState.data.energy = Math.min(
                    GameState.data.maxEnergy, 
                    GameState.data.energy + GameState.data.energyRegen / 10
                );
                UI.updateEnergyDisplay();
                
                // Save game state periodically
                if (Date.now() - GameState.data.lastSave > 10000) {
                    GameState.save();
                    GameState.data.lastSave = Date.now();
                }
            }
        }, 100);
        
        // Multiplier timer
        setInterval(() => {
            if (GameState.data.multiplierActive) {
                GameState.data.multiplierTime -= 0.1;
                
                if (GameState.data.multiplierTime <= 0) {
                    GameState.data.multiplierActive = false;
                    document.getElementById('multiplierBadge').style.display = 'none';
                    UI.showToast('2x Multiplier has expired', 'info');
                }
            }
        }, 100);
    }
};