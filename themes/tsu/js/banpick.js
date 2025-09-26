


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
                slot.style.filter = 'grayscale(100%)';
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

    const heroImageDiv = slot.querySelector('.heroImage');
    if (heroImageDiv) {
        heroImageDiv.style.backgroundImage = `url(/${newImage})`;
    }
}
