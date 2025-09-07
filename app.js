// Main application logic
// Game state with default values for new users
let points = 0;
let energy = 100;
let maxEnergy = 100;
let multitap = 1;
let adCooldown = false;
let completedTasks = [];
let boostsLevel = { multitap: 1, energy: 1, regen: 1 };
let energyInterval = null;
let totalTaps = 0;
let playTime = 0;
let playTimeInterval = null;
let autoTappers = 0;
let autoTapperInterval = null;
let friendsCount = 0;
let achievements = [];
let refEarnings = 0;
let lastAdWatchTime = 0;
let activeMultiplier = { value: 1, expires: 0 };

// TON Wallet connection
let isWalletConnected = false;
let connectedWalletAddress = '';

// Check if user is referred
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('start');
let referredBy = null;

if (refCode && refCode.length > 5) {
    referredBy = refCode;
    points += 50;
    if (!completedTasks.includes('referred')) {
        completedTasks.push('referred');
    }
}

const $ = (id)=>document.getElementById(id);
const pointsBalance=$('pointsBalance'), walletBalance=$('walletBalance');
const energyDisplay=$('energyDisplay'), energyBarFill=$('energyBarFill');
const tapper=$('tapperObject');
const tapperClickArea = $('tapperClickArea');
const particlesContainer = $('particles');
const tapEffectsContainer = $('tapEffects');
const multiplierBadge = $('multiplierBadge');

// Format numbers with K, M, B suffixes
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
}

function save(){
    const userData = {
        points,energy,maxEnergy,multitap,completedTasks,boostsLevel,
        totalTaps, playTime, autoTappers, friendsCount, achievements,
        shopItems, activeMultiplier, lastAdWatchTime, refEarnings,
        isWalletConnected, connectedWalletAddress
    };
    
    const storageKey = window.Telegram?.WebApp?.initDataUnsafe?.user?.id ? 
        `cxData_${window.Telegram.WebApp.initDataUnsafe.user.id}` : 'cxData';
    
    localStorage.setItem(storageKey, JSON.stringify(userData));
}

function load(){
    try{
        const storageKey = window.Telegram?.WebApp?.initDataUnsafe?.user?.id ? 
            `cxData_${window.Telegram.WebApp.initDataUnsafe.user.id}` : 'cxData';
            
        const raw = localStorage.getItem(storageKey);
        if(!raw) return;
        
        const d = JSON.parse(raw) || {};
        points = Number.isFinite(d.points) ? d.points : 0;
        energy = Number.isFinite(d.energy) ? d.energy : 100;
        maxEnergy = Number.isFinite(d.maxEnergy) ? d.maxEnergy : 100;
        multitap = Number.isFinite(d.multitap) ? d.multitap : 1;
        boostsLevel = d.boostsLevel || { multitap: 1, energy: 1, regen: 1 };
        completedTasks = Array.isArray(d.completedTasks) ? d.completedTasks : [];
        totalTaps = Number.isFinite(d.totalTaps) ? d.totalTaps : 0;
        playTime = Number.isFinite(d.playTime) ? d.playTime : 0;
        autoTappers = Number.isFinite(d.autoTappers) ? d.autoTappers : 0;
        friendsCount = Number.isFinite(d.friendsCount) ? d.friendsCount : 0;
        achievements = Array.isArray(d.achievements) ? d.achievements : [];
        shopItems = d.shopItems || shopItems;
        activeMultiplier = d.activeMultiplier || { value: 1, expires: 0 };
        lastAdWatchTime = Number.isFinite(d.lastAdWatchTime) ? d.lastAdWatchTime : 0;
        refEarnings = Number.isFinite(d.refEarnings) ? d.refEarnings : 0;
        isWalletConnected = d.isWalletConnected || false;
        connectedWalletAddress = d.connectedWalletAddress || '';
    } catch(e) { 
        console.warn('load fail',e); 
    }
}

function update(){
    if(maxEnergy <= 0) maxEnergy = 100;                
    if(energy > maxEnergy) energy = maxEnergy;
    
    pointsBalance.textContent = formatNumber(Math.floor(points));
    walletBalance.textContent = formatNumber(Math.floor(points));
    energyDisplay.textContent = `${Math.floor(energy)} / ${maxEnergy}`;
    energyBarFill.style.width = (energy/maxEnergy*100)+'%';
    $('profileBalance').textContent = formatNumber(Math.floor(points));
    $('profileEnergy').textContent = `${Math.floor(energy)}/${maxEnergy}`;
    $('profileMultitap').textContent = multitap;
    $('profileTaps').textContent = formatNumber(totalTaps);
    $('profilePlayTime').textContent = Math.floor(playTime/60)+'m';
    $('multitapStat').textContent = multitap;
    
    // FIXED: Correct regeneration rate display
    $('energyRegenStat').textContent = BOOSTS_CONFIG.regen.effect(boostsLevel.regen).toFixed(1) + '/s';
    
    $('totalTapsStat').textContent = formatNumber(totalTaps);
    $('friendsCount').textContent = friendsCount;
    $('friendsBonus').textContent = friendsCount * 1;
    $('refEarnings').textContent = formatNumber(refEarnings);
    
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
        $('refLink').textContent = `http://t.me/Official_CloneX_Bot/clonex?start=ref${userId}`;
    }
    
    if (activeMultiplier.value > 1) {
        multiplierBadge.textContent = activeMultiplier.value + 'x Active';
        multiplierBadge.style.display = 'block';
    } else {
        multiplierBadge.style.display = 'none';
    }
    
    updateWalletUI();
    save();
}

