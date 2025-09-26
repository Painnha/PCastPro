const socket = new WebSocket("ws://localhost:3000/ws");

socket.onopen = () => {
  // console.log('WebSocket connection established in banpickManager.js');
};

socket.onmessage = (event) => {
  // console.log('Message received from server:', event.data);
};

socket.onerror = (error) => {
  // console.error('WebSocket error:', error);
};

socket.onclose = () => {
  // console.log('WebSocket connection closed');
};

let selectedHeroImage = "";

const heroes = [
  { name: "Henio", image: "images/heroes/Henio.jpg" },
  { name: "Bỏ trống", image: "images/heroes/khongcam.png" },
  { name: "Airi", image: "images/heroes/Airi.jpg" },
  { name: "Aleister", image: "images/heroes/Aleister.jpg" },
  { name: "Alice", image: "images/heroes/Alice.jpg" },
  { name: "Allain", image: "images/heroes/Allain.jpg" },
  { name: "Amily", image: "images/heroes/Amily.jpg" },
  { name: "Annette", image: "images/heroes/Annette.jpg" },
  { name: "Aoi", image: "images/heroes/Aoi.jpg" },
  { name: "Arduin", image: "images/heroes/Arduin.jpg" },
  { name: "Arthur", image: "images/heroes/Arthur.jpg" },
  { name: "Arum", image: "images/heroes/Arum.jpg" },
  { name: "Astrid", image: "images/heroes/Astrid.jpg" },
  { name: "Ata", image: "images/heroes/Ata.jpg" },
  { name: "Aya", image: "images/heroes/Aya.jpg" },
  { name: "Azzen'ka", image: "images/heroes/Azzenka.jpg" },
  { name: "Baldum", image: "images/heroes/Baldum.jpg" },
  { name: "Billow", image: "images/heroes/Billow.jpg" },
  { name: "Bijan", image: "images/heroes/Bijan.jpg" },
  { name: "Bonnie", image: "images/heroes/Bonnie.jpg" },
  { name: "Both-baron", image: "images/heroes/BoltBaron.jpg" },
  { name: "Biron", image: "images/heroes/Biron.jpg" },
  { name: "Bright", image: "images/heroes/Bright.jpg" },
  { name: "Butterfly", image: "images/heroes/Butterfly.jpg" },
  { name: "Capheny", image: "images/heroes/Capheny.jpg" },
  { name: "Celica", image: "images/heroes/Celica.jpg" },
  { name: "Charlotte", image: "images/heroes/Charlotte.jpg" },
  { name: "Chaugnar", image: "images/heroes/Chaugnar.jpg" },
  { name: "Cresht", image: "images/heroes/Cresht.jpg" },
  { name: "D'arcy", image: "images/heroes/Darcy.jpg" },
  { name: "Dextra", image: "images/heroes/Dextra.jpg" },
  { name: "Dieu thuyen", image: "images/heroes/DieuThuyen.jpg" },
  { name: "Dirak", image: "images/heroes/Dirak.jpg" },
  { name: "Dolia", image: "images/heroes/Dolia.jpg" },
  { name: "Erin", image: "images/heroes/Erin.jpg" },
  { name: "Eland'orr", image: "images/heroes/Elandorr.jpg" },
  { name: "Elsu", image: "images/heroes/Elsu.jpg" },
  { name: "Enzo", image: "images/heroes/Enzo.jpg" },
  { name: "Errol", image: "images/heroes/Errol.jpg" },
  { name: "Fenik", image: "images/heroes/Fenik.jpg" },
  { name: "Flash", image: "images/heroes/Flash.jpg" },
  { name: "Florentino", image: "images/heroes/Florentino.jpg" },
  { name: "Gildur", image: "images/heroes/Gildur.jpg" },
  { name: "Grakk", image: "images/heroes/Grakk.jpg" },
  { name: "Hayate", image: "images/heroes/Hayate.jpg" },
  { name: "Helen", image: "images/heroes/Helen.jpg" },
  { name: "Iggy", image: "images/heroes/Iggy.jpg" },
  { name: "Ignis", image: "images/heroes/Ignis.jpg" },
  { name: "Illumia", image: "images/heroes/Illumia.jpg" },
  { name: "Ishar", image: "images/heroes/Ishar.jpg" },
  { name: "Jinna", image: "images/heroes/Jinna.jpg" },
  { name: "Kahlii", image: "images/heroes/Kahlii.jpg" },
  { name: "Kain", image: "images/heroes/Kain.jpg" },
  { name: "Keera", image: "images/heroes/Keera.jpg" },
  { name: "Kil'groth", image: "images/heroes/Kilgroth.jpg" },
  { name: "Kriknak", image: "images/heroes/Kriknak.jpg" },
  { name: "Kriktor", image: "images/heroes/Richter.jpg" },
  { name: "Krixi", image: "images/heroes/Krixi.jpg" },
  { name: "Krizzix", image: "images/heroes/Krizzix.jpg" },
  { name: "Lauriel", image: "images/heroes/Lauriel.jpg" },
  { name: "Laville", image: "images/heroes/Laville.jpg" },
  { name: "Liliana", image: "images/heroes/Liliana.jpg" },
  { name: "Lindis", image: "images/heroes/Lindis.jpg" },
  { name: "Lorion", image: "images/heroes/Lorion.jpg" },
  { name: "Lu Bo", image: "images/heroes/Lubo.jpg" },
  { name: "Lumburr", image: "images/heroes/Lumburr.jpg" },
  { name: "Maloch", image: "images/heroes/Maloch.jpg" },
  { name: "Marja", image: "images/heroes/Marja.jpg" },
  { name: "Max", image: "images/heroes/Max.jpg" },
  { name: "Mganga", image: "images/heroes/Mganga.jpg" },
  { name: "Mina", image: "images/heroes/Mina.jpg" },
  { name: "Ming", image: "images/heroes/Ming.jpg" },
  { name: "Moren", image: "images/heroes/Moren.jpg" },
  { name: "Murad", image: "images/heroes/Murad.jpg" },
  { name: "Nakroth", image: "images/heroes/Nakroth.jpg" },
  { name: "Natalya", image: "images/heroes/Natalya.jpg" },
  { name: "Ngo Khong", image: "images/heroes/NgoKhong.jpg" },
  { name: "Omega", image: "images/heroes/Omega.jpg" },
  { name: "Omen", image: "images/heroes/Omen.jpg" },
  { name: "Ormarr", image: "images/heroes/Ormarr.jpg" },
  { name: "Paine", image: "images/heroes/Paine.jpg" },
  { name: "Preyta", image: "images/heroes/Preyta.jpg" },
  { name: "Qi", image: "images/heroes/Qi.jpg" },
  { name: "Quillen", image: "images/heroes/Quillen.jpg" },
  { name: "Raz", image: "images/heroes/Raz.jpg" },
  { name: "Richter", image: "images/heroes/Richter.jpg" },
  { name: "Rouie", image: "images/heroes/Rouie.jpg" },
  { name: "Rourke", image: "images/heroes/Rourke.jpg" },
  { name: "Roxie", image: "images/heroes/Roxie.jpg" },
  { name: "Ryoma", image: "images/heroes/Ryoma.jpg" },
  { name: "Sephera", image: "images/heroes/Sephera.jpg" },
  { name: "Sinestrea", image: "images/heroes/Sinestrea.jpg" },
  { name: "Skud", image: "images/heroes/Skud.jpg" },
  { name: "Slimz", image: "images/heroes/Slimz.jpg" },
  { name: "Stuart", image: "images/heroes/Stuart.jpg" },
  { name: "Superman", image: "images/heroes/Superman.jpg" },
  { name: "Taara", image: "images/heroes/Taara.jpg" },
  { name: "Tachi", image: "images/heroes/Tachi.jpg" },
  { name: "Teemee", image: "images/heroes/Teemee.jpg" },
  { name: "Teeri", image: "images/heroes/Teeri.jpg" },
  { name: "Tel'annas", image: "images/heroes/Telannas.jpg" },
  { name: "Thane", image: "images/heroes/Thane.jpg" },
  { name: "Thorne", image: "images/heroes/Thorn.jpg" },
  { name: "Toro", image: "images/heroes/Toro.jpg" },
  { name: "Triệu Vân", image: "images/heroes/TrieuVan.jpg" },
  { name: "Tulen", image: "images/heroes/Tulen.jpg" },
  { name: "Valhein", image: "images/heroes/Valhein.jpg" },
  { name: "Veera", image: "images/heroes/Veera.jpg" },
  { name: "Veres", image: "images/heroes/Veres.jpg" },
  { name: "Violet", image: "images/heroes/Violet.jpg" },
  { name: "Volkath", image: "images/heroes/Volkath.jpg" },
  { name: "Wiro", image: "images/heroes/Wiro.jpg" },
  { name: "Wonder Woman", image: "images/heroes/Wonder.jpg" },
  { name: "Wisp", image: "images/heroes/Wisp.jpg" },
  { name: "Xeniel", image: "images/heroes/Xeniel.jpg" },
  { name: "Yan", image: "images/heroes/Yan.jpg" },
  { name: "Y'bneth", image: "images/heroes/Ybneth.jpg" },
  { name: "Yena", image: "images/heroes/Yena.jpg" },
  { name: "Yorn", image: "images/heroes/Yorn.jpg" },
  { name: "Yue", image: "images/heroes/Yue.jpg" },
  { name: "Zata", image: "images/heroes/Zata.jpg" },
  { name: "Zephys", image: "images/heroes/Zephys.jpg" },
  { name: "Zill", image: "images/heroes/Zill.jpg" },
  { name: "Zip", image: "images/heroes/Zip.jpg" },
  { name: "Zuka", image: "images/heroes/Zuka.jpg" },
];

