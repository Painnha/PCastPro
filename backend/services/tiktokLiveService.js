const { WebcastPushConnection } = require('tiktok-live-connector');

class TikTokLiveService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.username = '';
        this.commentCallbacks = [];
        this.eventCallbacks = {
            connected: [],
            disconnected: [],
            error: [],
            viewers: []
        };
    }

    /**
     * Kết nối đến TikTok Live stream
     * @param {string} username - TikTok username hoặc uniqueId
     */
    async connect(username) {
        if (this.isConnected) {
            throw new Error('Already connected to a live stream');
        }

        try {
            this.username = username;
            this.connection = new WebcastPushConnection(username, {
                processInitialData: true,
                enableExtendedGiftInfo: true,
                enableWebsocketUpgrade: true,
                requestPollingIntervalMs: 1000
            });

            // Setup event listeners
            this.setupEventListeners();

            // Connect
            const state = await this.connection.connect();
            
            this.isConnected = true;
            
            this.triggerEvent('connected', { 
                username: state.roomInfo.owner.uniqueId,
                viewerCount: state.roomInfo.viewerCount || 0
            });
            
            return {
                success: true,
                username: state.roomInfo.owner.uniqueId,
                roomId: state.roomInfo.roomId,
                viewerCount: state.roomInfo.viewerCount
            };
        } catch (error) {
            this.isConnected = false;
            
            this.triggerEvent('error', { error: error.message });
            
            throw new Error(`Failed to connect: ${error.message}`);
        }
    }

    /**
     * Ngắt kết nối
     */
    disconnect() {
        if (!this.isConnected || !this.connection) {
            return;
        }

        try {
            this.connection.disconnect();
            this.isConnected = false;
            this.username = '';
            
            this.triggerEvent('disconnected', {});
        } catch (error) {
            // Disconnect error
        }
    }

    /**
     * Setup event listeners cho TikTok Live connection
     */
    setupEventListeners() {
        if (!this.connection) return;

        // Chat comments
        this.connection.on('chat', (data) => {
            const comment = {
                username: data.uniqueId,
                nickname: data.nickname,
                text: data.comment,
                timestamp: new Date(),
                profilePictureUrl: data.profilePictureUrl,
                userId: data.userId
            };
            
            // Trigger all registered callbacks
            this.commentCallbacks.forEach(callback => {
                try {
                    callback(comment);
                } catch (error) {
                    // Callback error
                }
            });
        });

        // Gifts
        this.connection.on('gift', (data) => {
            // Format gift as comment for display
            const giftComment = {
                username: data.uniqueId,
                nickname: data.nickname,
                text: `🎁 Tặng ${data.giftName} x${data.repeatCount || 1}`,
                timestamp: new Date(),
                profilePictureUrl: data.profilePictureUrl,
                userId: data.userId,
                isGift: true,
                giftName: data.giftName,
                giftCount: data.repeatCount || 1,
                giftId: data.giftId
            };
            
            // Trigger comment callbacks to display gift as comment
            this.commentCallbacks.forEach(callback => {
                try {
                    callback(giftComment);
                } catch (error) {
                    // Callback error
                }
            });
        });

        // Shares
        this.connection.on('share', (data) => {
            // Share event
        });

        // Follows
        this.connection.on('social', (data) => {
            // Follow event
        });

        // Room stats update
        this.connection.on('roomUser', (data) => {
            // Broadcast viewer count
            const viewerData = {
                viewerCount: data.viewerCount || 0
            };
            
            this.triggerEvent('viewers', viewerData);
        });

        // Stream ended
        this.connection.on('streamEnd', () => {
            this.isConnected = false;
            this.triggerEvent('disconnected', { reason: 'Stream ended' });
        });

        // Connection errors
        this.connection.on('error', (error) => {
            this.triggerEvent('error', { error: error.message });
        });

        // Disconnected
        this.connection.on('disconnected', () => {
            this.isConnected = false;
            this.triggerEvent('disconnected', {});
        });
    }

    /**
     * Đăng ký callback cho comments
     * @param {Function} callback 
     */
    onComment(callback) {
        if (typeof callback === 'function') {
            this.commentCallbacks.push(callback);
        }
    }

    /**
     * Đăng ký callback cho events
     * @param {string} event - 'connected', 'disconnected', 'error'
     * @param {Function} callback 
     */
    on(event, callback) {
        if (this.eventCallbacks[event] && typeof callback === 'function') {
            this.eventCallbacks[event].push(callback);
        }
    }

    /**
     * Trigger event callbacks
     */
    triggerEvent(event, data) {
        if (this.eventCallbacks[event]) {
            this.eventCallbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    // Event callback error
                }
            });
        }
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            username: this.username
        };
    }

    /**
     * Clear all callbacks
     */
    clearCallbacks() {
        this.commentCallbacks = [];
        this.eventCallbacks = {
            connected: [],
            disconnected: [],
            error: []
        };
    }
}

// Singleton instance
const tiktokLiveService = new TikTokLiveService();

module.exports = tiktokLiveService;

