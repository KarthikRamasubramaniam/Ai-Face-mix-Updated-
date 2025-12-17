// const TOTAL_IMAGES = 5; // Removed in favor of explicit list
const ASSET_PATH = 'assets/';

// List of actual files present in assets folder
const AVAILABLE_IMAGES = [
    'Akhand_Kumar.png',
    // 'Akhand_Rahul.png',
    'Anish_Shah.jpeg',
    'BP_Singh.jpeg',
    // 'Brijesh_BP.jpeg',
    'Brijesh_Datta.jpg',
    'Deepak_Kamale.jpeg',
    'Gaurav_Aggarwal.png',
    'Gaurav_Duggal.png',
    // 'Gaurav_Mohsin.png',
    // 'Kiran_Anish.png',
    'Kiran_Thomas.png',
    'Mohsin_Abbas.png',
    'Nilesh_Mahajan.jpeg',
    // 'Nilesh_Sameer.png',
    // 'Raghuram_Deepak.png',
    'Raghuram_Velega.jpeg',
    'Rahul_Mukherjee.jpeg',
    'Sameer_Mehta.jpeg',
    // 'Shailesh_Gaurav.png',
    'Shailesh_Naik.jpeg',
    'Sudhir_Mittal.jpeg',
    // 'Sudhir_Tarun.png',
    'Tarun_Kalra.jpeg',
    'Leader1.jpeg',
    'Leader2.jpeg',
    'Leader3.jpeg',
    'Leader4.jpeg',
    'Leader5.jpeg',
    'Leader6.jpeg',
    'Leader7.jpeg',
    'Leader8.jpeg',
    'Leader9.jpeg',
    'Leader10.jpeg',
    'Leader11.jpeg'

];

// --- STATE ---
let currentA = null;
let currentB = null;
let gameData = [];
let currentRoundIndex = 0;

// --- DOM ELEMENTS ---
const screens = {
    intro: document.getElementById('intro-screen'),
    selection: document.getElementById('selection-screen'),
    reveal: document.getElementById('reveal-screen')
};

const mosaicGrid = document.getElementById('mosaic-grid');
const canvas = document.getElementById('merge-canvas'); // Removed from HTML?
// Wait, canvas was in merge-screen, which I removed!
// I need to check if canvas is used or if I should just remove it.
// startSelectionPhase uses canvas? No.
// startFinalResultPhase uses canvas? No, it uses images directly now.
// So canvas and ctx are dead.

const revealImgA = document.getElementById('reveal-img-a');
const revealImgB = document.getElementById('reveal-img-b');
const revealNameA = document.getElementById('reveal-name-a');
const revealNameB = document.getElementById('reveal-name-b');

const mainActionBtn = document.getElementById('main-action-btn');
const showClueBtn = document.getElementById('show-clue-btn');
const clueDisplay = document.getElementById('clue-display');

// --- HELPERS ---
const pad = (num) => String(num).padStart(3, '0');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const getRandomImage = () => AVAILABLE_IMAGES[Math.floor(Math.random() * AVAILABLE_IMAGES.length)];

