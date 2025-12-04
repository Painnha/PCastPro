const socket = new WebSocket('ws://localhost:3000/ws');


socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'connected', message: 'Observer connected' }));
};


socket.onmessage = async (event) => {
    if (event.data instanceof Blob) {
   
        try {
            const text = await event.data.text();
            const data = JSON.parse(text);
            handleData(data);
        } catch (error) {
            console.error('Error parsing Blob to JSON:', error);
        }
    } else if (typeof event.data === 'string') {

        try {
            const data = JSON.parse(event.data);
            handleData(data);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    } else {
        console.warn('Unknown data type received:', event.data);
    }
};


socket.onclose = () => {
    console.log('WebSocket connection closed');
};


socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};


function handleData(data) {
    switch (data.type) {
        case 'playSound':
            playSound();
            break;
        case 'updateNames':
            updatePlayerNames(data.names);
            break;
        case 'swapHeroes':
            data.swaps.forEach(swap => updateSwapImage(swap.slotId, swap.image));
            break;
        case 'previousPicks':
            updatePreviousPicks(data);
            break;
        case 'resetPreviousPicks':
            resetPreviousPicksDisplay();
            break;
        case 'resetBanPick':
            resetBanPickSlots();
            break;
        default:
            updateSlot(data);
            break;
    }
    switch (data.countdown) {
        case 'restartCountdown':
            startCountdown();
            break;
        default:
            break;
    }
}


function playSound() {
    const lockSound = document.getElementById("lockSound");
    if (lockSound) lockSound.play();
}


function updatePlayerNames(names) {
    const pickSlots = document.querySelectorAll(".slot[id^='pick']");

    pickSlots.forEach((slot, index) => {
        const playerNameElement = slot.querySelector(".player-name");
        if (playerNameElement) {
            const isTeamB = slot.id.includes('B');
            const nameIndex = isTeamB ? 5 + index : index;
            playerNameElement.textContent = names[nameIndex] || "";
        }
    });
}


let countdown;
let timeLeft = 60;
const countdownDisplay = document.getElementById("countdown");

function startCountdown() {
    clearInterval(countdown);
    timeLeft = 60;
    if (countdownDisplay) countdownDisplay.textContent = timeLeft;

    countdown = setInterval(() => {
        timeLeft--;
        if (countdownDisplay) countdownDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
        }
    }, 1000);
}


function updateSlot(data) {
    const slot = document.getElementById(data.slotId);
    if (!slot) return;

    const heroImageDiv = slot.querySelector('.heroImage');
    if (heroImageDiv) {
    heroImageDiv.style.position = 'absolute'
        heroImageDiv.style.backgroundImage = `url(/${data.image})`;
        heroImageDiv.style.backgroundSize = 'cover';
        heroImageDiv.style.backgroundPosition = 'center';
        heroImageDiv.style.width = '100%';
        heroImageDiv.style.height = '100%';
    }

    if (data.type === 'banActive') {
        slot.classList.add('active');
    } else if (data.type === 'lock') {
        slot.classList.add('locked');
        if (heroImageDiv) {
            heroImageDiv.classList.add('locked');
            heroImageDiv.style.animation = 'zoomInOut 1s forwards';
            if (slot.classList.contains('pick')) {
                slot.style.filter = 'none';
            }
            if (slot.classList.contains('ban')) {
                slot.classList.add('grayscale');
                heroImageDiv.style.filter = 'grayscale(100%)';
                slot.style.filter = 'none';
            }
        }
        slot.classList.remove('active');
    } else if (data.type === 'select') {
        slot.classList.add('active');
    }
}


function updateSwapImage(slotId, newImage) {
    const slot = document.getElementById(slotId);
    if (!slot) {
        console.error('Slot not found:', slotId);
        return;
    }

    // Check if there's a heroImage div inside the slot (OBS views)
    const heroImageDiv = slot.querySelector('.heroImage');
    if (heroImageDiv) {
        // For OBS views with heroImage div
        heroImageDiv.style.backgroundImage = newImage ? `url(/${newImage})` : '';
    } else {
        // For manager view (index.html) where slot itself has the background image
        slot.style.backgroundImage = newImage ? `url(${newImage})` : '';
    }
}