const heroContainer = document.querySelector(".hero-grid");


function updateHeroDisplay(filteredHeroes) {
  heroContainer.innerHTML = ""; 
  filteredHeroes.forEach((hero) => {
    const heroDiv = document.createElement("div");
    heroDiv.className = "hero";
    heroDiv.style.backgroundImage = `url(${hero.image})`;
    heroDiv.onclick = () => {
      selectedHeroImage = hero.image; 
      selectHero(hero.image); 
    };
    const heroNameDiv = document.createElement("div");
    heroNameDiv.textContent = hero.name;
    heroNameDiv.className = "heroName";
    heroDiv.appendChild(heroNameDiv);
    heroContainer.appendChild(heroDiv);
  });
}


updateHeroDisplay(heroes);

const searchInput = document.getElementById("searchInput");


searchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase(); 
  const filteredHeroes = heroes.filter(
    (hero) => hero.name.toLowerCase().includes(searchTerm) 
  );


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
  currentIndex = 0; 
  highlightNextSlot(); 
  startCountdown();

  this.disabled = true;

  const data = {
    countdown: "restartCountdown",
  };
  socket.send(JSON.stringify(data));
};


let countdown; 
let timeLeft = 60; 
const countdownDisplay = document.getElementById("countdown");

function startCountdown() {
  clearInterval(countdown); 
  timeLeft = 60;
  countdownDisplay.textContent = timeLeft; 

  countdown = setInterval(() => {
    timeLeft--; 
    countdownDisplay.textContent = timeLeft; 
    if (timeLeft <= 0) {
      clearInterval(countdown); 
    }
  }, 1000); 
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

  const selectedSlot = document.querySelector(".slot.selected");
  if (selectedSlot && !selectedSlot.classList.contains("locked")) {

    selectedSlot.style.backgroundImage = `url(${image})`;
    selectedSlot.dataset.heroImage = image; 
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
    document.getElementById("error-message").innerText =
      "Vui lòng pick tướng vào tất cả các ô trước khi khóa!";
    return;
  }

  if (selectedSlots.length > 0) {
    document.getElementById("error-message").innerText = "";

    startCountdown();

    const lockSound = document.getElementById("lockSound");
    lockSound.play(); 

    
    const data = {
      type: "playSound",
      sound: "PickEffect.mp3", 
      
    };
    socket.send(JSON.stringify(data)); 

    selectedSlots.forEach((selectedSlot) => {
      if (selectedSlot) {
        selectedSlot.classList.add("locked");
        selectedSlot.classList.remove("active-ban");
        const heroImage = selectedSlot.dataset.heroImage;
        selectedSlot.style.backgroundImage = `url(${heroImage})`;


        const logo = selectedSlot.querySelector(".lane-logo");
        const playerName = selectedSlot.querySelector(".player-name");
        if (logo) logo.style.display = "none"; 

        if (selectedSlot.id.startsWith("pick")) {
          selectedSlot.classList.add("zoom-effect");
          selectedSlot.style.filter = "none";
        } else {
          selectedSlot.style.filter = "grayscale(100%)";
        }

        sendSlotUpdate(selectedSlot.id, heroImage, "lock", "restartCountdown");
      }
    });
    currentIndex += selectedSlots.length;
    highlightNextSlot();
  }
}