function updateWalletUI() {
    const connectBtn = $('tonConnectButton');
    const walletInfo = $('walletInfo');
    const walletAddress = $('connectedWalletAddress');
    const withdrawBtn = $('withdrawBtn');
    
    if (isWalletConnected && connectedWalletAddress) {
        connectBtn.textContent = 'Wallet Connected';
        connectBtn.classList.add('connected');
        walletInfo.style.display = 'block';
        walletAddress.textContent = connectedWalletAddress;
        
        // FIXED: Remove minimum withdrawal requirement
        withdrawBtn.disabled = points < 1;
        withdrawBtn.textContent = `Withdraw ${formatNumber(Math.floor(points))} CX`;
    } else {
        connectBtn.textContent = 'Connect TON Wallet';
        connectBtn.classList.remove('connected');
        walletInfo.style.display = 'none';
    }
}

function createParticles() {
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = Math.random() * 5 + 5 + 's';
        particlesContainer.appendChild(particle);
    }
}

function createTapEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'tap-effect';
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    tapEffectsContainer.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 500);
}

function floatText(txt){
    const el = document.createElement('div');
    el.className = 'float'; 
    el.textContent = txt;
    $('tapperZone').appendChild(el);
    el.style.left = '50%'; 
    el.style.top = '50%';
    setTimeout(() => el.remove(), 1500);
}

function errorText(txt){
    const el = document.createElement('div');
    el.className = 'error-float'; 
    el.textContent = txt;
    $('tapperZone').appendChild(el);
    el.style.left = '50%'; 
    el.style.top = '50%';
    setTimeout(() => el.remove(), 1500);
}

function showAchievement(title, desc, reward) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `<i class="fas fa-trophy"></i>
        <div>
            <div><strong>${title}</strong></div>
            <div style="font-size:0.8rem">${desc}</div>
        </div>`;
    document.body.appendChild(toast);
    
    if (reward) {
        points += reward;
        setTimeout(() => {
            floatText('+' + formatNumber(reward) + ' CX');
        }, 1000);
    }
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
    
    update();
}

tapperClickArea.addEventListener('click', (e) => {
    e.preventDefault();
    
    if(energy < 1){
        errorText('No Energy!');
        return;
    }
    
    createTapEffect(e.clientX, e.clientY);
    
    const baseEarn = 1;
    const multiplier = activeMultiplier.value;
    const earn = baseEarn * multiplier;
    
    energy -= 1;
    points += earn;
    totalTaps += 1;
    
    floatText('+' + earn.toFixed(1) + ' CX');
    checkAchievements();
    trackEvent('tap', { taps: totalTaps, points: points });
    update();
});

function checkAchievements() {
    if (totalTaps >= 100 && !achievements.includes('100_taps')) {
        achievements.push('100_taps');
        showAchievement('First Steps', 'Reach 100 taps', 10);
    }
    if (totalTaps >= 1000 && !achievements.includes('1000_taps')) {
        achievements.push('1000_taps');
        showAchievement('Tapping Pro', 'Reach 1,000 taps', 50);
    }
    if (totalTaps >= 10000 && !achievements.includes('10000_taps')) {
        achievements.push('10000_taps');
        showAchievement('Tapping Master', 'Reach 10,000 taps', 200);
    }
    
    if (points >= 1000 && !achievements.includes('1000_points')) {
        achievements.push('1000_points');
        showAchievement('First Thousand', 'Earn 1,000 CX', 50);
    }
    if (points >= 10000 && !achievements.includes('10000_points')) {
        achievements.push('10000_points');
        showAchievement('CX Collector', 'Earn 10,000 CX', 200);
    }
    
    if (maxEnergy >= 200 && !achievements.includes('200_energy')) {
        achievements.push('200_energy');
        showAchievement('Energy Boost', 'Reach 200 max energy', 100);
    }
    if (maxEnergy >= 500 && !achievements.includes('500_energy')) {
        achievements.push('500_energy');
        showAchievement('Energy Master', 'Reach 500 max energy', 500);
    }
}

