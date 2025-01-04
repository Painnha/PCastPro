let selectedHeroImage = ""; // Khởi tạo biến để lưu hình ảnh hero đã chọn

// Dữ liệu tướng nhúng trực tiếp
const heroes = [
  { name: "Airi", image: "heroes/Airi.jpg" },
  { name: "Aleister", image: "heroes/Aleister.jpg" },
  { name: "Alice", image: "heroes/Alice.jpg" },
  { name: "Allain", image: "heroes/Allain.jpg" },
  { name: "Amily", image: "heroes/Amily.jpg" },
  { name: "Annette", image: "heroes/Annette.jpg" },
  { name: "Aoi", image: "heroes/Aoi.jpg" },
  { name: "Arduin", image: "heroes/Arduin.jpg" },
  { name: "Arthur", image: "heroes/Arthur.jpg" },
  { name: "Arum", image: "heroes/Arum.jpg" },
  { name: "Astrid", image: "heroes/Astrid.jpg" },
  { name: "Ata", image: "heroes/Ata.jpg" },
  { name: "Aya", image: "heroes/Aya.jpg" },
  { name: "Azzen'ka", image: "heroes/Azzenka.jpg" },
  { name: "Baldum", image: "heroes/Baldum.jpg" },
  { name: "Bijan", image: "heroes/Bijan.jpg" },
  { name: "Bonnie", image: "heroes/Bonnie.jpg" },
  { name: "Biron", image: "heroes/Biron.jpg" },
  { name: "Both-baron", image: "heroes/BoltBaron.jpg" },
  { name: "Bright", image: "heroes/Bright.jpg" },
  { name: "Butterfly", image: "heroes/Butterfly.jpg" },
  { name: "Capheny", image: "heroes/Capheny.jpg" },
  { name: "Celica", image: "heroes/Celica.jpg" },
  { name: "Charlotte", image: "heroes/Charlotte.jpg" },
  { name: "Chaugnar", image: "heroes/Chaugnar.jpg" },
  { name: "Cresht", image: "heroes/Cresht.jpg" },
  { name: "D'arcy", image: "heroes/Darcy.jpg" },
  { name: "Dextra", image: "heroes/Dextra.jpg" },
  { name: "Dieu thuyen", image: "heroes/DieuThuyen.jpg" },
  { name: "Dirak", image: "heroes/Dirak.jpg" },
  { name: "Dolia", image: "heroes/Dolia.jpg" },
  { name: "Eland'orr", image: "heroes/Elandorr.jpg" },
  { name: "Elsu", image: "heroes/Elsu.jpg" },
  { name: "Enzo", image: "heroes/Enzo.jpg" },
  { name: "Errol", image: "heroes/Errol.jpg" },
  { name: "Fenik", image: "heroes/Fenik.jpg" },
  { name: "Flash", image: "heroes/Flash.jpg" },
  { name: "Florentino", image: "heroes/Florentino.jpg" },
  { name: "Gildur", image: "heroes/Gildur.jpg" },
  { name: "Grakk", image: "heroes/Grakk.jpg" },
  { name: "Hayate", image: "heroes/Hayate.jpg" },
  { name: "Helen", image: "heroes/Helen.jpg" },
  { name: "Iggy", image: "heroes/Iggy.jpg" },
  { name: "Ignis", image: "heroes/Ignis.jpg" },
  { name: "Illumia", image: "heroes/Illumia.jpg" },
  { name: "Ishar", image: "heroes/Ishar.jpg" },
  { name: "Jinna", image: "heroes/Jinna.jpg" },
  { name: "Kahlii", image: "heroes/Kahlii.jpg" },
  { name: "Kain", image: "heroes/Kain.jpg" },
  { name: "Keera", image: "heroes/Keera.jpg" },
  { name: "Kil'groth", image: "heroes/Kilgroth.jpg" },
  { name: "Kriknak", image: "heroes/Kriknak.jpg" },
  { name: "Kriktor", image: "heroes/Richter.jpg" },
  { name: "Krixi", image: "heroes/Krixi.jpg" },
  { name: "Krizzix", image: "heroes/Krizzix.jpg" },
  { name: "Lauriel", image: "heroes/Lauriel.jpg" },
  { name: "Laville", image: "heroes/Laville.jpg" },
  { name: "Liliana", image: "heroes/Liliana.jpg" },
  { name: "Lindis", image: "heroes/Lindis.jpg" },
  { name: "Lorion", image: "heroes/Lorion.jpg" },
  { name: "Lu Bo", image: "heroes/Lubo.jpg" },
  { name: "Lumburr", image: "heroes/Lumburr.jpg" },
  { name: "Maloch", image: "heroes/Maloch.jpg" },
  { name: "Marja", image: "heroes/Marja.jpg" },
  { name: "Max", image: "heroes/Max.jpg" },
  { name: "Mganga", image: "heroes/Mganga.jpg" },
  { name: "Mina", image: "heroes/Mina.jpg" },
  { name: "Ming", image: "heroes/Ming.jpg" },
  { name: "Moren", image: "heroes/Moren.jpg" },
  { name: "Murad", image: "heroes/Murad.jpg" },
  { name: "Nakroth", image: "heroes/Nakroth.jpg" },
  { name: "Natalya", image: "heroes/Natalya.jpg" },
  { name: "Ngo Khong", image: "heroes/NgoKhong.jpg" },
  { name: "Omega", image: "heroes/Omega.jpg" },
  { name: "Omen", image: "heroes/Omen.jpg" },
  { name: "Ormarr", image: "heroes/Ormarr.jpg" },
  { name: "Paine", image: "heroes/Paine.jpg" },
  { name: "Preyta", image: "heroes/Preyta.jpg" },
  { name: "Qi", image: "heroes/Qi.jpg" },
  { name: "Quillen", image: "heroes/Quillen.jpg" },
  { name: "Raz", image: "heroes/Raz.jpg" },
  { name: "Richter", image: "heroes/Richter.jpg" },
  { name: "Rouie", image: "heroes/Rouie.jpg" },
  { name: "Rourke", image: "heroes/Rourke.jpg" },
  { name: "Roxie", image: "heroes/Roxie.jpg" },
  { name: "Ryoma", image: "heroes/Ryoma.jpg" },
  { name: "Sephera", image: "heroes/Sephera.jpg" },
  { name: "Sinestrea", image: "heroes/Sinestrea.jpg" },
  { name: "Skud", image: "heroes/Skud.jpg" },
  { name: "Slimz", image: "heroes/Slimz.jpg" },
  { name: "Stuart", image: "heroes/Stuart.jpg" },
  { name: "Superman", image: "heroes/Superman.jpg" },
  { name: "Taara", image: "heroes/Taara.jpg" },
  { name: "Tachi", image: "heroes/Tachi.jpg" },
  { name: "Teemee", image: "heroes/Teemee.jpg" },
  { name: "Teeri", image: "heroes/Teeri.jpg" },
  { name: "Tel'annas", image: "heroes/Telannas.jpg" },
  { name: "Thane", image: "heroes/Thane.jpg" },
  { name: "Thorne", image: "heroes/Thorn.jpg" },
  { name: "Toro", image: "heroes/Toro.jpg" },
  { name: "Triệu Vân", image: "heroes/TrieuVan.jpg" },
  { name: "Tulen", image: "heroes/Tulen.jpg" },
  { name: "Valhein", image: "heroes/Valhein.jpg" },
  { name: "Veera", image: "heroes/Veera.jpg" },
  { name: "Veres", image: "heroes/Veres.jpg" },
  { name: "Violet", image: "heroes/Violet.jpg" },
  { name: "Volkath", image: "heroes/Volkath.jpg" },
  { name: "Wiro", image: "heroes/Wiro.jpg" },
  { name: "Wonder Woman", image: "heroes/Wonder.jpg" },
  { name: "Wisp", image: "heroes/Wisp.jpg" },
  { name: "Xeniel", image: "heroes/Xeniel.jpg" },
  { name: "Yan", image: "heroes/Yan.jpg" },
  { name: "Y'bneth", image: "heroes/Ybneth.jpg" },
  { name: "Yena", image: "heroes/Yena.jpg" },
  { name: "Yorn", image: "heroes/Yorn.jpg" },
  { name: "Yue", image: "heroes/Yue.jpg" },
  { name: "Zata", image: "heroes/Zata.jpg" },
  { name: "Zephys", image: "heroes/Zephys.jpg" },
  { name: "Zill", image: "heroes/Zill.jpg" },
  { name: "Zip", image: "heroes/Zip.jpg" },
  { name: "Zuka", image: "heroes/Zuka.jpg" },
];