document.getElementById("lockButton").onclick = lockSlot;


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

function sendSlotUpdate(slotId, image, type, countdown) {
  const data = {
    slotId: slotId,
    image: image,
    type: type,
    countdown: countdown,
  };
  socket.send(JSON.stringify(data));
}


const editNameButton = document.getElementById("editNameButton");
const nameInput = document.getElementById("nameInput"); 

editNameButton.onclick = function () {
  const names = nameInput.value.split(",").map((name) => name.trim()); 
  console.log("Names entered:", names); 
  const pickSlots = document.querySelectorAll(".slot[id^='pick']"); 

  pickSlots.forEach((slot, index) => {
    const playerNameElement = slot.querySelector(".player-name"); 
    if (playerNameElement) {
  
      if (index < names.length) {
        playerNameElement.textContent = names[index] || "Trống"; 
      } else {
        playerNameElement.textContent = "Trống";
      }
    }
  });
  const data = {
    type: "updateNames",
    names: names,
  };
  socket.send(JSON.stringify(data));
};

let firstSelectedSlot = null;
let secondSelectedSlot = null;

function enableSwapFunctionality() {
  const slots = document.querySelectorAll(".slot");
  slots.forEach((slot) => {
    slot.addEventListener("click", handleSlotSelection);
  });
}