// Function to reset ban/pick slots but keep player names
function resetBanPickSlots() {
    // Reset pick slots
    for (let i = 1; i <= 5; i++) {
        ['A', 'B'].forEach(team => {
            const slot = document.getElementById(`pick${team}${i}`);
            if (slot) {
                // Clear hero image
                const heroImageDiv = slot.querySelector('.heroImage');
                if (heroImageDiv) {
                    heroImageDiv.style.backgroundImage = '';
                    heroImageDiv.classList.remove('locked');
                    heroImageDiv.style.animation = '';
                    heroImageDiv.style.filter = '';
                }
                // Remove classes
                slot.classList.remove('active', 'locked');
                // Show lane logo if exists
                const laneLogo = slot.querySelector('.lane-logo');
                if (laneLogo) laneLogo.style.display = 'block';
                // Keep player name - DON'T touch it
            }
        });
    }
    
    // Reset ban slots
    for (let i = 1; i <= 4; i++) {
        ['A', 'B'].forEach(team => {
            const slot = document.getElementById(`ban${team}${i}`);
            if (slot) {
                // Clear hero image
                const heroImageDiv = slot.querySelector('.heroImage');
                if (heroImageDiv) {
                    heroImageDiv.style.backgroundImage = '';
                    heroImageDiv.classList.remove('locked');
                    heroImageDiv.style.animation = '';
                    heroImageDiv.style.filter = '';
                }
                // Remove classes
                slot.classList.remove('active', 'locked', 'grayscale');
                slot.style.filter = '';
            }
        });
    }
}

// Function to reset previous picks display
function resetPreviousPicksDisplay() {
    // Check if we're on PreviousListA or PreviousListB page
    if (window.location.pathname.includes('PreviousListA')) {
        const container = document.getElementById('previousContainerA');
        if (container) {
            container.innerHTML = '';
        }
    } else if (window.location.pathname.includes('PreviousListB')) {
        const container = document.getElementById('previousContainerB');
        if (container) {
            container.innerHTML = '';
        }
    }
}

// Function to update previous picks display
function updatePreviousPicks(data) {
    // Check if we're on PreviousListA or PreviousListB page
    if (window.location.pathname.includes('PreviousListA')) {
        const container = document.getElementById('previousContainerA');
        if (container) {
            // Display all previous matches for Team A
            let html = '';
            // If we have previous matches data, display them
            if (data.previousMatches && data.previousMatches.length > 0) {
                data.previousMatches.forEach((match, index) => {
                    html += `
                        <div class="previous-match">
                            <div class="match-title">G${index + 1}</div>
                            <div class="previous-picks-grid">
                                ${match.picksA.map(pick => `<div class="previous-pick" style="background-image: url(/${pick})"></div>`).join('')}
                            </div>
                        </div>
                    `;
                });
            } else {
                // Fallback to single match data
                html = `
                    <div class="previous-match">
                        <div class="match-title">Ván Trước</div>
                        <div class="previous-picks-grid">
                            ${data.picksA.map(pick => `<div class="previous-pick" style="background-image: url(/${pick})"></div>`).join('')}
                        </div>
                    </div>
                `;
            }
            container.innerHTML = html;
        }
    } else if (window.location.pathname.includes('PreviousListB')) {
        const container = document.getElementById('previousContainerB');
        if (container) {
            // Display all previous matches for Team B
            let html = '';
            // If we have previous matches data, display them
            if (data.previousMatches && data.previousMatches.length > 0) {
                data.previousMatches.forEach((match, index) => {
                    html += `
                        <div class="previous-match">
                            <div class="match-title">G${index + 1}</div>
                            <div class="previous-picks-grid">
                                ${match.picksB.map(pick => `<div class="previous-pick" style="background-image: url(/${pick})"></div>`).join('')}
                            </div>
                        </div>
                    `;
                });
            } else {
                // Fallback to single match data
                html = `
                    <div class="previous-match">
                        <div class="match-title">Ván Trước</div>
                        <div class="previous-picks-grid">
                            ${data.picksB.map(pick => `<div class="previous-pick" style="background-image: url(/${pick})"></div>`).join('')}
                        </div>
                    </div>
                `;
            }
            container.innerHTML = html;
        }
    }
}

