// --- CONFIGURATION ---
// You can easily change these values to customize the website for your partner!
const CONFIG = {
    partnerName: "ที่รัก",         // Your partner's name or nickname
    startDate: "2024-01-01",      // The date you started dating (YYYY-MM-DD)
    musicUrl: "https://www.youtube.com/watch?v=t1dvrcqlQgI&list=RDt1dvrcqlQgI&start_radio=1", // Background music URL
    lineMessageTemplate: "เค้าหายงอนตัวเองแล้วนะค้าบ รักที่สุดเลยยยย ❤️🥰", // Template message to send on Line
    
    // GIFs from GitHub assets (high-speed, raw-accessible)
    gifSorry: "https://raw.githubusercontent.com/Einzigartige/loveme-app/main/assets/cry.gif",      // Cute crying/apologizing GIF
    gifHappy: "https://raw.githubusercontent.com/Einzigartige/loveme-app/main/assets/loveme.gif"        // Cute happy/hugging GIF
};

// --- DOM ELEMENTS ---
const bgMusic = document.getElementById('bg-music');
const musicPlayer = document.getElementById('music-player');
const musicDisc = document.getElementById('music-disc');
const welcomeScreen = document.getElementById('welcome-screen');
const apologyScreen = document.getElementById('apology-screen');
const successScreen = document.getElementById('success-screen');
const btnStart = document.getElementById('btn-start');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnNoParent = btnNo.parentElement;
const btnSendLine = document.getElementById('btn-send-line');
const btnWriteHeart = document.getElementById('btn-write-heart');
const customMessageModal = document.getElementById('custom-message-modal');
const modalClose = document.getElementById('modal-close');
const btnModalSubmit = document.getElementById('btn-modal-submit');
const customMsgInput = document.getElementById('custom-msg-input');

// Dynamic Text Elements
const apologyTitle = document.getElementById('apology-title');
const apologyMsg = document.getElementById('apology-msg');
const successTitle = document.getElementById('success-title');
const successMsg = document.getElementById('success-msg');
const partnerNameSpan = document.getElementById('partner-name');

// GIFs
const sorryGif = document.getElementById('sorry-gif');
const happyGif = document.getElementById('happy-gif');

// State Machine config according to user flowchart
let currentState = 1;
let hoverCount = 0;
const MAX_HOVERS = 3; // Moves 3 times per state, then allows clicking to next state
let canRunaway = false;
let returnTimeout = null;

const STATES = {
    1: {
        title: "เบบี้...เค้าขอโทษ ดีกันได้มั้ย 🥺",
        msg: "เค้าผิดไปแล้ว เค้าจะไม่กลับดึก\nไม่ปล่อยให้แบตหมดอีกแล้ว",
        gif: "https://raw.githubusercontent.com/Einzigartige/loveme-app/main/assets/cry.gif",
        btnYes: "ยกโทษ",
        btnNo: "ไม่ยกโทษ",
        nextStateOnNo: 2
    },
    2: {
        title: "ใจอ่อนหน่อยน้าา... 🥺",
        msg: "เค้าสัญญาว่าจะปรับตัวเอง\nดีกันนนน",
        gif: "https://raw.githubusercontent.com/Einzigartige/loveme-app/main/assets/plz.gif",
        btnYes: "ใจอ่อน",
        btnNo: "ไม่ยกโทษ",
        nextStateOnNo: 3
    },
    3: {
        title: "ใจอ่อนสักทีม้ายย... 🥺",
        msg: "ใจอ่อนสักใช้ม้าย เค้าน่ารักใช้ป่าว ฮิฮิ\nให้อภัยเค้าแล้วใช่ม้าย",
        gif: "https://raw.githubusercontent.com/Einzigartige/loveme-app/main/assets/sadface.gif",
        btnYes: "ใช่",
        btnNo: "ยังโกรธ",
        nextStateOnNo: 2 // Loops back to State 2
    }
};

// --- YOUTUBE PLAYER API INTEGRATION ---
let isYouTube = false;
let ytPlayer = null;
let ytReady = false;

function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