function handleSlotSelection(event) {
  const selectedSlot = event.target;

  if (!firstSelectedSlot) {
    firstSelectedSlot = selectedSlot;
    selectedSlot.classList.add("selectedswap");
  } else if (selectedSlot === firstSelectedSlot) {
    firstSelectedSlot.classList.remove("selectedswap");
    firstSelectedSlot = null;
  } else if (!secondSelectedSlot) {
    secondSelectedSlot = selectedSlot;
    swapHeroes();
  }
}

function swapHeroes() {
  if (firstSelectedSlot && secondSelectedSlot) {
    const tempImage = firstSelectedSlot.style.backgroundImage;
    firstSelectedSlot.style.backgroundImage =
      secondSelectedSlot.style.backgroundImage;
    secondSelectedSlot.style.backgroundImage = tempImage;


    const firstImageUrl = extractImageUrl(
      firstSelectedSlot.style.backgroundImage
    );
    const secondImageUrl = extractImageUrl(
      secondSelectedSlot.style.backgroundImage
    );

    sendSwapUpdate(
      firstSelectedSlot.id,
      firstImageUrl,
      secondSelectedSlot.id,
      secondImageUrl
    );


    firstSelectedSlot.classList.remove("selectedswap");
    firstSelectedSlot = null;
    secondSelectedSlot = null;
  }
}

function sendSwapUpdate(firstSlotId, firstImage, secondSlotId, secondImage) {
  const swapData = {
    type: "swapHeroes",
    swaps: [
      { slotId: firstSlotId, image: firstImage },
      { slotId: secondSlotId, image: secondImage },
    ],
  };
  socket.send(JSON.stringify(swapData));
}


document.getElementById("lockButton").addEventListener("click", function () {
  const pickB5 = document.getElementById("pickB5");
  if (pickB5.classList.contains("locked")) {
    enableSwapFunctionality();
  }
});

function extractImageUrl(urlStyle) {

  return urlStyle.replace(/url\(["']?(.*?)["']?\)/, "$1");
}
