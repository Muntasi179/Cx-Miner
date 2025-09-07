// UI components and modal management
function initModals(){
    const modals = document.querySelectorAll('.modal');
    const btns = document.querySelectorAll('[id$="Btn"]');
    const closes = document.querySelectorAll('[data-close]');
    
    btns.forEach(b => {
        b.addEventListener('click', () => {
            const id = b.id.replace('Btn','Modal');
            const m = document.getElementById(id);
            if(m){
                m.classList.add('show');
                if(id==='tasksModal') loadTasks();
                if(id==='boostsModal') loadBoosts();
                if(id==='shopModal') loadShop();
            }
        });
    });
    
    closes.forEach(c => {
        c.addEventListener('click', () => {
            const m = c.closest('.modal');
            if(m) m.classList.remove('show');
        });
    });
    
    modals.forEach(m => {
        m.addEventListener('click', (e) => {
            if(e.target === m) m.classList.remove('show');
        });
    });
    
    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabContainer = tab.closest('.tab-container');
            const tabContentId = tab.dataset.tab + 'Tab';
            
            tabContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            tabContainer.parentElement.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tabContentId).classList.add('active');
        });
    });
}

// Load boosts
function loadBoosts(){
    const list = $('boostList');
    if (!list) return;
    
    list.innerHTML = '';
    
    for(const [id, config] of Object.entries(BOOSTS_CONFIG)){
        const lvl = boostsLevel[id] || 1;
        const price = config.price(lvl);
        const effect = config.effect(lvl);
        const maxed = lvl >= config.max;
        
        const el = document.createElement('div');
        el.className = 'boost-card';
        el.innerHTML = `
            <div class="boost-header">
                <div class="boost-title">${config.name} ${lvl>1?'Lv.'+lvl:''}</div>
                <div class="boost-level">${maxed ? 'MAX' : 'Lv. ' + lvl}</div>
            </div>
            <div class="boost-desc">${config.desc}</div>
            <div class="boost-stats">
                <span>Current: ${id === 'regen' ? effect.toFixed(1) + '/s' : effect}</span>
                <span>Next: ${!maxed ? (id === 'regen' ? config.effect(lvl+1).toFixed(1) + '/s' : config.effect(lvl+1)) : 'MAX'}</span>
            </div>
            <button class="btn boost-button" ${maxed||points<price?'disabled':''} data-boost="${id}">
                ${maxed?'MAX':`Upgrade (${formatNumber(price)} CX)`}
            </button>
        `;
        
        if(!maxed){
            el.querySelector('button').addEventListener('click', () => {
                if(points >= price){
                    points -= price;
                    boostsLevel[id]++;
                    
                    if (id === 'multitap') {
                        multitap = BOOSTS_CONFIG.multitap.effect(boostsLevel.multitap);
                    }
                    
                    if (id === 'energy') {
                        maxEnergy = BOOSTS_CONFIG.energy.effect(boostsLevel.energy);
                        if (energy > maxEnergy) energy = maxEnergy;
                    }
                    
                    loadBoosts();
                    update();
                    trackEvent('boost_upgrade', { boost: id, level: boostsLevel[id] });
                }
            });
        }
        
        list.appendChild(el);
    }
    
    // Load achievements
    const achList = $('achievementsList');
    if (!achList) return;
    
    achList.innerHTML = '';
    
    const achievementConfig = [
        {id: '100_taps', title: 'First Steps', desc: 'Reach 100 taps', reward: 10},
        {id: '1000_taps', title: 'Tapping Pro', desc: 'Reach 1,000 taps', reward: 50},
        {id: '10000_taps', title: 'Tapping Master', desc: 'Reach 10,000 taps', reward: 200},
        {id: '1000_points', title: 'First Thousand', desc: 'Earn 1,000 CX', reward: 50},
        {id: '10000_points', title: 'CX Collector', desc: 'Earn 10,000 CX', reward: 200},
        {id: '200_energy', title: 'Energy Boost', desc: 'Reach 200 max energy', reward: 100},
        {id: '500_energy', title: 'Energy Master', desc: 'Reach 500 max energy', reward: 500}
    ];
    
    achievementConfig.forEach(ach => {
        const achieved = achievements.includes(ach.id);
        const el = document.createElement('div');
        el.className = 'card';
        el.innerHTML = `
            <div class="info">
                <i class="fas fa-trophy" style="color:${achieved ? 'var(--secondary)' : 'var(--muted)'}"></i>
                <div>
                    <div>${ach.title}</div>
                    <div style="font-size:.9rem;opacity:.9">${ach.desc}</div>
                </div>
            </div>
            <div style="color:var(${achieved ? '--success' : '--muted'});font-weight:bold">
                ${achieved ? '✓' : formatNumber(ach.reward) + ' CX'}
            </div>
        `;
        achList.appendChild(el);
    });
}

