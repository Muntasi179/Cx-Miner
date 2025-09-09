// Game state management
class GameState {
    constructor() {
        this.points = 0;
        this.energy = 100;
        this.maxEnergy = 100;
        this.energyRegen = 0.5;
        this.multitap = 1;
        this.totalTaps = 0;
        this.level = 1;
        this.multiplierActive = false;
        this.multiplierTime = 0;
        this.walletConnected = false;
        this.lastSave = Date.now();
        this.tonBalance = 0;
        this.starBalance = 0;
        this.notifications = [
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
        ];
        this.leaderboard = [
            { username: "CryptoKing", points: 12500, level: 25, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
            { username: "MinerMax", points: 10800, level: 23, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
            { username: "TapMaster", points: 9200, level: 21, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
            { username: "User", points: 0, level: 1, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" }
        ];
    }

    // Save game state to localStorage
    save() {
        localStorage.setItem('cxMiner_save', JSON.stringify({
            points: this.points,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            energyRegen: this.energyRegen,
            multitap: this.multitap,
            totalTaps: this.totalTaps,
            level: this.level,
            multiplierActive: this.multiplierActive,
            multiplierTime: this.multiplierTime,
            walletConnected: this.walletConnected,
            tonBalance: this.tonBalance,
            starBalance: this.starBalance,
            notifications: this.notifications,
            leaderboard: this.leaderboard
        }));
        this.lastSave = Date.now();
    }

    // Load game state from localStorage
    load() {
        const saved = localStorage.getItem('cxMiner_save');
        if (saved) {
            try {
                const savedState = JSON.parse(saved);
                Object.assign(this, savedState);
                return true;
            } catch (e) {
                console.error('Error loading saved game:', e);
                return false;
            }
        }
        return false;
    }

    // Check for level up
    checkLevelUp() {
        const oldLevel = this.level;
        const newLevel = Math.floor(this.totalTaps / 1000) + 1;
        
        if (newLevel > oldLevel) {
            this.level = newLevel;
            this.starBalance += 5; // Reward stars on level up
            return true;
        }
        return false;
    }

    // Regenerate energy
    regenerate() {
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegen / 10);
            return true;
        }
        return false;
    }

    // Update multiplier timer
    updateMultiplier() {
        if (this.multiplierActive) {
            this.multiplierTime -= 0.1;
            
            if (this.multiplierTime <= 0) {
                this.multiplierActive = false;
                return true; // Multiplier expired
            }
        }
        return false;
    }

    // Handle mining click
    mine() {
        if (this.energy < 1) {
            return { success: false, reason: 'Not enough energy!' };
        }
        
        this.energy = Math.max(0, this.energy - 1);
        
        // Calculate points earned
        let pointsEarned = this.multitap;
        if (this.multiplierActive) {
            pointsEarned *= 2;
        }
        
        this.points += pointsEarned;
        this.totalTaps += 1;
        
        const leveledUp = this.checkLevelUp();
        
        return { 
            success: true, 
            pointsEarned, 
            leveledUp,
            newLevel: leveledUp ? this.level : null
        };
    }
}

// Create global game state instance
const gameState = new GameState();