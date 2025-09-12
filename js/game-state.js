// Game state management
const GameState = {
    // Default state
    data: {
        points: 0,
        energy: 100,
        maxEnergy: 100,
        energyRegen: 0.5,
        multitap: 1,
        totalTaps: 0,
        level: 1,
        experience: 0,
        multiplierActive: false,
        multiplierTime: 0,
        walletConnected: false,
        lastSave: Date.now(),
        tonBalance: 0,
        starBalance: 0,
        soundEnabled: false,
        vibrationEnabled: false,
        reduceAnimations: false,
        referralCode: "ref" + Math.floor(Math.random() * 10000),
        lastTapTime: 0,
        tapCooldown: 100,
        streakCount: 0,
        lastStreakClaim: null,
        achievements: [],
        notifications: [
            {
                id: 1,
                title: "Welcome to CloneX!",
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
                message: "Max Energy boost is now available in the shop for 1500 CX.",
                time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                read: true
            }
        ],
        leaderboard: [
            { username: "CryptoKing", points: 12500, level: 25, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
            { username: "MinerMax", points: 10800, level: 23, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
            { username: "TapMaster", points: 9200, level: 21, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" },
            { username: "User", points: 0, level: 1, avatar: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" }
        ],
        completedTasks: []
    },

    // Initialize game state
    init() {
        this.load();
        return this.data;
    },

    // Save game state to localStorage
    save() {
        localStorage.setItem('cloneX_save', JSON.stringify(this.data));
        this.data.lastSave = Date.now();
    },

    // Load game state from localStorage
    load() {
        const saved = localStorage.getItem('cloneX_save');
        if (saved) {
            try {
                const savedState = JSON.parse(saved);
                this.data = {...this.data, ...savedState};
            } catch (e) {
                console.error('Error loading saved game:', e);
            }
        }
    },

    // Update points
    addPoints(amount) {
        this.data.points += amount;
        this.save();
    },

    // Update energy
    updateEnergy(amount) {
        this.data.energy = Math.max(0, Math.min(this.data.maxEnergy, this.data.energy + amount));
        this.save();
    },

    // Add experience and check for level up
    addExperience(amount) {
        this.data.experience += amount;
        
        // Check for level up (100 XP per level)
        const xpNeeded = this.data.level * 100;
        if (this.data.experience >= xpNeeded) {
            this.data.level++;
            this.data.experience = this.data.experience - xpNeeded;
            this.data.starBalance += 5;
            
            // Award level up bonus
            this.data.points += this.data.level * 50;
            
            return true;
        }
        return false;
    },

    // Unlock achievement
    unlockAchievement(id, name, description, reward) {
        if (!this.data.achievements.find(a => a.id === id)) {
            this.data.achievements.push({
                id,
                name,
                description,
                unlocked: new Date().toISOString(),
                reward
            });
            
            // Award achievement reward
            this.data.points += reward;
            this.data.starBalance += Math.floor(reward / 100);
            
            return true;
        }
        return false;
    },

    // Check for level up
    checkLevelUp() {
        const oldLevel = this.data.level;
        const newLevel = Math.floor(this.data.totalTaps / 1000) + 1;
        
        if (newLevel > oldLevel) {
            this.data.level = newLevel;
            this.data.starBalance += 5;
            this.save();
            return true;
        }
        return false;
    },

    // Check daily streak
    checkDailyStreak() {
        const today = new Date().toDateString();
        if (this.data.lastStreakClaim === today) {
            return false; // Already claimed today
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (this.data.lastStreakClaim === yesterdayStr) {
            // Consecutive day
            this.data.streakCount++;
        } else if (!this.data.lastStreakClaim || this.data.lastStreakClaim !== today) {
            // Broken streak or first time
            this.data.streakCount = 1;
        }
        
        this.data.lastStreakClaim = today;
        this.save();
        
        return true;
    },

    // Claim daily streak reward
    claimDailyStreak() {
        if (!this.checkDailyStreak()) {
            return false;
        }
        
        // Calculate reward based on streak
        const baseReward = 50;
        const streakBonus = this.data.streakCount * 10;
        const totalReward = baseReward + streakBonus;
        
        this.data.points += totalReward;
        this.save();
        
        return totalReward;
    },

    // Purchase item
    purchaseItem(itemId, price, currency) {
        if (currency === 'cx' && this.data.points < price) {
            return false;
        }
        
        if (currency === 'stars' && this.data.starBalance < price) {
            return false;
        }
        
        // Deduct cost
        if (currency === 'cx') {
            this.data.points -= price;
        } else if (currency === 'stars') {
            this.data.starBalance -= price;
        }
        
        // Apply item effect
        this.applyItemEffect(itemId);
        
        this.save();
        return true;
    },

    // Apply item effect
    applyItemEffect(itemId) {
        switch(itemId) {
            case 'energyRegen':
                this.data.energyRegen += 0.2;
                break;
            case 'multitap':
                this.data.multitap += 1;
                break;
            case 'maxEnergy':
                this.data.maxEnergy += 20;
                break;
            case 'energyPack':
                this.data.energy = this.data.maxEnergy;
                break;
            case 'starterPack':
                this.data.points += 2000;
                this.data.energy = this.data.maxEnergy;
                break;
            case 'premiumPack':
                this.data.multitap += 2;
                this.data.points += 5000;
                break;
            case 'superEnergy':
                this.data.maxEnergy += 50;
                break;
            case 'premiumBoost':
                this.data.multitap += 5;
                this.data.points += 10000;
                break;
            case 'ultimateEnergy':
                this.data.maxEnergy += 100;
                this.data.energyRegen *= 2;
                break;
            case 'starMultiplier':
                // This would be a multiplier applied during point calculation
                break;
        }
    },

    // Get time ago string
    getTimeAgo(date) {
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
};
