// Purchase handling system
class PurchaseManager {
    constructor() {
        this.pendingTransactions = new Map();
    }

    // Process TON purchase
    async processTONPurchase(itemId, price) {
        if (!gameState.walletConnected) {
            showToast('Please connect your wallet first', 'error');
            return false;
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
            const result = await tonConnectManager.sendTransaction(transaction);
            
            if (result) {
                document.getElementById('walletStatusText').textContent = 'Transaction sent! Waiting for confirmation...';
                
                // Store transaction for verification
                const transactionId = generateId();
                this.pendingTransactions.set(transactionId, {
                    itemId,
                    price,
                    timestamp: Date.now(),
                    status: 'pending'
                });
                
                // Simulate transaction confirmation (in a real app, you would verify on-chain)
                setTimeout(() => {
                    this.completePurchase(transactionId, true);
                }, 3000);
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('TON purchase error:', error);
            document.getElementById('walletConnectionStatus').style.display = 'none';
            showToast('Transaction failed', 'error');
            return false;
        }
    }

    // Process Stars purchase
    async processStarsPurchase(itemId, price) {
        if (gameState.starBalance >= price) {
            gameState.starBalance -= price;
            this.applyItemEffect(itemId);
            updateWalletDisplay();
            gameState.save();
            showToast(`Purchase successful! -${price} Stars`, 'success');
            return true;
        } else {
            showToast(`Not enough Stars for this purchase`, 'error');
            return false;
        }
    }

    // Complete purchase (simulated)
    completePurchase(transactionId, success) {
        const transaction = this.pendingTransactions.get(transactionId);
        if (!transaction) return;

        if (success) {
            // Apply the item effect
            this.applyItemEffect(transaction.itemId);
            
            // Update balances
            gameState.tonBalance -= transaction.price;
            updateWalletDisplay();
            gameState.save();
            
            document.getElementById('walletStatusText').textContent = 'Transaction confirmed!';
            showToast('Purchase confirmed!', 'success');
        } else {
            document.getElementById('walletStatusText').textContent = 'Transaction failed!';
            showToast('Transaction failed', 'error');
        }
        
        // Hide status after delay
        setTimeout(() => {
            document.getElementById('walletConnectionStatus').style.display = 'none';
            this.pendingTransactions.delete(transactionId);
        }, 2000);
    }

    // Apply item effect
    applyItemEffect(itemId) {
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

    // Handle purchase button click
    handlePurchaseClick(event) {
        const itemElement = event.currentTarget;
        const itemId = itemElement.getAttribute('data-id');
        const price = parseFloat(itemElement.getAttribute('data-price'));
        const currency = itemElement.getAttribute('data-currency');
        
        if (currency === 'ton') {
            this.processTONPurchase(itemId, price);
        } else if (currency === 'stars') {
            this.processStarsPurchase(itemId, price);
        }
    }
}

// Create global purchase manager instance
const purchaseManager = new PurchaseManager();