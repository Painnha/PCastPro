// ======= FANDOM WAR MODULE =======
// Quản lý kết nối TikTok Live và hiển thị comments

class FandomWar {
  constructor() {
    this.isConnected = false;
    this.currentPlatform = 'tiktok'; // 'tiktok' or 'facebook'
    
    // TikTok
    this.tiktokLiveId = '';
    this.teamAGifts = [];
    this.teamBGifts = [];
    this.availableGifts = []; // Store gifts from database
    this.giftValueMap = {}; // Map gift name to value for vote counting
    
    // Facebook
    this.facebookVideoId = '';
    this.facebookAccessToken = '';
    
    // Shared
    this.teamAKeyword = '';
    this.teamBKeyword = '';
    this.comments = [];
    this.maxComments = 30;
    this.viewerCount = 0;
    this.teamAVotes = 0;
    this.teamBVotes = 0;
    this.apiBaseUrl = 'http://localhost:3000/api/fandomwar';
    
    this.initElements();
    this.setupPlatformTabs(); // Setup tab switching
    this.setupGiftDropdownButtons(); // Setup dropdown buttons (one-time)
    this.loadGifts(); // Load gifts from API (will call setupGiftDropdowns)
    this.attachEventListeners();
    this.updateViewersDisplay();
    this.updateVotesDisplay();
    
    // Check và restore connection state khi load page
    this.checkConnectionStatus();
  }

  initElements() {
    // TikTok input elements
    this.tiktokLiveInput = document.getElementById('tiktokLiveId');
    this.teamAKeywordInput = document.getElementById('teamAKeyword');
    this.teamBKeywordInput = document.getElementById('teamBKeyword');
    
    // TikTok buttons
    this.connectTikTokBtn = document.getElementById('connectTikTokBtn');
    this.disconnectTikTokBtn = document.getElementById('disconnectTikTokBtn');
    this.resetTikTokBtn = document.getElementById('resetTikTokBtn');
    
    // Facebook input elements
    this.facebookVideoIdInput = document.getElementById('facebookVideoId');
    this.facebookAccessTokenInput = document.getElementById('facebookAccessToken');
    this.teamAKeywordFbInput = document.getElementById('teamAKeywordFb');
    this.teamBKeywordFbInput = document.getElementById('teamBKeywordFb');
    
    // Facebook buttons
    this.connectFacebookBtn = document.getElementById('connectFacebookBtn');
    this.disconnectFacebookBtn = document.getElementById('disconnectFacebookBtn');
    this.resetFacebookBtn = document.getElementById('resetFacebookBtn');
    
    // Display elements (shared)
    this.commentsContainer = document.getElementById('commentsContainer');
    this.viewersCount = document.getElementById('viewersCount');
    this.teamAVotesDisplay = document.getElementById('teamAVotes');
    this.teamBVotesDisplay = document.getElementById('teamBVotes');
    this.teamAVotesFbDisplay = document.getElementById('teamAVotesFb');
    this.teamBVotesFbDisplay = document.getElementById('teamBVotesFb');
    
    // Gift dropdown elements (TikTok only)
    this.teamAGiftBtn = document.getElementById('teamAGiftBtn');
    this.teamAGiftDropdown = document.getElementById('teamAGiftDropdown');
    this.teamBGiftBtn = document.getElementById('teamBGiftBtn');
    this.teamBGiftDropdown = document.getElementById('teamBGiftDropdown');
  }
  
