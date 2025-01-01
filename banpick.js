// Kết nối WebSocket
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
    console.log('WebSocket connection established');
};

socket.onmessage = (event) => {
    console.log('Received message:', event.data);
    
    if (event.data instanceof Blob) {
        event.data.text().then((text) => {
            const data = JSON.parse(text);
            handleData(data);
        }).catch((err) => console.error('Error parsing Blob:', err));
    } else {
        const data = JSON.parse(event.data);
        handleData(data);
    }
};

function handleData(data) {
    if (data.type === 'playSound') {
        const lockSound = document.getElementById("lockSound");
        lockSound.play(); // Phát âm thanh
    } else {
        updateSlot(data); // Cập nhật slot
    }
}

function updateSlot(data) {
    const slot = document.getElementById(data.slotId);
    if (!slot) return;

    slot.style.backgroundImage = `url(${data.image})`;
    

    if (data.type === 'banActive') {
        slot.classList.add('ban-active');
    } else if (data.type === 'lock') {
        slot.classList.add('locked');
        slot.classList.remove('ban-active');
        if (slot.classList.contains('pick')) {
            slot.style.filter = 'none';
        }
        // Không ẩn hình ảnh đè lên khi khóa
        const overlay = slot.querySelector('.active-overlay');
        if (overlay) overlay.style.display = 'block'; // Giữ hình ảnh đè lên hiển thị
    } else if (data.type === 'select') {
        slot.classList.remove('locked');
        if (!slot.classList.contains('ban-active')) {
            slot.classList.add('ban-active');
        }

        // Hiển thị hình ảnh đè lên khi chọn
        const overlay = slot.querySelector('.active-overlay');
        if (overlay) {
            overlay.style.display = 'block'; // Hiện hình ảnh đè lên
        }

        // Ẩn logo và tên tuyển thủ ngay lập tức khi chọn
        const logo = slot.querySelector('.lane-logo');
        const playerName = slot.querySelector('.player-name');
        const effectImage = slot.querySelector('.effect-image');

        if (logo) logo.style.display = 'none'; // Ẩn logo
        // if (playerName) playerName.style.display = 'none'; // Ẩn tên tuyển thủ

        // Hiển thị hình ảnh hiệu ứng
        if (effectImage) {
            effectImage.style.display = 'block'; // Hiện hình ảnh hiệu ứng
            effectImage.style.opacity = '1'; // Đặt độ mờ thành 1
        }
    }
}
