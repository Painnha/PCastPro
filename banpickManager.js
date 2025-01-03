let selectedHeroImage = ""; // Khởi tạo biến để lưu hình ảnh hero đã chọn

const heroes = [
  { name: "Yorn", image: "heroes/Zip.jpg" },
  { name: "Violet", image: "heroes/Aoi.jpg" },
  { name: "Tulen", image: "heroes/Airi.jpg" },
  { name: "Zephys", image: "heroes/Amily.jpg" },
];

const heroContainer = document.querySelector(".heroes");
heroes.forEach((hero) => {
  const heroDiv = document.createElement("div");
  heroDiv.className = "hero";
  heroDiv.style.backgroundImage = `url(${hero.image})`;
  heroDiv.onclick = () => {
    selectedHeroImage = hero.image; // Cập nhật hình ảnh hero đã chọn
    selectHero(hero.image); // Gọi hàm chọn hero
  };
  heroContainer.appendChild(heroDiv);
});

const order = [
  "banA1",
  "banB1",
  "banA2",
  "banB2",
  "pickA1",
  "pickB1",
  "pickB2",
  "pickA2",
  "pickA3",
  "pickB3",
  "banB3",
  "banA3",
  "banB4",
  "banA4",
  "pickB4",
  "pickA4",
  "pickA5",
  "pickB5",
];

let currentIndex = 0;

document.getElementById("startButton").onclick = function () {
  currentIndex = 0; // Reset chỉ số
  highlightNextSlot(); // Bắt đầu nhấp nháy ô đầu tiên
};

function highlightNextSlot() {
  if (currentIndex < order.length) {
    const slotId = order[currentIndex];
    const slot = document.getElementById(slotId);
    slot.classList.add("active-ban");

    const selectedSlot = document.querySelector(".slot.selected");
    if (selectedSlot) {
      selectedSlot.classList.remove("selected");
    }
    slot.classList.add("selected");

    // Send highlight update to WebSocket
    sendSlotUpdate(slotId, slot.style.backgroundImage, "banActive");

    if (
      slotId === "pickB1" ||
      slotId === "pickA2" ||
      slotId === "pickA4"
    ) {
      const nextSlotId = order[currentIndex + 1];
      const nextSlot = document.getElementById(nextSlotId);
      if (nextSlot) {
        nextSlot.classList.add("active-ban");
        sendSlotUpdate(
          nextSlotId,
          nextSlot.style.backgroundImage,
          "banActive"
        );
      }
    }
  }
}

function selectHero(image) {
  // Lấy ô đang được chọn
  const selectedSlot = document.querySelector(".slot.selected");
  if (selectedSlot && !selectedSlot.classList.contains("locked")) {
    // Đặt hình tướng vào ô được chọn
    selectedSlot.style.backgroundImage = `url(${image})`;
    selectedSlot.dataset.heroImage = image; // Lưu hình ảnh hero vào thuộc tính dữ liệu

    // Gửi cập nhật ngay khi chọn hình ảnh
    sendSlotUpdate(selectedSlot.id, image, "select");
  }
}

function lockSlot() {
  const selectedSlots = document.querySelectorAll(".slot.active-ban");
  let allFilled = true;

  selectedSlots.forEach((selectedSlot) => {
    if (!selectedSlot.dataset.heroImage) {
      allFilled = false;
    }
  });

  if (!allFilled) {
    alert("Vui lòng điền tướng vào tất cả các ô trước khi khóa!");
    return;
  }

  if (selectedSlots.length > 0) {
    // Phát âm thanh khi khóa tướng
    const lockSound = document.getElementById("lockSound");
    lockSound.play(); // Phát âm thanh

    // Gửi thông điệp qua WebSocket để phát âm thanh ở BanListA.html
    const data = {
      type: 'playSound',
      sound: 'effect.mp3' // Tên file âm thanh
    };
    socket.send(JSON.stringify(data)); // Gửi thông điệp

    selectedSlots.forEach((selectedSlot) => {
      if (selectedSlot) {
        selectedSlot.classList.add("locked");
        selectedSlot.classList.remove("active-ban");
        const heroImage = selectedSlot.dataset.heroImage;
        selectedSlot.style.backgroundImage = `url(${heroImage})`;

        // Ẩn logo và tên tuyển thủ
        const logo = selectedSlot.querySelector('.lane-logo');
        const playerName = selectedSlot.querySelector('.player-name');
        if (logo) logo.style.display = 'none'; // Ẩn logo
       

        if (selectedSlot.id.startsWith("pick")) {
          selectedSlot.classList.add("zoom-effect");
          selectedSlot.style.filter = "none";
        } else {
          selectedSlot.style.filter = "grayscale(100%)";
        }

        // Send update to WebSocket
        sendSlotUpdate(selectedSlot.id, heroImage, "lock");
      }
    });
    currentIndex += selectedSlots.length;
    highlightNextSlot();
  }
}

// Gán sự kiện cho nút Khóa Tướng
document.getElementById("lockButton").onclick = lockSlot;

// Cho phép người dùng chọn ô "tới lượt" khác
document.querySelectorAll(".slot").forEach((slot) => {
  slot.addEventListener("click", function () {
    if (
      this.classList.contains("active-ban") &&
      !this.classList.contains("locked")
    ) {
      document
        .querySelectorAll(".slot.selected")
        .forEach((s) => s.classList.remove("selected"));
      this.classList.add("selected");
    }
  });
});

// CSS cho ô được chọn và hiệu ứng zoom
const style = document.createElement("style");
style.innerHTML = `
.slot.selected {
  background-color: rgba(255, 255, 0, 0.5); /* Màu nền khác biệt cho ô được chọn */
}
.slot.zoom-effect {
  animation: zoomInOut 0.7s ease-in-out; /* Tăng thời gian và độ lớn của hiệu ứng zoom */
}
@keyframes zoomInOut {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); } /* Tăng độ lớn của hiệu ứng zoom */
}
`;
document.head.appendChild(style);

// WebSocket connection
const socket = new WebSocket("ws://localhost:8080");

function sendSlotUpdate(slotId, image, type) {
  const data = {
    slotId: slotId,
    image: image,
    type: type,
  };
  socket.send(JSON.stringify(data));
}