const heroContainer = document.querySelector(".hero-grid");

// Hàm cập nhật giao diện với danh sách tướng
function updateHeroDisplay(filteredHeroes) {
  heroContainer.innerHTML = ""; // Xóa danh sách hiện tại
  filteredHeroes.forEach((hero) => {
    const heroDiv = document.createElement("div");
    heroDiv.className = "hero";
    heroDiv.style.backgroundImage = `url(${hero.image})`;
    heroDiv.onclick = () => {
      selectedHeroImage = hero.image; // Cập nhật hình ảnh hero đã chọn
      selectHero(hero.image); // Gọi hàm chọn hero
    };
    const heroNameDiv = document.createElement("div");
    heroNameDiv.textContent = hero.name; // Thêm tên tướng dưới ảnh
    heroNameDiv.className = "heroName";
    heroDiv.appendChild(heroNameDiv); // Đảm bảo tên tướng nằm dưới ảnh
    heroContainer.appendChild(heroDiv);
  });
}

// Hiển thị tất cả tướng khi trang được tải
updateHeroDisplay(heroes);

const searchInput = document.getElementById("searchInput");

// Hàm tìm kiếm tướng
searchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase(); // Lấy giá trị tìm kiếm và chuyển thành chữ thường
  const filteredHeroes = heroes.filter(hero => 
    hero.name.toLowerCase().includes(searchTerm) // Tìm kiếm tên tướng
  );

  // Cập nhật giao diện với danh sách tướng đã lọc
  updateHeroDisplay(filteredHeroes);
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
  startCountdown();
  document.getElementById("swapButton").disabled = true;
  this.disabled = true;
  // Gửi tín hiệu bắt đầu qua WebSocket
  const data = {
    countdown: "restartCountdown",
  };
  socket.send(JSON.stringify(data)); // Gửi thông điệp
};

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

    if (slotId === "pickB1" || slotId === "pickA2" || slotId === "pickA4") {
      const nextSlotId = order[currentIndex + 1];
      const nextSlot = document.getElementById(nextSlotId);
      if (nextSlot) {
        nextSlot.classList.add("active-ban");
        sendSlotUpdate(nextSlotId, nextSlot.style.backgroundImage, "banActive");
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
    const pickB5 = document.getElementById("pickB5");
    if (pickB5) {
        // Giả sử bạn đã thực hiện khóa tướng ở ô B5
        // Kích hoạt nút "Đổi Tướng"
        document.getElementById("swapButton").disabled = false;
    }
    startCountdown();
    // Phát âm thanh khi khóa tướng
    const lockSound = document.getElementById("lockSound");
    lockSound.play(); // Phát âm thanh

    // Gửi thông điệp qua WebSocket để phát âm thanh ở BanListA.html
    const data = {
      type: "playSound",
      sound: "effect.mp3", // Tên file âm thanh
    };
    socket.send(JSON.stringify(data)); // Gửi thông điệp

    selectedSlots.forEach((selectedSlot) => {
      if (selectedSlot) {
        selectedSlot.classList.add("locked");
        selectedSlot.classList.remove("active-ban");
        const heroImage = selectedSlot.dataset.heroImage;
        selectedSlot.style.backgroundImage = `url(${heroImage})`;

        // Ẩn logo và tên tuyển thủ
        const logo = selectedSlot.querySelector(".lane-logo");
        const playerName = selectedSlot.querySelector(".player-name");
        if (logo) logo.style.display = "none"; // Ẩn logo

        if (selectedSlot.id.startsWith("pick")) {
          selectedSlot.classList.add("zoom-effect");
          selectedSlot.style.filter = "none";
        } else {
          selectedSlot.style.filter = "grayscale(100%)";
        }

        // Send update to WebSocket
        sendSlotUpdate(selectedSlot.id, heroImage, "lock", "restartCountdown");
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

function sendSlotUpdate(slotId, image, type, countdown) {
  const data = {
    slotId: slotId,
    image: image,
    type: type,
    countdown: countdown,
  };
  socket.send(JSON.stringify(data));
}

// Thêm một nút để chỉnh sửa tên
const editNameButton = document.getElementById("editNameButton");
const nameInput = document.getElementById("nameInput"); // Giả sử bạn đã tạo một input với id là nameInput

editNameButton.onclick = function () {
  const names = nameInput.value.split(",").map((name) => name.trim()); // Tách tên và xóa khoảng trắng
  console.log("Names entered:", names); // Ghi lại tên đã nhập để kiểm tra
  const pickSlots = document.querySelectorAll(".slot[id^='pick']"); // Lấy tất cả các ô slot có id bắt đầu bằng "pick"

  pickSlots.forEach((slot, index) => {
    const playerNameElement = slot.querySelector(".player-name"); // Lấy phần tử player-name
    if (playerNameElement) {
      // Kiểm tra xem phần tử có tồn tại không
      if (index < names.length) {
        playerNameElement.textContent = names[index] || "Trống"; // Cập nhật tên hoặc ghi "Trống"
      } else {
        playerNameElement.textContent = "Trống"; // Nếu không đủ tên, ghi "Trống"
      }
    }
  });

  

  // Gửi tên qua WebSocket
  const dataToSend = {
    type: "updateNames",
    names: names,
  };
  socket.send(JSON.stringify(dataToSend)); // Gửi dữ liệu tên qua WebSocket
};