  setupPlatformTabs() {
    const tabs = document.querySelectorAll('.platform-tab');
    const contents = document.querySelectorAll('.platform-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const platform = tab.dataset.platform;
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        contents.forEach(c => c.classList.remove('active'));
        document.getElementById(`${platform}Content`).classList.add('active');
        
        // Update current platform
        this.currentPlatform = platform;
      });
    });
  }

  attachEventListeners() {
    // TikTok event listeners
    this.connectTikTokBtn.addEventListener('click', () => this.connectTikTok());
    this.disconnectTikTokBtn.addEventListener('click', () => this.disconnectTikTok());
    this.resetTikTokBtn.addEventListener('click', () => this.resetTikTok());
    
    this.teamAKeywordInput.addEventListener('change', (e) => {
      this.teamAKeyword = e.target.value.trim();
      this.saveSettings();
    });
    
    this.teamBKeywordInput.addEventListener('change', (e) => {
      this.teamBKeyword = e.target.value.trim();
      this.saveSettings();
    });
    
    // Facebook event listeners
    this.connectFacebookBtn.addEventListener('click', () => this.connectFacebook());
    this.disconnectFacebookBtn.addEventListener('click', () => this.disconnectFacebook());
    this.resetFacebookBtn.addEventListener('click', () => this.resetFacebook());
    
    this.teamAKeywordFbInput.addEventListener('change', (e) => {
      this.teamAKeyword = e.target.value.trim();
      this.saveSettings();
    });
    
    this.teamBKeywordFbInput.addEventListener('change', (e) => {
      this.teamBKeyword = e.target.value.trim();
      this.saveSettings();
    });
    
    // Load saved settings
    this.loadSettings();
  }

  // ========== TIKTOK METHODS ==========
  
  async connectTikTok() {
    // Check if Facebook is currently connected
    if (this.isConnected && this.currentPlatform === 'facebook') {
      alert('Facebook Live đang kết nối. Vui lòng ngắt kết nối Facebook trước khi kết nối TikTok!');
      return;
    }
    
    this.tiktokLiveId = this.tiktokLiveInput.value.trim();
    
    if (!this.tiktokLiveId) {
      alert('Vui lòng nhập TikTok Live ID (username)!');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Bạn cần đăng nhập trước!');
        return;
      }

      this.connectTikTokBtn.disabled = true;
      this.connectTikTokBtn.textContent = 'Đang kết nối...';
      
      const response = await fetch(`${this.apiBaseUrl}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: this.tiktokLiveId })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.isConnected = true;
        this.currentPlatform = 'tiktok';
        
        // Save connection state to localStorage
        this.saveConnectionState();
        
        // Reset votes when starting new connection
        this.teamAVotes = 0;
        this.teamBVotes = 0;
        this.updateVotesDisplay();
        
        this.updateTikTokConnectionStatus();
        this.showNotification('Đã kết nối với TikTok Live!', 'success');
      } else {
        throw new Error(result.message || 'Kết nối thất bại');
      }
    } catch (error) {
      console.error('TikTok connection error:', error);
      this.showNotification(error.message || 'Không thể kết nối. Vui lòng thử lại!', 'error');
      this.connectTikTokBtn.disabled = false;
      this.connectTikTokBtn.textContent = 'Kết nối';
    }
  }

  async disconnectTikTok() {
    if (!this.isConnected || this.currentPlatform !== 'tiktok') return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${this.apiBaseUrl}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.isConnected = false;
        
        // Clear connection state from localStorage
        this.clearConnectionState();
        
        this.updateTikTokConnectionStatus();
        this.showNotification('Đã ngắt kết nối!', 'info');
      }
    } catch (error) {
      console.error('TikTok disconnect error:', error);
      this.isConnected = false;
      this.clearConnectionState();
      this.updateTikTokConnectionStatus();
    }
  }

  async resetTikTok() {
    await this.disconnectTikTok();
    
    // Clear TikTok inputs
    this.tiktokLiveInput.value = '';
    this.teamAKeywordInput.value = '';
    this.teamBKeywordInput.value = '';
    
    // Clear comments, viewers and votes
    this.comments = [];
    this.viewerCount = 0;
    this.teamAVotes = 0;
    this.teamBVotes = 0;
    this.updateCommentsDisplay();
    this.updateViewersDisplay();
    this.updateVotesDisplay();
    
    // Clear saved settings
    localStorage.removeItem('fandomwar_settings');
    this.clearConnectionState();
    
    this.showNotification('Đã reset TikTok!', 'info');
  }

  updateTikTokConnectionStatus() {
    if (this.isConnected && this.currentPlatform === 'tiktok') {
      this.connectTikTokBtn.disabled = true;
      this.connectTikTokBtn.textContent = 'Đã kết nối';
      this.connectTikTokBtn.classList.add('connected');
      this.disconnectTikTokBtn.disabled = false;
      this.tiktokLiveInput.disabled = true;
    } else {
      this.connectTikTokBtn.disabled = false;
      this.connectTikTokBtn.textContent = 'Kết nối';
      this.connectTikTokBtn.classList.remove('connected');
      this.disconnectTikTokBtn.disabled = true;
      this.tiktokLiveInput.disabled = false;
    }
  }
  
  // ========== FACEBOOK METHODS ==========
  
  async connectFacebook() {
    // Check if TikTok is currently connected
    if (this.isConnected && this.currentPlatform === 'tiktok') {
      alert('TikTok Live đang kết nối. Vui lòng ngắt kết nối TikTok trước khi kết nối Facebook!');
      return;
    }
    
    this.facebookVideoId = this.facebookVideoIdInput.value.trim();
    this.facebookAccessToken = this.facebookAccessTokenInput.value.trim();
    
    if (!this.facebookVideoId || !this.facebookAccessToken) {
      alert('Vui lòng nhập Video ID và Access Token!');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Bạn cần đăng nhập trước!');
        return;
      }

      this.connectFacebookBtn.disabled = true;
      this.connectFacebookBtn.textContent = 'Đang kết nối...';
      
      const response = await fetch(`${this.apiBaseUrl}/facebook/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          videoId: this.facebookVideoId,
          accessToken: this.facebookAccessToken
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.isConnected = true;
        this.currentPlatform = 'facebook';
        
        // Save connection state to localStorage
        this.saveConnectionState();
        
        // Reset votes when starting new connection
        this.teamAVotes = 0;
        this.teamBVotes = 0;
        this.updateVotesDisplay();
        
        this.updateFacebookConnectionStatus();
        this.showNotification('Đã kết nối với Facebook Live!', 'success');
      } else {
        throw new Error(result.message || 'Kết nối thất bại');
      }
    } catch (error) {
      console.error('Facebook connection error:', error);
      this.showNotification(error.message || 'Không thể kết nối. Vui lòng thử lại!', 'error');
      this.connectFacebookBtn.disabled = false;
      this.connectFacebookBtn.textContent = 'Kết nối';
    }
  }
  
  async disconnectFacebook() {
    if (!this.isConnected || this.currentPlatform !== 'facebook') return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${this.apiBaseUrl}/facebook/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.isConnected = false;
        
        // Clear connection state from localStorage
        this.clearConnectionState();
        
        this.updateFacebookConnectionStatus();
        this.showNotification('Đã ngắt kết nối!', 'info');
      }
    } catch (error) {
      console.error('Facebook disconnect error:', error);
      this.isConnected = false;
      this.clearConnectionState();
      this.updateFacebookConnectionStatus();
    }
  }
  
  async resetFacebook() {
    await this.disconnectFacebook();
    
    // Clear Facebook inputs
    this.facebookVideoIdInput.value = '';
    this.facebookAccessTokenInput.value = '';
    this.teamAKeywordFbInput.value = '';
    this.teamBKeywordFbInput.value = '';
    
    // Clear comments, viewers and votes
    this.comments = [];
    this.viewerCount = 0;
    this.teamAVotes = 0;
    this.teamBVotes = 0;
    this.updateCommentsDisplay();
    this.updateViewersDisplay();
    this.updateVotesDisplay();
    
    // Clear saved settings
    localStorage.removeItem('fandomwar_settings');
    this.clearConnectionState();
    
    this.showNotification('Đã reset Facebook!', 'info');
  }
  
  updateFacebookConnectionStatus() {
    if (this.isConnected && this.currentPlatform === 'facebook') {
      this.connectFacebookBtn.disabled = true;
      this.connectFacebookBtn.textContent = 'Đã kết nối';
      this.connectFacebookBtn.classList.add('connected');
      this.disconnectFacebookBtn.disabled = false;
      this.facebookVideoIdInput.disabled = true;
      this.facebookAccessTokenInput.disabled = true;
    } else {
      this.connectFacebookBtn.disabled = false;
      this.connectFacebookBtn.textContent = 'Kết nối';
      this.connectFacebookBtn.classList.remove('connected');
      this.disconnectFacebookBtn.disabled = true;
      this.facebookVideoIdInput.disabled = false;
      this.facebookAccessTokenInput.disabled = false;
    }
  }

  handleWebSocketMessage(message) {
    // ========== TIKTOK MESSAGES ==========
    if (message.type === 'tiktok-comment') {
      const comment = message.data;
      this.addComment(
        comment.nickname || comment.username,
        comment.text,
        comment.timestamp ? new Date(comment.timestamp) : new Date(),
        comment.isGift || false,
        comment.giftName || ''
      );
    }
    
    else if (message.type === 'tiktok-viewers') {
      this.viewerCount = message.data.viewerCount || 0;
      this.updateViewersDisplay();
    }
    
    else if (message.type === 'tiktok-connected') {
      this.viewerCount = message.data.viewerCount || 0;
      this.updateViewersDisplay();
    }
    
    else if (message.type === 'tiktok-disconnected') {
      if (this.isConnected && this.currentPlatform === 'tiktok') {
        this.isConnected = false;
        this.viewerCount = 0;
        this.teamAVotes = 0;
        this.teamBVotes = 0;
        this.updateTikTokConnectionStatus();
        this.updateViewersDisplay();
        this.updateVotesDisplay();
        this.showNotification('Kết nối TikTok đã bị ngắt', 'warning');
      }
    }
    
    else if (message.type === 'tiktok-error') {
      this.showNotification('Lỗi kết nối TikTok Live', 'error');
    }
    
    // ========== FACEBOOK MESSAGES ==========
    else if (message.type === 'facebook-comment') {
      const comment = message.data;
      this.addComment(
        comment.nickname || comment.username,
        comment.text,
        comment.timestamp ? new Date(comment.timestamp) : new Date(),
        false, // Facebook không có gifts
        ''
      );
    }
    
    else if (message.type === 'facebook-connected') {
      // Facebook không có viewer count trong API
      this.showNotification('Đã kết nối Facebook Live', 'success');
    }
    
    else if (message.type === 'facebook-disconnected') {
      if (this.isConnected && this.currentPlatform === 'facebook') {
        this.isConnected = false;
        this.viewerCount = 0;
        this.teamAVotes = 0;
        this.teamBVotes = 0;
        this.updateFacebookConnectionStatus();
        this.updateViewersDisplay();
        this.updateVotesDisplay();
        this.showNotification('Kết nối Facebook đã bị ngắt', 'warning');
      }
    }
    
    else if (message.type === 'facebook-error') {
      this.showNotification('Lỗi kết nối Facebook Live', 'error');
    }
  }

  addComment(username, text, timestamp = new Date(), isGift = false, giftName = '') {
    let team = null;
    let voteValue = 1; // Default vote value
    
    // Nếu là gift, check xem có trong danh sách gifts được chọn không
    if (isGift && giftName) {
      if (this.teamAGifts.includes(giftName)) {
        team = 'team-a';
        // Get gift value from map
        voteValue = this.giftValueMap[giftName] || 1;
      } else if (this.teamBGifts.includes(giftName)) {
        team = 'team-b';
        // Get gift value from map
        voteValue = this.giftValueMap[giftName] || 1;
      }
    } else {
      // Nếu là comment thường, check keyword
      team = this.detectTeam(text);
      voteValue = 1; // Comments always count as 1
    }
    
    const comment = {
      username,
      text,
      timestamp,
      team: team,
      isGift: isGift
    };
    
    // Count votes for teams with value multiplier
    if (team === 'team-a') {
      this.teamAVotes += voteValue;
      this.updateVotesDisplay();
    } else if (team === 'team-b') {
      this.teamBVotes += voteValue;
      this.updateVotesDisplay();
    }
    
    this.comments.unshift(comment);
    
    // Limit comments array size
    if (this.comments.length > this.maxComments) {
      this.comments = this.comments.slice(0, this.maxComments);
    }
    
    this.updateCommentsDisplay();
  }

  detectTeam(text) {
    const textTrimmed = text.trim().toLowerCase();
    
    // Check keywords based on current platform
    if (this.currentPlatform === 'tiktok') {
      // TikTok keywords
      if (this.teamAKeyword && textTrimmed === this.teamAKeyword.trim().toLowerCase()) {
        return 'team-a';
      }
      
      if (this.teamBKeyword && textTrimmed === this.teamBKeyword.trim().toLowerCase()) {
        return 'team-b';
      }
    } else if (this.currentPlatform === 'facebook') {
      // Facebook keywords
      const teamAKeywordFb = this.teamAKeywordFbInput?.value.trim().toLowerCase();
      const teamBKeywordFb = this.teamBKeywordFbInput?.value.trim().toLowerCase();
      
      if (teamAKeywordFb && textTrimmed === teamAKeywordFb) {
        return 'team-a';
      }
      
      if (teamBKeywordFb && textTrimmed === teamBKeywordFb) {
        return 'team-b';
      }
    }
    
    return null;
  }

  updateCommentsDisplay() {
    if (this.comments.length === 0) {
      this.commentsContainer.innerHTML = '<div class="no-comments">Chưa có bình luận nào</div>';
      return;
    }
    
    const html = this.comments.map(comment => {
      const teamClass = comment.team ? comment.team : '';
      const giftClass = comment.isGift ? 'gift' : '';
      const combinedClass = [teamClass, giftClass].filter(c => c).join(' ');
      const timeStr = this.formatTime(comment.timestamp);
      
      return `
        <div class="comment-item ${combinedClass}">
          <div class="comment-username">${this.escapeHtml(comment.username)}</div>
          <div class="comment-text">${this.escapeHtml(comment.text)}</div>
          <div class="comment-time">${timeStr}</div>
        </div>
      `;
    }).join('');
    
    this.commentsContainer.innerHTML = html;
  }

  updateViewersDisplay() {
    if (this.viewerCount === 0) {
      this.viewersCount.textContent = '👁️ 0';
    } else if (this.viewerCount >= 1000000) {
      this.viewersCount.textContent = `👁️ ${(this.viewerCount / 1000000).toFixed(1)}M`;
    } else if (this.viewerCount >= 1000) {
      this.viewersCount.textContent = `👁️ ${(this.viewerCount / 1000).toFixed(1)}K`;
    } else {
      this.viewersCount.textContent = `👁️ ${this.viewerCount}`;
    }
  }

  updateVotesDisplay() {
    // Format Team A votes
    const teamAText = this.formatVoteCount(this.teamAVotes);
    const teamBText = this.formatVoteCount(this.teamBVotes);
    
    // Update TikTok displays
    if (this.teamAVotesDisplay) {
      this.teamAVotesDisplay.textContent = teamAText;
    }
    if (this.teamBVotesDisplay) {
      this.teamBVotesDisplay.textContent = teamBText;
    }
    
    // Update Facebook displays
    if (this.teamAVotesFbDisplay) {
      this.teamAVotesFbDisplay.textContent = teamAText;
    }
    if (this.teamBVotesFbDisplay) {
      this.teamBVotesFbDisplay.textContent = teamBText;
    }
    
    // Broadcast vote counts to OBS views via WebSocket
    this.broadcastVoteCounts();
  }
  
  formatVoteCount(count) {
    if (count === 0) {
      return '🔥 0';
    } else if (count >= 1000000) {
      return `🔥 ${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `🔥 ${(count / 1000).toFixed(1)}K`;
    } else {
      return `🔥 ${count}`;
    }
  }
  
  broadcastVoteCounts() {
    // Check if banpickSocket is available
    if (window.banpickSocket && window.banpickSocket.readyState === WebSocket.OPEN) {
      const voteData = {
        type: 'fandomwar-votes',
        teamAVotes: this.teamAVotes,
        teamBVotes: this.teamBVotes
      };
      
      try {
        window.banpickSocket.send(JSON.stringify(voteData));
      } catch (error) {
        console.error('Error broadcasting vote counts:', error);
      }
    }
  }

  formatTime(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return `${diff}s trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
    return date.toLocaleDateString('vi-VN');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = 'info') {
    
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `fandomwar-toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast styles if not exists
    if (!document.getElementById('fandomwar-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'fandomwar-toast-styles';
      style.textContent = `
        .fandomwar-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          z-index: 10000;
          animation: slideIn 0.3s ease-out;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .toast-success { background: #10b981; }
        .toast-error { background: #ef4444; }
        .toast-info { background: #3b82f6; }
        .toast-warning { background: #f59e0b; }
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  saveSettings() {
    const settings = {
      tiktokLiveId: this.tiktokLiveId,
      teamAKeyword: this.teamAKeyword,
      teamBKeyword: this.teamBKeyword
    };
    
    localStorage.setItem('fandomwar_settings', JSON.stringify(settings));
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('fandomwar_settings');
      if (!saved) return;
      
      const settings = JSON.parse(saved);
      
      if (settings.tiktokLiveId) {
        this.tiktokLiveInput.value = settings.tiktokLiveId;
        this.tiktokLiveId = settings.tiktokLiveId;
      }
      
      if (settings.teamAKeyword) {
        this.teamAKeywordInput.value = settings.teamAKeyword;
        this.teamAKeyword = settings.teamAKeyword;
      }
      
      if (settings.teamBKeyword) {
        this.teamBKeywordInput.value = settings.teamBKeyword;
        this.teamBKeyword = settings.teamBKeyword;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  saveConnectionState() {
    const connectionState = {
      isConnected: true,
      platform: this.currentPlatform, // Save which platform is connected
      tiktokLiveId: this.tiktokLiveId,
      teamAKeyword: this.teamAKeyword,
      teamBKeyword: this.teamBKeyword,
      facebookVideoId: this.facebookVideoId,
      facebookAccessToken: this.facebookAccessToken,
      teamAKeywordFb: this.teamAKeywordFbInput?.value.trim() || '',
      teamBKeywordFb: this.teamBKeywordFbInput?.value.trim() || '',
      timestamp: Date.now()
    };
    localStorage.setItem('fandomwar_connection', JSON.stringify(connectionState));
  }

  clearConnectionState() {
    localStorage.removeItem('fandomwar_connection');
  }

  async checkConnectionStatus() {
    try {
      const saved = localStorage.getItem('fandomwar_connection');
      if (!saved) return;
      
      const connectionState = JSON.parse(saved);
      
      // Check nếu connection state quá cũ (> 10 phút) thì bỏ qua
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - connectionState.timestamp > tenMinutes) {
        this.clearConnectionState();
        return;
      }
      
      // Verify với backend xem còn connected không
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch(`${this.apiBaseUrl}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data.isConnected) {
          // Backend vẫn đang connected, restore UI state
          this.isConnected = true;
          const platform = connectionState.platform || 'tiktok'; // Default to tiktok for backward compatibility
          this.currentPlatform = platform;
          
          if (platform === 'tiktok') {
            // Restore TikTok connection
            this.tiktokLiveId = connectionState.tiktokLiveId;
            this.teamAKeyword = connectionState.teamAKeyword;
            this.teamBKeyword = connectionState.teamBKeyword;
            
            // Restore input values
            this.tiktokLiveInput.value = this.tiktokLiveId;
            this.teamAKeywordInput.value = this.teamAKeyword;
            this.teamBKeywordInput.value = this.teamBKeyword;
            
            // Update UI
            this.connectTikTokBtn.textContent = 'Đang kết nối...';
            this.connectTikTokBtn.disabled = true;
            this.disconnectTikTokBtn.disabled = false;
            this.tiktokLiveInput.disabled = true;
            
            // Wait một chút rồi update sang "Đã kết nối"
            setTimeout(() => {
              this.updateTikTokConnectionStatus();
            }, 1000);
            
            this.showNotification('Đã khôi phục kết nối TikTok Live', 'info');
            
          } else if (platform === 'facebook') {
            // Restore Facebook connection
            this.facebookVideoId = connectionState.facebookVideoId;
            this.facebookAccessToken = connectionState.facebookAccessToken;
            
            // Restore input values
            this.facebookVideoIdInput.value = this.facebookVideoId;
            this.facebookAccessTokenInput.value = this.facebookAccessToken;
            
            // Restore Facebook keywords
            if (connectionState.teamAKeywordFb) {
              this.teamAKeywordFbInput.value = connectionState.teamAKeywordFb;
            }
            if (connectionState.teamBKeywordFb) {
              this.teamBKeywordFbInput.value = connectionState.teamBKeywordFb;
            }
            
            // Switch to Facebook tab
            const facebookTab = document.querySelector('.platform-tab[data-platform="facebook"]');
            if (facebookTab) {
              facebookTab.click();
            }
            
            // Update UI
            this.connectFacebookBtn.textContent = 'Đang kết nối...';
            this.connectFacebookBtn.disabled = true;
            this.disconnectFacebookBtn.disabled = false;
            this.facebookVideoIdInput.disabled = true;
            this.facebookAccessTokenInput.disabled = true;
            
            // Wait một chút rồi update sang "Đã kết nối"
            setTimeout(() => {
              this.updateFacebookConnectionStatus();
            }, 1000);
            
            this.showNotification('Đã khôi phục kết nối Facebook Live', 'info');
          }
        } else {
          // Backend không còn connected, clear state
          this.clearConnectionState();
        }
      } else {
        this.clearConnectionState();
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      this.clearConnectionState();
    }
  }

  async loadGifts() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`${this.apiBaseUrl}/gifts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.gifts && data.gifts.length > 0) {
          this.availableGifts = data.gifts;
          
          // Build gift value map for vote counting
          this.giftValueMap = {};
          data.gifts.forEach(gift => {
            this.giftValueMap[gift.name] = gift.value;
          });
          
          // Render gifts and setup checkbox event listeners
          this.setupGiftDropdowns();
        } else {
          console.warn('No gifts found in database');
        }
      } else {
        console.error('Failed to load gifts from API');
      }
    } catch (error) {
      console.error('Error loading gifts:', error);
    }
  }

  renderGiftOptions() {
    // Find gift options containers
    const teamAOptions = this.teamAGiftDropdown.querySelector('.gift-options');
    const teamBOptions = this.teamBGiftDropdown.querySelector('.gift-options');
    
    if (!teamAOptions || !teamBOptions) {
      console.error('Gift options containers not found');
      return;
    }
    
    // Clear existing options
    teamAOptions.innerHTML = '';
    teamBOptions.innerHTML = '';
    
    // Render gifts for both teams
    this.availableGifts.forEach(gift => {
      // Team A
      const labelA = document.createElement('label');
      labelA.className = 'gift-option';
      labelA.innerHTML = `
        <input type="checkbox" value="${gift.name}" />
        <img src="${gift.icon}" alt="${gift.name}" class="gift-icon" />
        <span>${gift.name} (x${gift.value})</span>
      `;
      teamAOptions.appendChild(labelA);
      
      // Team B
      const labelB = document.createElement('label');
      labelB.className = 'gift-option';
      labelB.innerHTML = `
        <input type="checkbox" value="${gift.name}" />
        <img src="${gift.icon}" alt="${gift.name}" class="gift-icon" />
        <span>${gift.name} (x${gift.value})</span>
      `;
      teamBOptions.appendChild(labelB);
    });
  }

  setupGiftDropdownButtons() {
    // Setup dropdown toggle buttons (one-time setup)
    this.teamAGiftBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.teamAGiftDropdown.classList.toggle('show');
      this.teamBGiftDropdown.classList.remove('show');
      this.teamAGiftBtn.classList.toggle('active');
      this.teamBGiftBtn.classList.remove('active');
    });

    this.teamBGiftBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.teamBGiftDropdown.classList.toggle('show');
      this.teamAGiftDropdown.classList.remove('show');
      this.teamBGiftBtn.classList.toggle('active');
      this.teamAGiftBtn.classList.remove('active');
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.teamAGiftDropdown.contains(e.target) && !this.teamAGiftBtn.contains(e.target)) {
        this.teamAGiftDropdown.classList.remove('show');
        this.teamAGiftBtn.classList.remove('active');
      }
      if (!this.teamBGiftDropdown.contains(e.target) && !this.teamBGiftBtn.contains(e.target)) {
        this.teamBGiftDropdown.classList.remove('show');
        this.teamBGiftBtn.classList.remove('active');
      }
    });
  }

  setupGiftDropdowns() {
    // Render gifts dynamically for both teams
    this.renderGiftOptions();
    
    // Handle Team A gift selection
    const teamACheckboxes = this.teamAGiftDropdown.querySelectorAll('input[type="checkbox"]');
    teamACheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const newTeamACheckboxes = this.teamAGiftDropdown.querySelectorAll('input[type="checkbox"]');
        this.teamAGifts = Array.from(newTeamACheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        this.saveGiftSettings();
      });
    });

    // Handle Team B gift selection
    const teamBCheckboxes = this.teamBGiftDropdown.querySelectorAll('input[type="checkbox"]');
    teamBCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const newTeamBCheckboxes = this.teamBGiftDropdown.querySelectorAll('input[type="checkbox"]');
        this.teamBGifts = Array.from(newTeamBCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        this.saveGiftSettings();
      });
    });

    // Load saved gift selections
    this.loadGiftSettings();
  }

  saveGiftSettings() {
    const settings = {
      teamAGifts: this.teamAGifts,
      teamBGifts: this.teamBGifts
    };
    localStorage.setItem('fandomwar_gifts', JSON.stringify(settings));
  }

  loadGiftSettings() {
    try {
      const saved = localStorage.getItem('fandomwar_gifts');
      if (!saved) return;

      const settings = JSON.parse(saved);

      if (settings.teamAGifts) {
        this.teamAGifts = settings.teamAGifts;
        const teamACheckboxes = this.teamAGiftDropdown.querySelectorAll('input[type="checkbox"]');
        teamACheckboxes.forEach(checkbox => {
          checkbox.checked = this.teamAGifts.includes(checkbox.value);
        });
      }

      if (settings.teamBGifts) {
        this.teamBGifts = settings.teamBGifts;
        const teamBCheckboxes = this.teamBGiftDropdown.querySelectorAll('input[type="checkbox"]');
        teamBCheckboxes.forEach(checkbox => {
          checkbox.checked = this.teamBGifts.includes(checkbox.value);
        });
      }
    } catch (error) {
      console.error('Error loading gift settings:', error);
    }
  }
}

// Initialize FandomWar when DOM is ready (only once)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.fandomWar) {
      window.fandomWar = new FandomWar();
    }
  });
} else {
  if (!window.fandomWar) {
    window.fandomWar = new FandomWar();
  }
}

