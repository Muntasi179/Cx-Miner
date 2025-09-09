// TON Connect integration
class TONConnectManager {
    constructor() {
        this.connector = null;
        this.initialized = false;
    }

    // Initialize TON Connect
    async init() {
        try {
            // Create a connector instance
            this.connector = new TonConnectSDK.TonConnect({
                manifestUrl: 'https://muntasil79.github.io/Cx-Miner/tonconnect-manifest.json'
            });
            
            // Check if connection is already restored
            if (this.connector.connected) {
                gameState.walletConnected = true;
                document.getElementById('walletBtn').classList.add('wallet-connected');
                
                // Get wallet information
                const walletInfo = this.connector.wallet;
                if (walletInfo) {
                    // Fetch real balance from blockchain
                    await this.fetchRealBalances(walletInfo.account.address);
                }
            }
            
            // Subscribe to connection changes
            this.connector.onStatusChange(async walletInfo => {
                if (walletInfo) {
                    gameState.walletConnected = true;
                    document.getElementById('walletBtn').classList.add('wallet-connected');
                    document.getElementById('disconnectWallet').style.display = 'block';
                    
                    // Fetch real balances
                    await this.fetchRealBalances(walletInfo.account.address);
                    
                    showToast('Wallet connected successfully', 'success');
                } else {
                    gameState.walletConnected = false;
                    document.getElementById('walletBtn').classList.remove('wallet-connected');
                    document.getElementById('disconnectWallet').style.display = 'none';
                    gameState.tonBalance = 0;
                    updateWalletDisplay();
                }
            });
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('TON Connect initialization failed:', error);
            showToast('Failed to initialize wallet connection', 'error');
            return false;
        }
    }

    // Fetch real balances from blockchain
    async fetchRealBalances(walletAddress) {
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

    // Connect to specific wallet
    connectWallet(walletType) {
        if (!this.connector || !this.initialized) {
            showToast('TON Connect not initialized', 'error');
            return;
        }

        let universalLink;
        switch(walletType) {
            case 'tonkeeper':
                universalLink = this.connector.connect({ tonkeeper: 'tonkeeper' });
                break;
            case 'tonhub':
                universalLink = this.connector.connect({ tonhub: 'tonhub' });
                break;
            default:
                showToast('Unknown wallet type', 'error');
                return;
        }
        
        window.open(universalLink, '_blank');
    }

    // Disconnect wallet
    disconnectWallet() {
        if (this.connector && this.initialized) {
            this.connector.disconnect();
        }
    }

    // Send transaction
    async sendTransaction(transaction) {
        if (!this.connector || !this.initialized) {
            showToast('Wallet not connected', 'error');
            return null;
        }

        try {
            return await this.connector.sendTransaction(transaction);
        } catch (error) {
            console.error('Transaction failed:', error);
            showToast('Transaction failed', 'error');
            return null;
        }
    }
}

// Create global TON Connect instance
const tonConnectManager = new TONConnectManager();