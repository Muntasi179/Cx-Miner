// Game configuration and state management
const BOOSTS_CONFIG = {
    multitap: {
        name: 'Multitap',
        desc: 'Increases taps per click',
        max: 20,
        base: 1,
        effect: (lvl) => 1 + lvl * 0.5,
        price: (lvl) => Math.round(100 * Math.pow(1.5, lvl-1))
    },
    energy: {
        name: 'Max Energy',
        desc: 'Increases maximum energy',
        max: 20,
        base: 100,
        effect: (lvl) => 100 + lvl * 50,
        price: (lvl) => Math.round(200 * Math.pow(1.5, lvl-1))
    },
    regen: {
        name: 'Energy Regen',
        desc: 'Increases energy regeneration rate',
        max: 20,
        base: 0.5,
        effect: (lvl) => 0.5 + lvl * 0.25,
        price: (lvl) => Math.round(300 * Math.pow(1.5, lvl-1))
    }
};

const TASKS_CONFIG = [
    {
        id: 'join_telegram',
        title: 'Join Telegram Channel',
        desc: 'Join our official Telegram channel',
        reward: 5000,
        icon: 'paper-plane',
        action: () => {
            window.open('https://t.me/CloneX_Updates', '_blank');
            completeTask('join_telegram');
        }
    },
    {
        id: 'follow_x',
        title: 'Follow on X (Twitter)',
        desc: 'Follow our official X account',
        reward: 5000,
        icon: 'x-twitter',
        action: () => {
            window.open('https://x.com/clonex_updates', '_blank');
            completeTask('follow_x');
        }
    },
    {
        id: 'watch_ad',
        title: 'Watch Advertisement',
        desc: 'Watch an ad to earn extra CX',
        reward: 1000,
        icon: 'tv',
        disabled: true,
        action: () => {
            errorText('Temporarily unavailable');
        }
    }
];

// Shop items
let shopItems = {
    autoTappers: [
        {id: 'auto1', name: 'Basic Auto Tapper', desc: 'Automatically taps once every 10 seconds', price: 100, value: 1, owned: 0},
        {id: 'auto2', name: 'Advanced Auto Tapper', desc: 'Automatically taps 3 times every 10 seconds', price: 500, value: 3, owned: 0},
        {id: 'auto3', name: 'Pro Auto Tapper', desc: 'Automatically taps 10 times every 10 seconds', price: 2000, value: 10, owned: 0}
    ],
    energy: [
        {id: 'energy1', name: 'Energy Pack', desc: '+50 maximum energy', price: 150, value: 50, owned: 0},
        {id: 'energy2', name: 'Energy Boost', desc: '+100 maximum energy', price: 400, value: 100, owned: 0},
        {id: 'energy3', name: 'Energy Surge', desc: '+200 maximum energy', price: 1000, value: 200, owned: 0}
    ],
    multipliers: [
        {id: 'multi1', name: '2x Multiplier (1h)', desc: 'Double your tap earnings for 1 hour', price: 5000, value: 2, duration: 3600, active: false}
    ],
    tonStore: [
        {id: 'ton1', name: 'Starter Pack', desc: '5,000 CX + 2x Multiplier (2h)', price: 1, currency: 'TON', value: 5000, owned: 0},
        {id: 'ton2', name: 'Pro Pack', desc: '25,000 CX + 3x Multiplier (4h)', price: 5, currency: 'TON', value: 25000, owned: 0},
        {id: 'ton3', name: 'Mega Pack', desc: '100,000 CX + 5x Multiplier (8h)', price: 15, currency: 'TON', value: 100000, owned: 0}
    ]
};