const ytId = getYouTubeId(CONFIG.musicUrl);
if (ytId) {
    isYouTube = true;
    // Load YouTube Player API Code Asynchronously
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Global callback for YouTube API
window.onYouTubeIframeAPIReady = function() {
    const ytId = getYouTubeId(CONFIG.musicUrl);
    ytPlayer = new YT.Player('youtube-player', {
        height: '200',
        width: '200',
        videoId: ytId,
        playerVars: {
            'autoplay': 0,
            'loop': 1,
            'playlist': ytId, // required for single video looping
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'rel': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': () => {
                ytReady = true;
                ytPlayer.setVolume(80);
            },
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerStateChange(event) {
    // 1 is PLAYING, 2 is PAUSED
    if (event.data === 1) {
        musicDisc.classList.add('spinning');
    } else {
        musicDisc.classList.remove('spinning');
    }
}

// --- INITIALIZATION ---
function init() {
    // Inject Config Values if not YouTube
    if (!isYouTube) {
        bgMusic.src = CONFIG.musicUrl;
        bgMusic.load();
    }
    
    // Create floating hearts background
    createFloatingHearts();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// --- MUSIC PLAYER CONTROLS ---
function playMusic() {
    if (isYouTube) {
        if (ytReady && ytPlayer) {
            ytPlayer.playVideo();
        } else {
            setTimeout(playMusic, 100);
        }
    } else {
        bgMusic.play().then(() => {
            musicDisc.classList.add('spinning');
        }).catch(err => {
            console.log("Autoplay blocked. Waiting for user interaction.", err);
        });
    }
}

function toggleMusic() {
    if (isYouTube) {
        if (ytReady && ytPlayer) {
            const state = ytPlayer.getPlayerState();
            if (state === 1) { // playing
                ytPlayer.pauseVideo();
                musicDisc.classList.remove('spinning');
            } else {
                ytPlayer.playVideo();
                musicDisc.classList.add('spinning');
            }
        }
    } else {
        if (bgMusic.paused) {
            bgMusic.play();
            musicDisc.classList.add('spinning');
        } else {
            bgMusic.pause();
            musicDisc.classList.remove('spinning');
        }
    }
}
// --- STATE MACHINE CONTROLLERS ---
function changeState(stateNum) {
    currentState = stateNum;
    hoverCount = 0; // Reset chase count for new state
    canRunaway = false; // Temporarily disable runaway trigger
    
    // Return button to normal position
    resetNoButton();
    
    // Reset Yes button scale
    btnYes.style.transform = 'scale(1)';
    
    // Render current state config
    const config = STATES[stateNum];
    if (config) {
        apologyTitle.textContent = config.title;
        apologyMsg.textContent = config.msg;
        sorryGif.src = config.gif;
        btnYes.textContent = config.btnYes;
        btnNo.textContent = config.btnNo;
    }
    
    // Enable runaway after 500ms transition cooldown
    setTimeout(() => {
        canRunaway = true;
    }, 500);
}

// Welcome Screen -> State 1 Apology Screen
btnStart.addEventListener('click', () => {
    playMusic();
    
    welcomeScreen.classList.add('hidden');
    welcomeScreen.classList.remove('active');
    
    // Initialize to State 1
    changeState(1);
    
    apologyScreen.classList.remove('hidden');
    apologyScreen.offsetHeight;
    apologyScreen.classList.add('active');
});

// Any State Yes Click -> Success Screen (Forgiven!)
btnYes.addEventListener('click', () => {
    apologyScreen.classList.add('hidden');
    apologyScreen.classList.remove('active');
    
    // Return button to normal position
    resetNoButton();
    
    successScreen.classList.remove('hidden');
    successScreen.offsetHeight;
    successScreen.classList.add('active');
    
    playCelebrationConfetti();
    startRelationshipTimer();
});

// --- RUNAWAY BUTTON LOGIC ---
function moveNoButton() {
    if (!canRunaway) return;
    
    if (hoverCount < MAX_HOVERS) {
        hoverCount++;
        
        // Clear any return timer
        if (returnTimeout) {
            clearTimeout(returnTimeout);
            returnTimeout = null;
        }
        
        // If reached max hovers, instead of moving away, return to card next to Yes button!
        if (hoverCount === MAX_HOVERS) {
            resetNoButton();
            return;
        }
        
        // Yes Button grows slightly with each chase
        const baseScale = 1;
        const scaleFactor = 0.08;
        const newScale = baseScale + (hoverCount * scaleFactor);
        btnYes.style.transform = `scale(${Math.min(newScale, 1.4)})`;
        
        if (!btnNo.classList.contains('btn-no-runaway')) {
            btnNo.classList.add('btn-no-runaway');
        }
        
        // Append to body to break out of transformed parent container
        if (btnNo.parentElement !== document.body) {
            document.body.appendChild(btnNo);
        }
        
        const btnWidth = btnNo.offsetWidth;
        const btnHeight = btnNo.offsetHeight;
        
        const maxX = window.innerWidth - btnWidth - 40;
        const maxY = window.innerHeight - btnHeight - 40;
        
        let randomX = Math.floor(Math.random() * maxX);
        let randomY = Math.floor(Math.random() * maxY);
        
        if (randomX < 20) randomX = 20;
        if (randomY < 20) randomY = 20;
        
        btnNo.style.left = randomX + 'px';
        btnNo.style.top = randomY + 'px';
        
        // Set timer to automatically return home after 1.5 seconds of no hover
        returnTimeout = setTimeout(() => {
            resetNoButton();
        }, 1500);
    }
}

function resetNoButton() {
    if (returnTimeout) {
        clearTimeout(returnTimeout);
        returnTimeout = null;
    }
    // Return button to normal position inside the card
    if (btnNo.parentElement !== btnNoParent) {
        btnNoParent.appendChild(btnNo);
    }
    btnNo.classList.remove('btn-no-runaway');
    btnNo.style.position = '';
    btnNo.style.left = '';
    btnNo.style.top = '';
}

// Hover triggers runaway (for desktops) - Disabled to make the button stay in the original position
// btnNo.addEventListener('mouseover', moveNoButton);
// btnNo.addEventListener('mouseenter', moveNoButton);

// Touch triggers runaway (for mobile) - Disabled to make the button stay in the original position
// btnNo.addEventListener('touchstart', (e) => {
//     if (!canRunaway) return;
//     if (hoverCount < MAX_HOVERS) {
//         e.preventDefault(); // blocks click
//         moveNoButton();
//     }
// });

// Clicking transitions to next state (only possible when hoverCount >= MAX_HOVERS)
btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    const config = STATES[currentState];
    if (config && config.nextStateOnNo) {
        changeState(config.nextStateOnNo);
    }
});

// Toggle music playback when clicking the floating disk player
musicPlayer.addEventListener('click', toggleMusic);

// --- FLOATING HEARTS BACKGROUND ---
function createFloatingHearts() {
    const container = document.getElementById('hearts-bg');
    const totalHearts = 20;
    
    for (let i = 0; i < totalHearts; i++) {
        const heart = document.createElement('span');
        heart.classList.add('floating-heart');
        
        // Random positioning & timing
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 8 + 's';
        heart.style.animationDuration = (Math.random() * 5 + 5) + 's'; // between 5s to 10s
        
        // Random size
        const size = Math.random() * 15 + 10; // 10px to 25px
        heart.style.width = size + 'px';
        heart.style.height = size + 'px';
        
        container.appendChild(heart);
    }
}

// --- CONFETTI ANIMATIONS ---
function playCelebrationConfetti() {
    // Burst 1: Center burst
    confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
    });
    
    // Burst 2: Left and right sides fireworks (running for 3 seconds)
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1100 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        // launch from left/right edges
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

// --- RELATIONSHIP DAY COUNTER ---
function startRelationshipTimer() {
    const dayVal = document.getElementById('days-val');
    const hourVal = document.getElementById('hours-val');
    const minVal = document.getElementById('minutes-val');
    const secVal = document.getElementById('seconds-val');
    
    const targetDate = new Date(CONFIG.startDate);
    
    function updateCounter() {
        const now = new Date();
        const diffMs = now.getTime() - targetDate.getTime();
        
        if (diffMs < 0) {
            dayVal.textContent = "0";
            hourVal.textContent = "0";
            minVal.textContent = "0";
            secVal.textContent = "0";
            return;
        }
        
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        dayVal.textContent = days;
        hourVal.textContent = hours % 24;
        minVal.textContent = minutes % 60;
        secVal.textContent = seconds % 60;
    }
    
    // Run immediately and then set interval
    updateCounter();
    setInterval(updateCounter, 1000);
}

// --- ACTION BUTTON TRIGGERS ---
// 1. Send message to Line
btnSendLine.addEventListener('click', () => {
    const text = encodeURIComponent(CONFIG.lineMessageTemplate);
    const lineUrl = `https://line.me/R/msg/text/?${text}`;
    window.open(lineUrl, '_blank');
});

// 2. Open Write Message Modal
btnWriteHeart.addEventListener('click', () => {
    customMessageModal.classList.add('active');
    customMsgInput.focus();
});

modalClose.addEventListener('click', () => {
    customMessageModal.classList.remove('active');
});

// Close modal when clicking outside contents
customMessageModal.addEventListener('click', (e) => {
    if (e.target === customMessageModal) {
        customMessageModal.classList.remove('active');
    }
});

btnModalSubmit.addEventListener('click', () => {
    const msg = customMsgInput.value.trim();
    if (msg) {
        const text = encodeURIComponent(`เค้าอยากบอกว่า: ${msg}`);
        const lineUrl = `https://line.me/R/msg/text/?${text}`;
        window.open(lineUrl, '_blank');
        customMessageModal.classList.remove('active');
        customMsgInput.value = '';
    } else {
        alert("กรุณาพิมพ์ข้อความก่อนน้าาา 🥺");
    }
});