// --- AUDIO MANAGER (Procedural Sci-Fi Sounds) ---
class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Safe volume
        this.masterGain.connect(this.ctx.destination);
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Generic Oscillator Helper
    playTone(freq, type, duration, startTime = 0, vol = 1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    // 1. High-tech Button Click
    playClick() {
        this.resume();
        // Double chirp
        this.playTone(1200, 'sine', 0.1, 0, 0.5);
        this.playTone(2000, 'square', 0.05, 0.05, 0.3);
    }

    // 2. Holographic Hover
    playHover() {
        this.resume();
        // Very short high tick
        this.playTone(800, 'triangle', 0.05, 0, 0.1);
    }

    // 3. Screen Transition (Whoosh)
    playTransition() {
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Noise buffer would be better, but frequency sweep works for "energy"
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    // 4. Scanning Loop (Rhythmic Data)
    startScanningSound() {
        this.resume();
        this.isScanning = true;
        this.scanInterval = setInterval(() => {
            if (!this.isScanning) return;
            // Random data blips
            const freq = 800 + Math.random() * 800;
            this.playTone(freq, 'sine', 0.05, 0, 0.1);
        }, 100);
    }

    stopScanningSound() {
        this.isScanning = false;
        if (this.scanInterval) clearInterval(this.scanInterval);
    }

    // 5. Energy Buildup (Split/Merge) - Suspenseful Heartbeat & Riser
    playEnergyBuildup() {
        this.resume();
        const duration = 3.5; // Extended for suspense
        const now = this.ctx.currentTime;

        // 1. HEARTBEAT (Thumping Bass)
        const beatCount = 5;
        for (let i = 0; i < beatCount; i++) {
            const time = now + (i * 0.6); // 600ms gap approx
            // Thump 1 (Lub)
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.frequency.setValueAtTime(60, time);
            osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
            g.gain.setValueAtTime(0.6, time);
            g.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
            osc.connect(g);
            g.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + 0.2);

            // Thump 2 (Dub) - lighter
            const osc2 = this.ctx.createOscillator();
            const g2 = this.ctx.createGain();
            osc2.frequency.setValueAtTime(50, time + 0.15);
            osc2.frequency.exponentialRampToValueAtTime(25, time + 0.25);
            g2.gain.setValueAtTime(0.4, time + 0.15);
            g2.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
            osc2.connect(g2);
            g2.connect(this.masterGain);
            osc2.start(time + 0.15);
            osc2.stop(time + 0.35);
        }

        // 2. TENSION RISER (High pitch whine + wobble)
        const riserOsc = this.ctx.createOscillator();
        const riserGain = this.ctx.createGain();
        riserOsc.type = 'triangle';
        riserOsc.frequency.setValueAtTime(200, now);
        // Slowly rise then accelerate
        riserOsc.frequency.linearRampToValueAtTime(800, now + duration * 0.8);
        riserOsc.frequency.exponentialRampToValueAtTime(2000, now + duration);

        // Tremolo/Wobble effect
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(5, now);
        lfo.frequency.linearRampToValueAtTime(20, now + duration);
        lfo.connect(lfoGain);
        lfoGain.gain.value = 500; // Modulation depth
        lfoGain.connect(riserOsc.frequency);
        lfo.start(now);
        lfo.stop(now + duration);

        riserGain.gain.setValueAtTime(0, now);
        riserGain.gain.linearRampToValueAtTime(0.2, now + duration);

        riserOsc.connect(riserGain);
        riserGain.connect(this.masterGain);
        riserOsc.start(now);
        riserOsc.stop(now + duration);

        // 3. CLIMAX CYMBAL/CRASH (White Noise)
        const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 1.5, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < this.ctx.sampleRate * 1.5; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        const noiseGain = this.ctx.createGain();

        // Trigger at end
        noiseGain.gain.setValueAtTime(0, now + duration - 0.1);
        noiseGain.gain.linearRampToValueAtTime(0.5, now + duration);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration + 1.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(now + duration); // Boom at the end
    }

    // 6. Power Up (for start button)
    playPowerUp() {
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 1);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 1);
    }

    // 7. Reveal Success (Major chord arpeggio)
    playReveal() {
        this.resume();
        const now = this.ctx.currentTime;
        // Major chord arpeggio
        this.playTone(440, 'sine', 1.5, 0, 0.5);       // A4
        this.playTone(554.37, 'sine', 1.5, 0.1, 0.5); // C#5
        this.playTone(659.25, 'sine', 1.5, 0.2, 0.5); // E5
        this.playTone(880, 'sine', 2.0, 0.4, 0.5);    // A5
    }
}

const audioManager = new AudioManager();

// --- INITIALIZATION ---
async function init() {
    createFloatingShards();

    // Initialize Audio Context
    document.addEventListener('click', () => audioManager.resume(), { once: true });

    // Generic Button SFX
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mouseenter', () => audioManager.playHover());
        btn.addEventListener('click', () => audioManager.playClick());
    });

    // Start Button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            audioManager.playPowerUp();
            startSelectionPhase();
        });
        startBtn.addEventListener('mouseenter', () => {
            audioManager.resume();
            audioManager.playHover();
        });
    }

    // Main Action Button
    if (mainActionBtn) {
        mainActionBtn.addEventListener('click', () => {
            handleMainAction();
        });
    }

    // Clue Button
    if (showClueBtn) {
        showClueBtn.addEventListener('click', () => {
            revealClue();
        });
    }

    // Load Game Data
    try {
        const response = await fetch('game_data.json');
        gameData = await response.json();
        console.log("Game Data Loaded:", gameData);
    } catch (e) {
        console.error("Failed to load game data:", e);
    }
}

// --- MAIN ACTION HANDLER ---
function handleMainAction() {
    if (mainActionBtn.textContent.includes('REVEAL')) {
        audioManager.playReveal();
        revealImgA.classList.remove('blurred');
        revealImgB.classList.remove('blurred');
        revealImgA.classList.add('revealed-img');
        revealImgB.classList.add('revealed-img');
        mainActionBtn.textContent = 'FUSE ANOTHER REALITY';
    } else {
        resetGame();
    }
}

// --- CLUE HANDLER ---
function revealClue() {
    audioManager.playClick();
    showClueBtn.classList.add('hidden');
    clueDisplay.classList.remove('hidden');
}