// Load shop
function loadShop(){
    // Auto Tappers
    const autoList = $('autoTappersList');
    if (autoList) {
        autoList.innerHTML = '';
        
        shopItems.autoTappers.forEach(item => {
            const el = document.createElement('div');
            el.className = 'shop-item-card';
            el.innerHTML = `
                <div class="shop-item-header">
                    <div class="shop-item-title">${item.name}</div>
                    <div class="shop-item-price">${formatNumber(item.price)} CX</div>
                </div>
                <div class="shop-item-desc">${item.desc}</div>
                <div class="shop-item-footer">
                    <div class="shop-item-owned">Owned: ${item.owned}</div>
                    <button class="btn" ${points < item.price ? 'disabled' : ''} data-shop="autoTappers" data-id="${item.id}">
                        Buy
                    </button>
                </div>
            `;
            
            el.querySelector('button').addEventListener('click', () => {
                if (points >= item.price) {
                    points -= item.price;
                    item.owned++;
                    autoTappers += item.value;
                    loadShop();
                    update();
                    trackEvent('shop_purchase', { item: item.id, type: 'autoTapper' });
                }
            });
            
            autoList.appendChild(el);
        });
    }
    
    // Energy
    const energyList = $('energyList');
    if (energyList) {
        energyList.innerHTML = '';
        
        shopItems.energy.forEach(item => {
            const el = document.createElement('div');
            el.className = 'shop-item-card';
            el.innerHTML = `
                <div class="shop-item-header">
                    <div class="shop-item-title">${item.name}</div>
                    <div class="shop-item-price">${formatNumber(item.price)} CX</div>
                </div>
                <div class="shop-item-desc">${item.desc}</div>
                <div class="shop-item-footer">
                    <div class="shop-item-owned">Owned: ${item.owned}</div>
                    <button class="btn" ${points < item.price ? 'disabled' : ''} data-shop="energy" data-id="${item.id}">
                        Buy
                    </button>
                </div>
            `;
            
            el.querySelector('button').addEventListener('click', () => {
                if (points >= item.price) {
                    points -= item.price;
                    item.owned++;
                    maxEnergy += item.value;
                    loadShop();
                    update();
                    trackEvent('shop_purchase', { item: item.id, type: 'energy' });
                }
            });
            
            energyList.appendChild(el);
        });
    }
    
    // Multipliers
    const multiList = $('multipliersList');
    if (multiList) {
        multiList.innerHTML = '';
        
        shopItems.multipliers.forEach(item => {
            const now = Math.floor(Date.now() / 1000);
            const active = activeMultiplier.expires > now;
            
            const el = document.createElement('div');
            el.className = 'shop-item-card';
            el.innerHTML = `
                <div class="shop-item-header">
                    <div class="shop-item-title">${item.name}</div>
                    <div class="shop-item-price">${formatNumber(item.price)} CX</div>
                </div>
                <div class="shop-item-desc">${item.desc}</div>
                <button class="btn" ${points < item.price || active ? 'disabled' : ''} data-shop="multipliers" data-id="${item.id}">
                    ${active ? 'Active' : 'Activate'}
                </button>
            `;
            
            if (!active) {
                el.querySelector('button').addEventListener('click', () => {
                    if (points >= item.price) {
                        points -= item.price;
                        activeMultiplier = {
                            value: item.value,
                            expires: now + item.duration
                        };
                        loadShop();
                        update();
                        trackEvent('shop_purchase', { item: item.id, type: 'multiplier' });
                    }
                });
            }
            
            multiList.appendChild(el);
        });
    }
    
    // TON Store
    const tonList = $('tonStoreList');
    if (tonList) {
        tonList.innerHTML = '';
        
        shopItems.tonStore.forEach(item => {
            const el = document.createElement('div');
            el.className = 'shop-item-card';
            el.innerHTML = `
                <div class="shop-item-header">
                    <div class="shop-item-title">${item.name}</div>
                    <div class="ton-price">
                        <i class="fab fa-bitcoin"></i> ${item.price} TON
                    </div>
                </div>
                <div class="shop-item-desc">${item.desc}</div>
                <button class="btn" data-shop="tonStore" data-id="${item.id}">
                    Buy with TON
                </button>
            `;
            
            el.querySelector('button').addEventListener('click', () => {
                if (isWalletConnected) {
                    // In a real app, this would process a TON transaction
                    floatText('TON Purchase Complete!');
                    points += item.value;
                    item.owned++;
                    update();
                    trackEvent('ton_purchase', { item: item.id, price: item.price });
                } else {
                    errorText('Connect wallet first');
                }
            });
            
            tonList.appendChild(el);
        });
    }
}

// Load tasks
function loadTasks(){
    const list = $('taskList');
    if (!list) return;
    
    list.innerHTML = '';
    
    TASKS_CONFIG.forEach(task => {
        const completed = completedTasks.includes(task.id);
        
        const el = document.createElement('div');
        el.className = 'card';
        
        el.innerHTML = `
            <div class="info">
                <i class="fab fa-${task.icon}"></i>
                <div>
                    <div>${task.title}</div>
                    <div style="font-size:.9rem;opacity:.9">${task.desc}</div>
                </div>
            </div>
            <button class="btn ${task.disabled ? 'ad-disabled' : ''}" ${completed || task.disabled ? 'disabled' : ''}>
                ${completed ? 'Claimed' : `+${formatNumber(task.reward)} CX`}
            </button>
        `;
        
        if(!completed && !task.disabled){
            el.querySelector('button').addEventListener('click', task.action);
        }
        
        list.appendChild(el);
    });
}

function completeTask(id){
    if(completedTasks.includes(id)) return;
    const task = TASKS_CONFIG.find(t => t.id === id);
    if(!task) return;
    
    completedTasks.push(id);
    points += task.reward;
    floatText('+'+formatNumber(task.reward)+' CX');
    loadTasks();
    update();
    trackEvent('complete_task', { task: id, reward: task.reward });
}