function regenEnergy() {
    if (energy < maxEnergy) {
        const regenRate = BOOSTS_CONFIG.regen.eject(boostsLevel.regen);
        energy = Math.min(maxEnergy, energy + regenRate/10);
        update();
    }
}

function autoTap() {
    if (autoTappers > 0) {
        const baseEarn = 1;
        const multiplier = activeMultiplier.value;
        const earn = baseEarn * multiplier * autoTappers;
        
        points += earn;
        totalTaps += autoTappers;
        
        update();
    }
}

function updatePlayTime() {
    playTime += 1;
    update();
}

function checkMultiplierExpiry() {
    const now = Math.floor(Date.now() / 1000);
    if (activeMultiplier.expires > 0 && now >= activeMultiplier.expires) {
        activeMultiplier = { value: 1, expires: 0 };
        update();
    }
}

// Initialize TON Connect
function initTONConnect() {
    try {
        const connector = new TonConnectSDK.TonConnect({
            manifestUrl: 'https://yourdomain.com/tonconnect-manifest.json'
        });
        
        connector.restoreConnection();
        
        connector.onStatusChange(walletInfo => {
            if (walletInfo) {
                isWalletConnected = true;
                connectedWalletAddress = walletInfo.account.address;
                console.log('Wallet connected:', connectedWalletAddress);
            } else {
                isWalletConnected = false;
                connectedWalletAddress = '';
                console.log('Wallet disconnected');
            }
            updateWalletUI();
            save();
        });
        
        $('tonConnectButton').addEventListener('click', async () => {
            if (isWalletConnected) {
                connector.disconnect();
            } else {
                try {
                    const connectionSource = await connector.connect();
                    console.log('Connection source:', connectionSource);
                } catch (err) {
                    console.error('Connection error:', err);
                    errorText('Connection failed');
                }
            }
        });
        
        $('withdrawBtn').addEventListener('click', async () => {
            if (!isWalletConnected || !connectedWalletAddress) {
                errorText('Connect wallet first');
                return;
            }
            
            try {
                const transaction = {
                    validUntil: Math.floor(Date.now() / 1000) + 300,
                    messages: [
                        {
                            address: connectedWalletAddress, // Send to user's own wallet
                            amount: Math.floor(points * 1000000).toString(),
                            payload: 'Withdraw CX earnings'
                        }
                    ]
                };
                
                const result = await connector.sendTransaction(transaction);
                
                if (result) {
                    floatText('Withdrawal successful!');
                    points = 0;
                    update();
                    trackEvent('withdraw', { amount: points, txHash: result });
                }
            } catch (err) {
                console.error('Withdrawal error:', err);
                errorText('Withdrawal failed');
            }
        });
        
        return connector;
    } catch (err) {
        console.error('TON Connect initialization error:', err);
        return null;
    }
}

// Telegram Mini Apps Analytics
function trackEvent(eventName, eventParams = {}) {
    try {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.trackEvent(eventName, eventParams);
            console.log('Tracked event:', eventName, eventParams);
        }
    } catch (err) {
        console.error('Analytics error:', err);
    }
}

// Initialize Telegram WebApp - FIXED: Added enableClosingConfirmation
function initTelegram() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        // FIXED: Added mandatory enableClosingConfirmation
        Telegram.WebApp.enableClosingConfirmation();
        
        const user = Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
            $('usernameDisplay').textContent = user.first_name || user.username || 'User';
            $('profileUsername').textContent = user.first_name || user.username || 'User';
            
            if (user.photo_url) {
                $('profilePic').src = user.photo_url;
            }
            
            if (referredBy) {
                points += 50;
                friendsCount += 1;
                floatText('Referral bonus +50 CX!');
                update();
            }
            
            trackEvent('user_identify', { 
                userId: user.id,
                username: user.username,
                first_name: user.first_name
            });
        }
        
        Telegram.WebApp.BackButton.onClick(closeAllModals);
        Telegram.WebApp.BackButton.show();
        trackEvent('app_open');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
}

// Initialize
function init(){
    load();
    update();
    initModals();
    initTelegram();
    initTONConnect();
    createParticles();
    
    energyInterval = setInterval(regenEnergy, 100);
    autoTapperInterval = setInterval(autoTap, 10000);
    playTimeInterval = setInterval(updatePlayTime, 1000);
    setInterval(checkMultiplierExpiry, 1000);
    
    loadShop();
    loadTasks();
    loadBoosts();
    
    $('copyRef').addEventListener('click', () => {
        navigator.clipboard.writeText($('refLink').textContent);
        floatText('Copied!');
        trackEvent('copy_referral');
    });
}

// Start the game
init();