function resetGame() {
    // Reset Image States
    if (revealImgA) {
        revealImgA.classList.add('blurred');
        revealImgA.classList.remove('revealed-img');
    }
    if (revealImgB) {
        revealImgB.classList.add('blurred');
        revealImgB.classList.remove('revealed-img');
    }

    // Reset Clue
    if (showClueBtn) showClueBtn.classList.remove('hidden');
    if (clueDisplay) {
        clueDisplay.classList.add('hidden');
        clueDisplay.textContent = '';
    }

    // Reset Button
    if (mainActionBtn) mainActionBtn.textContent = 'REVEAL IDENTITIES';

    // Reset Screens
    Object.values(screens).forEach(s => {
        if (s) s.classList.remove('active');
    });

    // Advance Round
    if (gameData.length > 1) {
        currentRoundIndex = (currentRoundIndex + 1) % gameData.length;
    } else {
        currentRoundIndex = 0;
    }

    startSelectionPhase();
}

function createFloatingShards() {
    const container = document.querySelector('.floating-shards');
    for (let i = 0; i < 15; i++) {
        const shard = document.createElement('div');
        shard.className = 'shard';
        shard.style.left = Math.random() * 100 + 'vw';
        shard.style.animationDelay = Math.random() * 5 + 's';
        shard.style.width = (Math.random() * 50 + 30) + 'px';
        shard.style.height = shard.style.width;

        const img = document.createElement('img');
        img.src = `${ASSET_PATH}${getRandomImage()}`;
        shard.appendChild(img);
        container.appendChild(shard);
    }
}

// --- PHASE 1 -> 2: SELECTION (MOSAIC) ---
async function startSelectionPhase() {
    switchScreen('selection');
    audioManager.playTransition();

    // Start Scanning Audio
    audioManager.startScanningSound();

    // Text-to-Speech Announcement
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any previous speech
        const utterance = new SpeechSynthesisUtterance("Scanning infinite realities.");
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        const findVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            // Try to find a male-ish Indian voice or fallback to robot
            // Note: Browser support varies wildly.
            const voice = voices.find(v => v.name.includes('India') || v.name.includes('Rishi') || v.name.includes('Google') || v.name.includes('Zira'));
            if (voice) {
                utterance.voice = voice;
            }
            utterance.pitch = 0.6; // Deepen
            window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = findVoice;
        } else {
            findVoice();
        }
    }

    // 1. Populate full screen grid
    mosaicGrid.innerHTML = '';
    const items = [];
    const recentImages = [];
    const COOLDOWN = 15;

    for (let i = 0; i < 150; i++) {
        const div = document.createElement('div');
        div.className = 'mosaic-item';

        let selectedInfo;
        let attempts = 0;
        do {
            selectedInfo = getRandomImage();
            attempts++;
        } while (recentImages.includes(selectedInfo) && attempts < 10);

        recentImages.push(selectedInfo);
        if (recentImages.length > COOLDOWN) recentImages.shift();

        const img = document.createElement('img');
        img.src = `${ASSET_PATH}${selectedInfo}`;
        img.className = 'mosaic-item';
        div.appendChild(img);
        mosaicGrid.appendChild(div);
        items.push(img);
    }

    // 2. Animate "Phasing"
    const phasingInterval = setInterval(() => {
        const idx = Math.floor(Math.random() * items.length);
        const item = items[idx];
        if (item) {
            item.classList.add('phasing');
            setTimeout(() => item.classList.remove('phasing'), 300);
        }
    }, 100);

    // 3. Select Targets based on JSON
    let roundData = null;
    if (gameData && gameData.length > 0) {
        roundData = gameData[currentRoundIndex];
    }

    // Wait for "Scanning" drama (Decreased duration per request)
    await sleep(3500); // Reduced from 7000 to 3500
    clearInterval(phasingInterval);
    audioManager.stopScanningSound();

    // Directly to Final Result (Skip Clue Page, Skip Sphere)
    startFinalResultPhase(roundData);
}