// ========== VOTECHAT OVERLAY FUNCTIONS ==========
if (window.location.pathname.includes('VoteChatA') || window.location.pathname.includes('VoteChatB')) {
    const textEl = document.getElementById('votechatText');
    const scoreBoxEl = document.querySelector('.votechat-score');
    const scoreValueEl = document.querySelector('.votechat-score-value');
    const rowEl = document.querySelector('.votechat-row');

    if (textEl && scoreBoxEl && scoreValueEl && rowEl) {
        const isTeamA = window.location.pathname.includes('VoteChatA');
        const PHASE_DURATION = 10000;

        const voteChatState = {
            keyword: '',
            gifts: [],
            mode: 'off', // 'off' | 'chat' | 'gifts'
            currentGiftIndex: 0,
            lastSwitchTime: Date.now(),
            score: 0
        };

        const hasKeyword = () => !!voteChatState.keyword;
        const hasGifts = () => Array.isArray(voteChatState.gifts) && voteChatState.gifts.length > 0;

        const escapeHtml = (text) => {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        const showOff = () => {
            voteChatState.mode = 'off';
            textEl.innerHTML = 'Chưa bật fandomwar';
        };

        const showChat = () => {
            voteChatState.mode = 'chat';

            const safeKeyword = voteChatState.keyword || '';
            const teamClass = isTeamA ? 'team-a' : 'team-b';
            textEl.innerHTML = '' +
                '<span class="votechat-label">CHAT</span>' +
                '<span class="votechat-keyword ' + teamClass + '">' + escapeHtml(safeKeyword) + '</span>' +
                '<span class="votechat-label">NGAY</span>';
        };

        const showGift = (index) => {
            if (!hasGifts()) {
                showOff();
                return;
            }

            voteChatState.mode = 'gifts';

            const gift = voteChatState.gifts[index % voteChatState.gifts.length];
            const icon = gift && gift.icon ? gift.icon : '';
            const giftName = gift && gift.name ? gift.name : '';
            const safeKeyword = voteChatState.keyword || '';
            const teamClass = isTeamA ? 'team-a' : 'team-b';

            textEl.innerHTML = '' +
                '<span class="votechat-label gift-mode">TẶNG</span>' +
                '<img id="votechatGiftImg" class="votechat-gift-img" src="' + escapeHtml(icon) + '" alt="' + escapeHtml(giftName) + '">' +
                '<span class="votechat-label gift-mode">CHO</span>' +
                '<span class="votechat-keyword gift-mode ' + teamClass + '">' + escapeHtml(safeKeyword) + '</span>' +
                '<span class="votechat-label gift-mode">NGAY</span>';

            const img = document.getElementById('votechatGiftImg');
            if (img) {
                img.classList.remove('votechat-gift-anim');
                void img.offsetWidth;
                img.classList.add('votechat-gift-anim');
            }
        };

        const updateFromConfig = (teamData) => {
            if (!teamData) {
                voteChatState.keyword = '';
                voteChatState.gifts = [];
            } else {
                voteChatState.keyword = (teamData.keyword || '').trim();
                voteChatState.gifts = Array.isArray(teamData.gifts) ? teamData.gifts.slice() : [];
            }

            voteChatState.currentGiftIndex = 0;
            voteChatState.lastSwitchTime = Date.now();

            if (!hasKeyword() && !hasGifts()) {
                showOff();
            } else if (hasKeyword() && !hasGifts()) {
                showChat();
            } else if (!hasKeyword() && hasGifts()) {
                showGift(voteChatState.currentGiftIndex);
            } else {
                showChat();
            }
        };

        const updateScore = (score) => {
            voteChatState.score = typeof score === 'number' ? score : 0;
            if (scoreValueEl) {
                try {
                    scoreValueEl.textContent = voteChatState.score.toLocaleString();
                } catch {
                    scoreValueEl.textContent = String(voteChatState.score);
                }
            }
        };

        const tickVoteChat = () => {
            const now = Date.now();

            if (!hasKeyword() && !hasGifts()) {
                showOff();
                return;
            }

            if (hasKeyword() && !hasGifts()) {
                showChat();
                return;
            }

            if (!hasKeyword() && hasGifts()) {
                if (now - voteChatState.lastSwitchTime >= PHASE_DURATION) {
                    voteChatState.currentGiftIndex = (voteChatState.currentGiftIndex + 1) % voteChatState.gifts.length;
                    voteChatState.lastSwitchTime = now;
                }
                showGift(voteChatState.currentGiftIndex);
                return;
            }

            if (voteChatState.mode === 'chat') {
                showChat();
                if (now - voteChatState.lastSwitchTime >= PHASE_DURATION) {
                    voteChatState.mode = 'gifts';
                    voteChatState.currentGiftIndex = 0;
                    voteChatState.lastSwitchTime = now;
                    showGift(voteChatState.currentGiftIndex);
                }
            } else if (voteChatState.mode === 'gifts') {
                showGift(voteChatState.currentGiftIndex);
                if (now - voteChatState.lastSwitchTime >= PHASE_DURATION) {
                    voteChatState.currentGiftIndex++;
                    voteChatState.lastSwitchTime = now;
                    if (voteChatState.currentGiftIndex >= voteChatState.gifts.length) {
                        voteChatState.mode = 'chat';
                        voteChatState.currentGiftIndex = 0;
                        showChat();
                    } else {
                        showGift(voteChatState.currentGiftIndex);
                    }
                }
            } else {
                voteChatState.mode = 'chat';
                voteChatState.lastSwitchTime = now;
                showChat();
            }
        };

        setInterval(tickVoteChat, 1000);

        const previousHandleData = window.handleData || handleData;
        window.handleData = function(data) {
            if (data && data.type === 'fandomwar-config') {
                const teamData = isTeamA ? data.teamA : data.teamB;
                updateFromConfig(teamData);
            } else if (data && data.type === 'fandomwar-votes') {
                const score = isTeamA ? (data.teamAVotes || 0) : (data.teamBVotes || 0);
                updateScore(score);
                if (previousHandleData) {
                    previousHandleData(data);
                }
            } else if (previousHandleData) {
                previousHandleData(data);
            }
        };

        showOff();
    }
}

// ========== CAMERA OVERLAY FUNCTIONS ==========
// Initialize camera overlay if on CameraA or CameraB page
if (window.location.pathname.includes('CameraA') || window.location.pathname.includes('CameraB')) {
    const cameraContainer = document.getElementById('cameraContainer');
    const cameraFrame = document.getElementById('cameraFrame');
    const cameraImage = document.getElementById('cameraImage');
    const playerNameEl = document.getElementById('playerName');
    
    // Determine if this is Team A or Team B
    const isTeamA = window.location.pathname.includes('CameraA');
    
    // Lane mapping backgrounds
    const laneBackgrounds = {
        'Top': isTeamA ? '/images/cameraOverlay/Top_A.png' : '/images/cameraOverlay/Top_B.png',
        'Jung': isTeamA ? '/images/cameraOverlay/Jung_A.png' : '/images/cameraOverlay/Jung_B.png',
        'Mid': isTeamA ? '/images/cameraOverlay/Mid_A.png' : '/images/cameraOverlay/Mid_B.png',
        'ADC': isTeamA ? '/images/cameraOverlay/Ad_A.png' : '/images/cameraOverlay/Ad_B.png',
        'Support': isTeamA ? '/images/cameraOverlay/Sp_A.png' : '/images/cameraOverlay/Sp_B.png'
    };
    
    // Handle camera overlay updates via existing socket
    const originalHandleData = handleData;
    handleData = function(data) {
        // Handle selectLane for camera overlay
        if (data.type === 'selectLane' && cameraContainer && playerNameEl) {
            const { lane, teamA, teamB } = data;
            const teamData = isTeamA ? teamA : teamB;
            
            // Always update background regardless of camera link
            if (laneBackgrounds[lane]) {
                cameraContainer.style.backgroundImage = `url('${laneBackgrounds[lane]}')`;
            }
            
            // Check if we have a camera link/image
            if (teamData && teamData.cameraLink) {
                // Check if this is an image or video
                if (teamData.isImage) {
                    // Show image, hide iframe
                    if (cameraFrame) {
                        cameraFrame.style.display = 'none';
                        cameraFrame.src = '';
                    }
                    if (cameraImage) {
                        cameraImage.style.display = 'block';
                        cameraImage.src = teamData.cameraLink;
                    }
                    console.log(`Camera${isTeamA ? 'A' : 'B'}: Showing IMAGE - ${lane} - ${teamData.playerName || '(no name)'}`);
                } else {
                    // Show iframe, hide image
                    if (cameraImage) {
                        cameraImage.style.display = 'none';
                        cameraImage.src = '';
                    }
                    if (cameraFrame) {
                        cameraFrame.style.display = 'block';
                        
                        let cameraUrl = teamData.cameraLink;
                        // Add autoplay and muted parameters if not already present
                        if (cameraUrl) {
                            const separator = cameraUrl.includes('?') ? '&' : '?';
                            let params = [];
                            
                            if (!cameraUrl.includes('autoplay')) {
                                params.push('autoplay=1');
                            }
                            if (!cameraUrl.includes('muted')) {
                                params.push('muted=1');
                            }
                            if (!cameraUrl.includes('playsinline')) {
                                params.push('playsinline=1');
                            }
                            
                            if (params.length > 0) {
                                cameraUrl = cameraUrl + separator + params.join('&');
                            }
                        }
                        
                        // Force reload by setting src to empty first, then new URL
                        cameraFrame.src = '';
                        setTimeout(() => {
                            cameraFrame.src = cameraUrl;
                        }, 10);
                    }
                    console.log(`Camera${isTeamA ? 'A' : 'B'}: Showing VIDEO - ${lane} - ${teamData.playerName || '(no name)'}`);
                }
            } else {
                // No link - hide both
                if (cameraFrame) {
                    cameraFrame.style.display = 'none';
                    cameraFrame.src = '';
                }
                if (cameraImage) {
                    cameraImage.style.display = 'none';
                    cameraImage.src = '';
                }
                console.log(`Camera${isTeamA ? 'A' : 'B'}: No camera/image - ${lane}`);
            }
            
            // Update player name (empty if no name)
            if (teamData && teamData.playerName) {
                playerNameEl.textContent = teamData.playerName;
            } else {
                playerNameEl.textContent = '';
            }
        }
        
        // Call original handler for other data types
        originalHandleData(data);
    };
}