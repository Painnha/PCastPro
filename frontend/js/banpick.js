

// Kết nối WebSocket với token từ localStorage
const socket = new WebSocket('ws://localhost:3000/ws');

// Khi kết nối WebSocket được thiết lập
socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'connected', message: 'Observer connected' }));
};

// Khi nhận được tin nhắn từ server
socket.onmessage = async (event) => {
    if (event.data instanceof Blob) {
        // Xử lý Blob: Chuyển đổi sang văn bản
        try {
            const text = await event.data.text();
            const data = JSON.parse(text);
            handleData(data);
        } catch (error) {
            console.error('Error parsing Blob to JSON:', error);
        }
    } else if (typeof event.data === 'string') {
        // Xử lý chuỗi JSON
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

// Khi kết nối WebSocket bị đóng
socket.onclose = () => {
    console.log('WebSocket connection closed');
};

// Khi xảy ra lỗi WebSocket
socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

// Hàm xử lý dữ liệu nhận từ server
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
        case 'restartCountdown':
            startCountdown();
            break;
        default:
            updateSlot(data);
            break;
    }
}

// Hàm phát âm thanh
function playSound() {
    const lockSound = document.getElementById("lockSound");
    if (lockSound) lockSound.play();
}

// Hàm cập nhật tên tuyển thủ
function updatePlayerNames(names) {
    const pickSlots = document.querySelectorAll(".slot[id^='pick']");

    pickSlots.forEach((slot, index) => {
        const playerNameElement = slot.querySelector(".player-name");
        if (playerNameElement) {
            const isTeamB = slot.id.includes('B');
            const nameIndex = isTeamB ? 5 + index : index;
            playerNameElement.textContent = names[nameIndex] || "Trống";
        }
    });
}

// Hàm bắt đầu đếm ngược
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

// Hàm cập nhật dữ liệu cho slot
function updateSlot(data) {
    const slot = document.getElementById(data.slotId);
    if (!slot) return;

    const heroImageDiv = slot.querySelector('.heroImage');
    if (heroImageDiv) {
    heroImageDiv.style.position = 'absolute'
        heroImageDiv.style.backgroundImage = `url(../frontend/${data.image})`;
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
                slot.style.filter = 'grayscale(100%)';
            }
        }
        slot.classList.remove('active');
    } else if (data.type === 'select') {
        slot.classList.add('active');
    }
}

// Hàm cập nhật hình ảnh hero trong slot
function updateSwapImage(slotId, newImage) {
    const slot = document.getElementById(slotId);
    if (!slot) {
        console.error('Slot not found:', slotId);
        return;
    }

    const heroImageDiv = slot.querySelector('.heroImage');
    if (heroImageDiv) {
        heroImageDiv.style.backgroundImage = `url(../frontend/${newImage})`;
    }
}
