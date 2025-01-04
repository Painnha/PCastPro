// Kết nối WebSocket
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
    console.log('WebSocket connection established');
};

socket.onmessage = (event) => {
    console.log('Received message:', event.data);
    
    if (event.data instanceof Blob) {
        event.data.text().then((text) => {
            console.log('Parsed Blob data:', text);
            const data = JSON.parse(text);
            handleData(data);
        }).catch((err) => console.error('Error parsing Blob:', err));
    } else {
        console.log('Received JSON data:', event.data);
        const data = JSON.parse(event.data);
        handleData(data);
    }
};

socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

socket.onclose = () => {
    console.log('WebSocket connection closed');
};

function handleData(data) {
    console.log('Handling data:', data);
    if (data.type === 'playSound') {
        const lockSound = document.getElementById("lockSound");
        lockSound.play(); // Phát âm thanh
    } else if (data.type === 'updateNames') {
        updatePlayerNames(data.names); // Cập nhật tên tuyển thủ
    } else if (data.type === 'swapHeroes') {
        console.log('Processing swapHeroes data:', data);
        data.swaps.forEach(swap => {
            console.log('Updating slot:', swap.slotId, 'with image:', swap.image);
            updateSwapImage(swap.slotId, swap.image);
        });
    } else {updateSlot(data);}
    


     if (data.countdown === 'restartCountdown') {
        startCountdown(); // Bắt đầu đếm ngược
    }
}
// Hàm cập nhật tên tuyển thủ
function updatePlayerNames(names) {
    console.log(names);

    // Lấy tất cả các ô slot có id bắt đầu bằng "pick"
    const pickSlots = document.querySelectorAll(".slot[id^='pick']");
    console.log("Total slots to update:", pickSlots.length);

    pickSlots.forEach((slot, index) => {
        const playerNameElement = slot.querySelector(".player-name"); // Lấy phần tử player-name
        if (playerNameElement) {
            // Xác định nhóm dựa trên ID của slot
            const isTeamB = slot.id.includes('B');
            const nameIndex = isTeamB ? 5 + index : index; // Nhóm B bắt đầu từ index 5 trong mảng names
            // Gán giá trị tên vào phần tử player-name
            playerNameElement.textContent = names[nameIndex] || "Trống"; // Cập nhật tên hoặc ghi "Trống"
        }
    });
}
// Đếm ngược
let countdown; // Biến để lưu ID của bộ đếm thời gian
let timeLeft = 60; // Thời gian bắt đầu là 60 giây
const countdownDisplay = document.getElementById("countdown");

function startCountdown() {
  clearInterval(countdown); // Dừng bất kỳ bộ đếm nào đang chạy
  timeLeft = 60;
  countdownDisplay.textContent = timeLeft; // Hiển thị thời gian ban đầu

  countdown = setInterval(() => {
    timeLeft--; // Giảm thời gian
    countdownDisplay.textContent = timeLeft; // Cập nhật hiển thị

    if (timeLeft <= 0) {
      clearInterval(countdown); // Dừng đếm ngược khi đến 0
     
    }
  }, 1000); // Cập nhật mỗi giây
}

function updateSlot(data) {
    const slot = document.getElementById(data.slotId);
    if (!slot) return;

    // Cập nhật hình ảnh vào div heroImage
    const heroImageDiv = slot.querySelector('.heroImage');
    if (heroImageDiv) {
        heroImageDiv.style.position = 'absolute'
        heroImageDiv.style.backgroundImage = `url(../frontend/${data.image})`;
        heroImageDiv.style.backgroundSize = 'cover'; // Đảm bảo hình ảnh được bao phủ
        heroImageDiv.style.backgroundPosition = 'center'; // Căn giữa hình ảnh
        heroImageDiv.style.width = '100%'; // Đặt chiều rộng
        heroImageDiv.style.height = '100%'; // Đặt chiều cao
    }

    if (data.type === 'banActive') {
        slot.classList.add('active');
    } else if (data.type === 'lock') {
        slot.classList.add('locked');
        if (heroImageDiv) {
            heroImageDiv.classList.add('locked'); // Thêm lớp locked vào heroImage
            heroImageDiv.style.animation = 'zoomInOut 1s forwards'; // Áp dụng hiệu ứng zoom
            if (slot.classList.contains('pick')) {
                slot.style.filter = 'none';
            }
            if (slot.classList.contains('ban')) {
                slot.style.filter = 'grayscale(100%)';
            }
        }
        slot.classList.remove('active');
    
        // Không ẩn hình ảnh đè lên khi khóa
        const overlay = slot.querySelector('.active-overlay');
        if (overlay) overlay.style.display = 'block'; // Giữ hình ảnh đè lên hiển thị
    } else if (data.type === 'select') {
        slot.classList.remove('locked');
        if (heroImageDiv) {
            heroImageDiv.classList.remove('locked'); // Xóa lớp locked khỏi heroImage
            heroImageDiv.style.animation = ''; // Xóa hiệu ứng zoom
        }
        if (!slot.classList.contains('active')) {
            slot.classList.add('active');
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
function updateSwapImage(slotId, newImage) {
    console.log("Trying to find slot with ID:", slotId);
    const slot = document.getElementById(slotId);
    if (!slot) {
        console.error("Slot not found:", slotId);
        return;
    }

    console.log("Found slot, updating image...");
    const heroImageDiv = slot.querySelector('.heroImage');
    if (heroImageDiv) {
        heroImageDiv.style.backgroundImage = `url(../frontend/${newImage})`;
    } else {
        console.error("Hero image div not found in slot:", slotId);
    }
}