// --- PHASE 3: RESULT REVEAL (Consolidated) ---
// --- PHASE 3: RESULT REVEAL (Consolidated) ---
async function startFinalResultPhase(roundData) {
    if (!roundData) {
        console.error("No round data!");
        return;
    }

    // STOP TTS
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    // 1. Setup Data
    const mergedSrc = roundData["split the indenties image"];
    document.getElementById('reveal-img-merged').src = mergedSrc;

    revealImgA.src = roundData["qleft image"];
    revealImgB.src = roundData["right image"];

    // Ensure Blur is active initially
    revealImgA.classList.remove('revealed-img');
    revealImgB.classList.remove('revealed-img');
    revealImgA.classList.add('blurred');
    revealImgB.classList.add('blurred');

    // Names (Name + Designation)
    const nameA = roundData["qleft image name"] || "UNKNOWN";
    const roleA = roundData["left text"] || "";
    revealNameA.innerHTML = `${nameA}<br><span class="role-text">${roleA}</span>`;

    const nameB = roundData["right image name"] || "UNKNOWN";
    const roleB = roundData["right text"] || "";
    revealNameB.innerHTML = `${nameB}<br><span class="role-text">${roleB}</span>`;

    // HIDE SIDE CARDS INITIALLY (Ensure they are invisible start)
    document.querySelectorAll('.reveal-card.side-card').forEach(card => {
        card.classList.add('invisible-initially');
    });

    // Setup Clue Text (Hidden initially)
    if (clueDisplay) {
        const lText = roundData["left text"] || "?";
        const rText = roundData["right text"] || "?";
        clueDisplay.textContent = `${lText} X ${rText}`;
    }

    // Reset Buttons
    if (showClueBtn) showClueBtn.classList.remove('hidden');
    if (clueDisplay) clueDisplay.classList.add('hidden');

    // Set Initial State (Reveal)
    if (mainActionBtn) {
        mainActionBtn.textContent = 'REVEAL IDENTITIES';
        mainActionBtn.dataset.state = 'reveal';
        mainActionBtn.classList.add('btn-reveal'); // Make it longer
    }

    // 2. Switch Screen
    switchScreen('reveal');
    audioManager.playTransition();
}

// --- MAIN ACTION HANDLER ---
function handleMainAction() {
    const currentState = mainActionBtn.dataset.state || 'reveal';

    if (currentState === 'reveal') {
        // ACTION: REVEAL
        audioManager.playReveal();

        // 1. Ensure Side Cards are Visible
        document.querySelectorAll('.reveal-card.side-card').forEach(card => {
            card.classList.remove('invisible-initially');
        });

        // Unblur images
        revealImgA.classList.remove('blurred');
        revealImgB.classList.remove('blurred');
        revealImgA.classList.add('revealed-img');
        revealImgB.classList.add('revealed-img');

        // HIDE ALL CLUE ELEMENTS (Button and Text)
        if (showClueBtn) showClueBtn.classList.add('hidden');
        if (clueDisplay) clueDisplay.classList.add('hidden');

        // Change Button Text to FUSE (Make it shorter/normal)
        mainActionBtn.textContent = 'FUSE ANOTHER REALITY';
        mainActionBtn.dataset.state = 'reset';
        mainActionBtn.classList.remove('btn-reveal');
    } else {
        // ACTION: RESET
        resetGame();
    }
}

// --- CLUE HANDLER ---
function revealClue() {
    audioManager.playClick();
    showClueBtn.classList.add('hidden');
    clueDisplay.classList.remove('hidden');

    // 2. REVEAL SIDE CARDS (Blurred + Hidden Labels)
    document.querySelectorAll('.reveal-card.side-card').forEach(card => {
        card.classList.remove('invisible-initially');
    });
}

function resetGame() {
    // Reset Image States
    if (revealImgA) {
        revealImgA.classList.add('blurred');
        revealImgA.classList.remove('revealed-img');
    }
    if (revealImgB) {
        revealImgB.classList.add('blurred');
        revealImgB.classList.remove('revealed-img');
    }

    // Re-hide Side Cards
    document.querySelectorAll('.reveal-card.side-card').forEach(card => {
        card.classList.add('invisible-initially');
    });

    // Reset Clue
    if (showClueBtn) showClueBtn.classList.remove('hidden');
    if (clueDisplay) {
        clueDisplay.classList.add('hidden');
        clueDisplay.textContent = '';
    }

    // Reset Button to REVEAL (Make it longer)
    if (mainActionBtn) {
        mainActionBtn.textContent = 'REVEAL IDENTITIES';
        mainActionBtn.dataset.state = 'reveal';
        mainActionBtn.classList.add('btn-reveal');
    }

    // Reset Screens
    Object.values(screens).forEach(s => {
        if (s) s.classList.remove('active');
    });

    // Advance Round
    if (gameData.length > 1) {
        currentRoundIndex = (currentRoundIndex + 1) % gameData.length;
    } else {
        currentRoundIndex = 0;
    }

    startSelectionPhase();
}

// --- UTILS ---
function switchScreen(name) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });

    // Tiny delay to ensure DOM paint before fade-in
    const target = screens[name];
    target.classList.remove('hidden');
    // Force reflow
    void target.offsetWidth;
    target.classList.add('active');
}

function loadImage(filename) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = `${ASSET_PATH}${filename}`;
        img.onload = () => resolve(img);
        img.onerror = () => {
            const p = new Image();
            p.src = 'https://placehold.co/400x400/000/FFF?text=VOID';
            p.onload = () => resolve(p);
        };
    });
}

// Run
init();
