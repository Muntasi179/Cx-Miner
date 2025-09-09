// Utility functions

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

// Format number with commas
function formatNumber(num) {
    return num.toLocaleString();
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}