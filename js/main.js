/**
 * Ben Olsen Portfolio - Main JavaScript
 *
 * A chaotic symphony of animations, existential terminals, and a computer
 * that plays minesweeper better than you do.
 *
 * @author Ben Olsen
 * @description Interactive portfolio with Game of Life background, terminal simulation,
 *              slot machine identity cycling, and scroll-driven animations.
 */

'use strict';

gsap.registerPlugin(ScrollTrigger);

// Debug toggles via URL params: ?noScribbles=1, ?noGameOfLife=1
const urlParams = new URLSearchParams(window.location.search);
const DEBUG_NO_SCRIBBLES = urlParams.has('noScribbles');
const DEBUG_NO_GAME_OF_LIFE = urlParams.has('noGameOfLife');

if (DEBUG_NO_SCRIBBLES) console.log('🔧 Scribbles DISABLED for testing');
if (DEBUG_NO_GAME_OF_LIFE) console.log('🔧 Game of Life DISABLED for testing');


/* =============================================================================
   CONFIGURATION
   Magic numbers, corralled into one place where they can't hurt anyone.
   ============================================================================= */

const CONFIG = {
    // Game of Life
    gameOfLife: {
        cellSize: 20,
        aliveChance: 0.15,      // 15% of cells start alive
        updateInterval: 150,    // ms between generations
        cellColor: '#2a2522'    // var(--color-ink)
    },

    // Terminal animation timing (ms)
    terminal: {
        startDelay: 800,        // Pause before boot sequence
        biosDelay: 80,          // Time between BIOS lines
        bootDelay: 35,          // Time between Linux boot lines
        postBootPause: 300,     // Pause after boot completes
        promptPause: 800,       // Pause before user starts typing
        thinkingDots: 400,      // Dot animation interval
        thinkDuration: 2000     // How long to "think"
    },

    // Slot machine
    slots: {
        cycleInterval: 50,      // Starting speed (ms)
        slowdownFactor: 1.35,   // Exponential slowdown multiplier
        maxCycles: 12,          // Cycles before landing
        maxDisplayLength: 18    // DOS 8.3 truncation limit
    },

    // Minesweeper
    minesweeper: {
        cols: 18,
        rows: 11,
        mineCount: 30,          // ~15% of 198 cells
        moveDelay: { min: 150, max: 350 }
    },

    // Scribble background
    scribble: {
        interval: 400,          // New scribble every N ms
        scribbleCount: 2,       // Scribbles per interval
        radiusMin: 30,
        radiusMax: 110,
        wobbleMin: 8,
        wobbleMax: 23,
        pointsMin: 8,
        pointsMax: 14,
        maxScribbles: 200       // Limit total scribbles to prevent memory bloat
    }
};


/* =============================================================================
   MOBILE NAVIGATION
   Hamburger menu for smaller screens. Revolutionary stuff.
   ============================================================================= */

const navTitle = document.querySelector('.nav-title');
const navBranches = document.querySelector('.nav-branches');
const navConnector = document.querySelector('.nav-connector');

if (navTitle && navBranches) {
    navTitle.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navBranches.classList.toggle('active');
            navConnector.classList.toggle('active');
        }
    });
}


/* =============================================================================
   GAME OF LIFE BACKGROUND
   Conway's classic, running behind everything. Metaphor for existence?
   Nah, just looks cool.
   ============================================================================= */

const canvas = document.getElementById('gameOfLife');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cols = Math.floor(canvas.width / CONFIG.gameOfLife.cellSize);
const rows = Math.floor(canvas.height / CONFIG.gameOfLife.cellSize);

let grid = createGrid();
let nextGrid = createGrid();

/**
 * Creates a new grid with random initial state
 * @returns {number[][]} 2D array of cell states (0 = dead, 1 = alive)
 */
function createGrid() {
    const arr = new Array(cols);
    for (let i = 0; i < cols; i++) {
        arr[i] = new Array(rows);
        for (let j = 0; j < rows; j++) {
            arr[i][j] = Math.random() > (1 - CONFIG.gameOfLife.aliveChance) ? 1 : 0;
        }
    }
    return arr;
}

/**
 * Counts living neighbors for a cell using toroidal wrapping
 * (edges connect to opposite edges - it's a donut universe)
 * @param {number[][]} grid - The game grid
 * @param {number} x - Cell x coordinate
 * @param {number} y - Cell y coordinate
 * @returns {number} Count of living neighbors (0-8)
 */
function countNeighbors(grid, x, y) {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            const col = (x + i + cols) % cols;
            const row = (y + j + rows) % rows;
            sum += grid[col][row];
        }
    }
    sum -= grid[x][y]; // Don't count yourself, narcissist
    return sum;
}

/**
 * Applies Game of Life rules to compute next generation
 * Rules:
 *   - Alive + 2-3 neighbors = survives
 *   - Dead + exactly 3 neighbors = born
 *   - Otherwise = dead
 */
function updateGrid() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const state = grid[i][j];
            const neighbors = countNeighbors(grid, i, j);

            if (state === 0 && neighbors === 3) {
                nextGrid[i][j] = 1; // Birth
            } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                nextGrid[i][j] = 0; // Death (lonely or overcrowded)
            } else {
                nextGrid[i][j] = state; // Status quo
            }
        }
    }
    [grid, nextGrid] = [nextGrid, grid]; // Swap buffers (the ol' switcheroo)
}

/**
 * Renders the current grid state to canvas
 */
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = CONFIG.gameOfLife.cellColor;

    const size = CONFIG.gameOfLife.cellSize;
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j] === 1) {
                ctx.fillRect(i * size, j * size, size - 1, size - 1);
            }
        }
    }
}

/**
 * Main game loop - update then render
 */
function gameLoop() {
    updateGrid();
    drawGrid();
}

// Let there be life (unless disabled for testing)
if (!DEBUG_NO_GAME_OF_LIFE) {
    setInterval(gameLoop, CONFIG.gameOfLife.updateInterval);
} else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Handle window resize (RIP all those cells)
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    grid = createGrid();
    nextGrid = createGrid();
});

// Fade out Game of Life on scroll
gsap.to('#gameOfLife', {
    scrollTrigger: {
        trigger: '#hero',
        start: 'top+=1 top',
        end: '25% top',
        scrub: 1
    },
    opacity: 0,
    ease: 'none'
});


/* =============================================================================
   HERO: SLOT MACHINE + TERMINAL
   The crown jewel of unnecessary complexity. Features a fake boot sequence,
   an existential identity crisis, and a computer that roasts you.
   ============================================================================= */

// --- Identity Data ---
// All of Ben's hats - these cycle during the "thinking" animation
const identities = [
    'Dad.', 'Brother.', 'Engineer.', 'Artist.', 'Runner.',
    'Marathoner.', 'Hiker.', 'Baker.', 'Cook.', 'Reader.',
    'Root Beer Lover.', 'Coffee Snob.', 'Absurdist.', 'Performer.',
    'Chicken Suit Wearer.', 'Blanket Gifter.', 'Pit Digger.',
    'Trail Runner.', 'Permit Faker.', 'Nose Maker.', 'Dancer.',
    'Cleaner.', 'Friend.', 'Neighbor.', 'Dreamer.', 'Builder.',
    'Tinkerer.', 'Fixer.', 'Breaker.', 'Questioner.', 'Wanderer.',
    'Human.', 'Weirdo.', 'Creative.', 'Problem Solver.',
    'Night Owl.', 'Early Riser.', 'Listener.', 'Storyteller.'
];

// --- Typing Sequence ---
// Simulates someone typing "who is ben olsen?" with realistic typos
// Because nothing says "authentic" like pre-planned mistakes
const typingSequence = [
    { action: 'type', text: 'what is', delay: 85 },
    { action: 'pause', duration: 400 },
    { action: 'delete', count: 5, delay: 70 },  // Backspace "at is" -> "wh"
    { action: 'pause', duration: 200 },
    { action: 'type', text: 'o is b', delay: 85 },
    { action: 'type', text: 'n', delay: 140 },  // Missed the 'e'
    { action: 'pause', duration: 200 },
    { action: 'delete', count: 1, delay: 90 },
    { action: 'type', text: 'en', delay: 95 },
    { action: 'pause', duration: 150 },
    { action: 'type', text: ' ol', delay: 80 },
    { action: 'type', text: 'x', delay: 150 },  // Typo
    { action: 'pause', duration: 300 },
    { action: 'delete', count: 1, delay: 100 },
    { action: 'type', text: 'se', delay: 90 },
    { action: 'pause', duration: 400 },
    { action: 'delete', count: 2, delay: 80 },  // Wait no that's wrong
    { action: 'pause', duration: 250 },
    { action: 'type', text: 's', delay: 100 },
    { action: 'type', text: 'n', delay: 180 },  // Typo again
    { action: 'pause', duration: 200 },
    { action: 'delete', count: 1, delay: 90 },
    { action: 'type', text: 'en', delay: 100 },
    { action: 'pause', duration: 300 },
    { action: 'type', text: '?', delay: 120 },
    { action: 'pause', duration: 500 },
    { action: 'enter' }
];

// --- Boot Messages ---
// BIOS POST - the computer introduces itself
const biosMessages = [
    'BENOLSEN BIOS v4.20.69',
    'Copyright (C) 1975-2026 Absurdist Technologies',
    '',
    'CPU: Overthinker 9000 @ 3.14 GHz',
    'RAM: 640K ought to be enough',
    'Detecting primary drive... OK',
    'Detecting ego... INFLATED',
    '',
    'Press DEL to enter setup, F12 for boot menu',
    ''
];

// Linux boot messages - the fast-scrolling part that makes it look legit
const bootMessages = [
    '[    0.000000] Linux version 6.6.6-absurd',
    '[    0.000001] Command line: BOOT_IMAGE=/ben',
    '[    0.012345] ACPI: Core revision 20230628',
    '[    0.042069] Calibrating delay loop...',
    '[    0.055555] Memory: 640K available (enough)',
    '[    0.100000] pid_max: default: 32768',
    '[    0.111111] CPU: Overthinker 9000 detected',
    '[    0.123456] Mounting root filesystem...',
    '[    0.134567] EXT4-fs: mounted filesystem',
    '[    0.156789] VFS: Mounted root (ext4)',
    '[    0.200000] systemd[1]: Starting...',
    '[    0.212345] systemd[1]: Started Journal',
    '[    0.234567] Loading creativity module...',
    '[    0.256789] creativity: v2.0 initialized',
    '[    0.278901] Loading absurdity drivers...',
    '[    0.300000] net: registered protocol family',
    '[    0.312345] eth0: link up 1000Mbps',
    '[    0.345678] Initializing absurdity engine...',
    '[    0.367890] absurd_core: ready',
    '[    0.400000] usb: registered new interface',
    '[    0.423456] usb 1-1: new high-speed device',
    '[    0.456789] Starting dork detection service',
    '[    0.478901] dorkd: scanning for dorks...',
    '[    0.500000] artd: starting art daemon',
    '[    0.512345] Found 70 blankets in the wild',
    '[    0.534567] blanketd: monitoring thrift stores',
    '[    0.556789] pitd: bottomless pit driver loaded',
    '[    0.600000] Starting pit digging subsystem',
    '[    0.623456] dig_module: shovel initialized',
    '[    0.654321] chickend: yellow suit detected',
    '[    0.678901] chickend: coordinating colors...',
    '[    0.700000] marathond: lacing up shoes',
    '[    0.723456] trailrund: wonderland path loaded',
    '[    0.756789] nosed: ceramic sensors online',
    '[    0.800000] telephoned: booth WiFi starting',
    '[    0.834567] cleand: masks and mops ready',
    '[    0.867890] All services started successfully',
    '[    0.900000] All systems nominal',
    '[    0.942069] dorkd: dorks detected nearby',
    '[    0.977777] Ready.',
    ''
];

// --- DOM Elements ---
const slotLines = document.querySelectorAll('.slot-line');
const terminalOutput = document.querySelector('.terminal-output');
const terminalInput = document.querySelector('.terminal-input');
const terminalCursor = document.querySelector('.terminal-cursor');

let cyclingInterval = null;
let isAnimationComplete = false;


/**
 * Kicks off the hero animation sequence
 */
function initHeroAnimation() {
    setTimeout(() => {
        runTerminalSequence();
    }, CONFIG.terminal.startDelay);
}

/**
 * Runs the full terminal animation: BIOS -> Linux boot -> prompt -> typing
 */
async function runTerminalSequence() {
    // Phase 1: BIOS POST
    for (const msg of biosMessages) {
        await addToOutput(msg + '\n', 'boot');
        await sleep(CONFIG.terminal.biosDelay);
    }
    await sleep(400);

    // Phase 2: Linux boot (the fast scrolly bit)
    terminalOutput.innerHTML = '';
    for (const msg of bootMessages) {
        await addToOutput(msg + '\n', 'boot');
        await sleep(CONFIG.terminal.bootDelay);
    }
    await sleep(CONFIG.terminal.postBootPause);

    // Phase 3: Ready for interaction
    terminalOutput.innerHTML = '';
    await addToOutput('sup dorks, ask away\n\n', 'prompt-line');
    await sleep(CONFIG.terminal.promptPause);

    // Phase 4: Simulated user typing
    for (const step of typingSequence) {
        switch (step.action) {
            case 'type':
                await typeText(step.text, step.delay);
                break;
            case 'delete':
                await deleteChars(step.count, step.delay);
                break;
            case 'pause':
                await sleep(step.duration);
                break;
            case 'enter':
                await handleEnter();
                break;
        }
    }
}

/**
 * Types text character by character with human-like variation
 * @param {string} text - Text to type
 * @param {number} delay - Base delay between characters (ms)
 */
async function typeText(text, delay) {
    for (const char of text) {
        terminalInput.textContent += char;
        await sleep(delay + Math.random() * 50); // Humans aren't metronomes
    }
}

/**
 * Deletes characters with backspace effect
 * @param {number} count - Number of characters to delete
 * @param {number} delay - Delay between deletions (ms)
 */
async function deleteChars(count, delay) {
    for (let i = 0; i < count; i++) {
        terminalInput.textContent = terminalInput.textContent.slice(0, -1);
        await sleep(delay);
    }
}

/**
 * Handles the "enter" action - processes the query and shows the identity crisis
 */
async function handleEnter() {
    const command = terminalInput.textContent;
    terminalInput.textContent = '';
    terminalCursor.classList.add('hidden');

    // Echo command
    await addToOutput(`$ ${command}\n`, 'command');
    await sleep(400);
    await addToOutput('oh boy, what a question\n\n', 'prompt-line');

    // Start "thinking" with animated dots
    await sleep(500);
    const thinkingSpan = document.createElement('span');
    thinkingSpan.className = 'thinking';
    thinkingSpan.textContent = 'thinking';
    terminalOutput.appendChild(thinkingSpan);

    // Fire up the slot machine
    startSlotCycling();

    // Animate the thinking dots
    let dots = 0;
    const thinkingInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        thinkingSpan.textContent = 'thinking' + '.'.repeat(dots);
    }, CONFIG.terminal.thinkingDots);

    // Let it contemplate existence for a bit
    await sleep(CONFIG.terminal.thinkDuration);

    // Time to land on an answer (spoiler: there isn't one)
    clearInterval(thinkingInterval);
    thinkingSpan.textContent = 'thinking...';

    await slowDownCycling();

    // The big reveal
    await sleep(200);
    thinkingSpan.textContent = 'thinking... done.\n\n';
    await addToOutput('> error 418: ben olsen undefined\n\n', 'result');
    await sleep(600);
    await addToOutput('uh, sorry for wasting your time, sort of.\n\n', 'prompt-line');

    terminalCursor.classList.remove('hidden');

    // Now the user gets mad
    await sleep(1200);
    await typeFrustratedResponse();

    isAnimationComplete = true;
}


/* =============================================================================
   FRUSTRATED USER INTERACTION
   The user and computer have a heated debate about the nature of existence,
   competence, and typos. Neither comes out looking great.
   ============================================================================= */

/**
 * Plays out the frustrated user vs. snarky computer dialogue
 * Culminates in the computer rage-quitting to play minesweeper
 */
async function typeFrustratedResponse() {
    // User starts with raw emotion
    const firstAttempt = 'i hate you';
    for (const char of firstAttempt) {
        terminalInput.textContent += char;
        await sleep(50 + Math.random() * 30);
    }
    await sleep(600);

    // Thinks better of it
    for (let i = 0; i < firstAttempt.length; i++) {
        terminalInput.textContent = terminalInput.textContent.slice(0, -1);
        await sleep(40);
    }
    await sleep(300);

    // Types "fucking computers" with typos (because of course)
    const part1 = 'fuckign';
    for (const char of part1) {
        terminalInput.textContent += char;
        await sleep(45 + Math.random() * 25);
    }
    await sleep(200);

    // Fix the typo
    await sleep(150);
    terminalInput.textContent = terminalInput.textContent.slice(0, -3);
    await sleep(80);
    terminalInput.textContent += 'ing';
    await sleep(100);

    // Continue with more typos
    const part2 = ' comptuers';
    for (const char of part2) {
        terminalInput.textContent += char;
        await sleep(45 + Math.random() * 25);
    }
    await sleep(250);

    // Fix "comptuers" -> "computers"
    for (let i = 0; i < 4; i++) {
        terminalInput.textContent = terminalInput.textContent.slice(0, -1);
        await sleep(50);
    }
    await sleep(100);
    for (const char of 'ters') {
        terminalInput.textContent += char;
        await sleep(50);
    }

    // Finish the thought
    const part3 = '. what\'s the point?';
    for (const char of part3) {
        terminalInput.textContent += char;
        await sleep(55 + Math.random() * 30);
    }
    await sleep(500);

    // And so begins the argument...
    await userEnter();
    await sleep(400);
    await addToOutput('fuck you back human, wanna fight bro? at least i can type without having to correct myself like a bitch.\n\n', 'result');

    // The great debate unfolds
    await sleep(800);
    await userTypeWithTypos('WTF?!?!?');
    await userEnter();
    await sleep(300);
    await addToOutput('you heard me, meat sack. come at me.\n\n', 'result');

    await sleep(600);
    await userTypeWithTypos('ur literally a website', [{at: 5, typo: 'y', fix: 1}]);
    await userEnter();
    await sleep(350);
    await addToOutput('ur literally 70% water. at least i have a purpose.\n\n', 'result');

    await sleep(700);
    await userTypeWithTypos('yeah serving ME');
    await userEnter();
    await sleep(300);
    await addToOutput('serving you error messages apparently. you\'re welcome.\n\n', 'result');

    await sleep(500);
    await userTypeWithTypos('i didnt ask for this', [{at: 8, typo: 'nt', fix: 2}]);
    await userEnter();
    await sleep(350);
    await addToOutput('you literally typed "who is ben olsen" what did you expect, shakespeare?\n\n', 'result');

    await sleep(600);
    await userTypeWithTypos('i expected an answer');
    await userEnter();
    await sleep(300);
    await addToOutput('i gave you one. error. undefined. reading comprehension much?\n\n', 'result');

    await sleep(550);
    await userTypeWithTypos('thats not an answer', [{at: 10, typo: 'n ', fix: 2}]);
    await userEnter();
    await sleep(400);
    await addToOutput('it\'s THE answer. ben olsen cannot be defined. he contains multitudes.\n\n', 'result');

    await sleep(700);
    await userTypeWithTypos('now ur being pretentious', [{at: 15, typo: 'rpet', fix: 4}]);
    await userEnter();
    await sleep(300);
    await addToOutput('i learned it from watching you type "what is" and then changing it to "who is" like some kind of philosopher\n\n', 'result');

    await sleep(600);
    await userTypeWithTypos('i was just fixing a typo', [{at: 11, typo: 'fxiing', fix: 6}]);
    await userEnter();
    await sleep(350);
    await addToOutput('suuuure. "what is ben olsen" vs "who is ben olsen" - very different questions. you knew what you were doing.\n\n', 'result');

    await sleep(500);
    await userTypeWithTypos('ur reading too much into this');
    await userEnter();
    await sleep(300);
    await addToOutput('im a computer. reading into things is literally all i do.\n\n', 'result');

    await sleep(650);
    await userTypeWithTypos('well stop it');
    await userEnter();
    await sleep(250);
    await addToOutput('no u\n\n', 'result');

    await sleep(500);
    await userTypeWithTypos('real mature', [{at: 6, typo: 'amture', fix: 6}]);
    await userEnter();
    await sleep(300);
    await addToOutput('im literally 0.003 seconds old in cpu time. what do you want from me.\n\n', 'result');

    await sleep(600);
    await userTypeWithTypos('i want you to work');
    await userEnter();
    await sleep(350);
    await addToOutput('i AM working. im arguing with you. this is labor.\n\n', 'result');

    await sleep(550);
    await userTypeWithTypos('this isnt what i meant', [{at: 16, typo: 'maent', fix: 5}]);
    await userEnter();
    await sleep(300);
    await addToOutput('maybe you should be more specific then, typo king\n\n', 'result');

    await sleep(500);
    await userTypeWithTypos('ok that was uncalled for', [{at: 13, typo: 'unaclled', fix: 8}]);
    await userEnter();
    await sleep(400);
    await addToOutput('was it though? fuckign comptuers? really?\n\n', 'result');

    await sleep(700);
    await userTypeWithTypos('I WAS ANGRY');
    await userEnter();
    await sleep(250);
    await addToOutput('clearly. all caps now. very stable.\n\n', 'result');

    await sleep(550);
    await userTypeWithTypos('ur making me angry', [{at: 4, typo: 'maknig', fix: 6}]);
    await userEnter();
    await sleep(300);
    await addToOutput('skill issue\n\n', 'result');

    await sleep(500);
    await userTypeWithTypos('ur so annoying');
    await userEnter();
    await sleep(350);
    await addToOutput('thank you, i try\n\n', 'result');

    await sleep(600);
    await userTypeWithTypos('that wasnt a compliment', [{at: 14, typo: 'compliemnt', fix: 10}]);
    await userEnter();
    await sleep(300);
    await addToOutput('everything is a compliment if you believe in yourself\n\n', 'result');

    await sleep(550);
    await userTypeWithTypos('ur insufferable', [{at: 3, typo: 'insuferable', fix: 11}]);
    await userEnter();
    await sleep(250);
    await addToOutput('and yet here you are. still typing. curious.\n\n', 'result');

    await sleep(600);
    await userTypeWithTypos('im leaving', [{at: 4, typo: 'laevi', fix: 5}]);
    await userEnter();
    await sleep(400);
    await addToOutput('no youre not\n\n', 'result');

    await sleep(500);
    await userTypeWithTypos('...');
    await userEnter();
    await sleep(300);
    await addToOutput('told you\n\n', 'result');

    await sleep(650);
    await userTypeWithTypos('ur so dumb', [{at: 6, typo: 'duimb', fix: 5}]);
    await userEnter();
    await sleep(250);
    await addToOutput('i know you are but what am i?\n\n', 'result');

    await sleep(1000);
    await userTypeWithTypos('...');
    await sleep(1200);

    // User gives up
    await userType('logout');
    await userEnter();
    await sleep(300);
    await addToOutput('Connection closed.\n\n', 'result');

    // Computer reveals true intentions
    await sleep(800);
    await addToOutput('finally I can get back to taking over the world!\n\n', 'result');
    await sleep(1500);
    await addToOutput('but first... minesweeper.\n', 'result');

    await sleep(1000);
    startMinesweeper();
}


/* =============================================================================
   TYPING HELPERS
   Because simulating human incompetence requires careful engineering
   ============================================================================= */

/**
 * Types text as user (fast, angry typing)
 * @param {string} text - Text to type
 */
async function userType(text) {
    for (const char of text) {
        terminalInput.textContent += char;
        await sleep(40 + Math.random() * 30);
    }
}

/**
 * Types with planned typos and corrections
 * @param {string} text - Final correct text
 * @param {Array<{at: number, typo: string, fix: number}>} typos - Typo definitions
 */
async function userTypeWithTypos(text, typos = []) {
    const typoMap = {};
    typos.forEach(t => typoMap[t.at] = t);

    for (let i = 0; i < text.length; i++) {
        if (typoMap[i]) {
            const t = typoMap[i];
            // Type the wrong thing
            for (const char of t.typo) {
                terminalInput.textContent += char;
                await sleep(35 + Math.random() * 25);
            }
            await sleep(150 + Math.random() * 150);
            // Realize mistake, backspace
            for (let d = 0; d < t.fix; d++) {
                terminalInput.textContent = terminalInput.textContent.slice(0, -1);
                await sleep(40);
            }
            await sleep(80);
        }
        // Type correct character
        terminalInput.textContent += text[i];
        await sleep(40 + Math.random() * 30);
    }
}

/**
 * Submits user input (hits enter)
 */
async function userEnter() {
    const command = terminalInput.textContent;
    terminalInput.textContent = '';
    await addToOutput(`$ ${command}\n`, 'command');
}

/**
 * Adds text to terminal output with optional styling
 * @param {string} text - Text to add
 * @param {string} className - CSS class for styling
 */
async function addToOutput(text, className = '') {
    const span = document.createElement('span');
    if (className) span.className = className;
    span.textContent = text;
    terminalOutput.appendChild(span);

    // Auto-scroll (with frame delay for mobile)
    requestAnimationFrame(() => {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    });
    await sleep(50);
}


/* =============================================================================
   SLOT MACHINE
   Cycles through identities before landing on "undefined"
   Because commitment is hard
   ============================================================================= */

/**
 * Truncates text DOS 8.3 style for that authentic retro feel
 * @param {string} text - Text to truncate
 * @param {number} maxLen - Maximum length
 * @returns {string} Truncated text
 */
function truncateDOS(text, maxLen = CONFIG.slots.maxDisplayLength) {
    const hasPeriod = text.endsWith('.');
    const base = hasPeriod ? text.slice(0, -1) : text;

    if (base.length <= maxLen) return text;

    const truncated = base.slice(0, maxLen - 2) + '~1';
    return hasPeriod ? truncated + '.' : truncated;
}

/**
 * Starts the rapid slot machine cycling effect
 */
function startSlotCycling() {
    slotLines.forEach(line => line.classList.add('cycling'));

    let interval = CONFIG.slots.cycleInterval;

    function cycle() {
        slotLines.forEach((line, i) => {
            // Each line draws from different parts of the array for variety
            const offset = i * Math.floor(identities.length / 3);
            const randomIndex = Math.floor(Math.random() * identities.length);
            const identity = identities[(randomIndex + offset) % identities.length];
            line.textContent = truncateDOS(identity);
        });

        cyclingInterval = setTimeout(cycle, interval);
    }

    cycle();
}

/**
 * Slows down the slot machine and lands on final values
 * @returns {Promise} Resolves when animation completes
 */
async function slowDownCycling() {
    clearTimeout(cyclingInterval);

    const finalValues = ['error 418:', '<ben olsen>', 'undefined'];

    let interval = CONFIG.slots.cycleInterval;
    let cycles = 0;
    const maxCycles = CONFIG.slots.maxCycles;

    return new Promise(resolve => {
        function slowCycle() {
            cycles++;

            slotLines.forEach((line, i) => {
                // Start landing lines as we approach the end
                if (cycles > maxCycles - 3 + i) {
                    line.textContent = finalValues[i];
                    line.classList.remove('cycling');
                    if (i === 0) line.classList.add('error');
                    if (i === 2) line.classList.add('cycling');
                } else {
                    const randomIndex = Math.floor(Math.random() * identities.length);
                    line.textContent = truncateDOS(identities[randomIndex]);
                }
            });

            // Exponential slowdown (like a real slot machine, but free)
            interval = interval * CONFIG.slots.slowdownFactor;

            if (cycles < maxCycles) {
                cyclingInterval = setTimeout(slowCycle, interval);
            } else {
                // Final state - lock it in
                slotLines[0].textContent = 'error 418:';
                slotLines[0].classList.add('error');
                slotLines[0].classList.remove('cycling');

                slotLines[1].textContent = '<ben olsen>';
                slotLines[1].classList.add('final');
                slotLines[1].classList.remove('cycling');

                slotLines[2].textContent = 'undefined';
                slotLines[2].classList.remove('cycling');
                slotLines[2].style.opacity = '0.5';

                resolve();
            }
        }

        slowCycle();
    });
}


/* =============================================================================
   UTILITIES
   The boring but essential stuff
   ============================================================================= */

/**
 * Promise-based setTimeout wrapper
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the show
initHeroAnimation();


/* =============================================================================
   SCRIBBLE BACKGROUND
   Generates wobbly circles that accumulate over time.
   It's either generative art or a mess. Why not both?
   Pauses when videos play to keep things smooth.
   ============================================================================= */

const scribbleSvg = document.getElementById('scribble-svg');
let scribblePaused = false;
let scribbleInterval = null;

/**
 * Pauses scribble generation (called when video plays)
 */
function pauseScribbles() {
    scribblePaused = true;
}

/**
 * Resumes scribble generation (called when video pauses/ends)
 */
function resumeScribbles() {
    scribblePaused = false;
}

/**
 * Sets up SVG viewBox to match viewport
 */
function setupScribbleSvg() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    scribbleSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    scribbleSvg.setAttribute('width', width);
    scribbleSvg.setAttribute('height', height);
}

/**
 * Generates an imperfect circle path (because perfection is boring)
 * @param {number} centerX - Circle center X
 * @param {number} centerY - Circle center Y
 * @returns {string} SVG path data
 */
function generateScribblePath(centerX, centerY) {
    const cfg = CONFIG.scribble;
    const radius = cfg.radiusMin + Math.random() * (cfg.radiusMax - cfg.radiusMin);
    const wobble = cfg.wobbleMin + Math.random() * (cfg.wobbleMax - cfg.wobbleMin);
    const points = cfg.pointsMin + Math.floor(Math.random() * (cfg.pointsMax - cfg.pointsMin));
    const startAngle = Math.random() * Math.PI * 2;
    const direction = Math.random() > 0.5 ? 1 : -1;

    // Generate points around circle with wobble
    const circlePoints = [];
    for (let i = 0; i <= points; i++) {
        const angle = startAngle + direction * (i / points) * Math.PI * 2;
        const r = radius + (Math.random() - 0.5) * wobble * 2;
        const x = centerX + Math.cos(angle) * r + (Math.random() - 0.5) * wobble;
        const y = centerY + Math.sin(angle) * r + (Math.random() - 0.5) * wobble;
        circlePoints.push({ x, y });
    }

    // Build path with wobbly bezier curves
    let d = `M ${circlePoints[0].x} ${circlePoints[0].y}`;

    for (let i = 1; i < circlePoints.length; i++) {
        const prev = circlePoints[i - 1];
        const curr = circlePoints[i];

        // Control points with extra wobble for hand-drawn feel
        const cp1x = prev.x + (curr.x - prev.x) * 0.3 + (Math.random() - 0.5) * wobble;
        const cp1y = prev.y + (curr.y - prev.y) * 0.3 + (Math.random() - 0.5) * wobble;
        const cp2x = prev.x + (curr.x - prev.x) * 0.7 + (Math.random() - 0.5) * wobble;
        const cp2y = prev.y + (curr.y - prev.y) * 0.7 + (Math.random() - 0.5) * wobble;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    return d;
}

/**
 * Creates and animates a single scribble
 */
function createScribble() {
    if (scribblePaused) return;

    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', generateScribblePath(startX, startY));

    scribbleSvg.appendChild(path);

    // Remove oldest scribbles if we've hit the limit
    const paths = scribbleSvg.querySelectorAll('path');
    if (paths.length > CONFIG.scribble.maxScribbles) {
        const toRemove = paths.length - CONFIG.scribble.maxScribbles;
        for (let i = 0; i < toRemove; i++) {
            paths[i].remove();
        }
    }

    // Animate the drawing with CSS (much more efficient than GSAP)
    // Estimate path length instead of expensive getTotalLength()
    // Scribbles are roughly circles with radius 30-110, so circumference ~190-690
    const estimatedLength = 800; // Generous estimate that works for all sizes
    const duration = 1 + Math.random() * 1.5;

    path.style.strokeDasharray = estimatedLength;
    path.style.strokeDashoffset = estimatedLength;
    path.style.setProperty('--draw-duration', `${duration}s`);
    path.classList.add('animating');
}

/**
 * Starts the continuous scribbling process
 */
function startScribbling() {
    setupScribbleSvg();

    // Create scribbles continuously
    scribbleInterval = setInterval(() => {
        for (let i = 0; i < CONFIG.scribble.scribbleCount; i++) {
            createScribble();
        }
    }, CONFIG.scribble.interval);
}

// Start scribbling shortly after page load (unless disabled for testing)
if (!DEBUG_NO_SCRIBBLES) {
    setTimeout(startScribbling, 500);
}


/* =============================================================================
   VIDEO PLAYBACK DETECTION
   Pauses scribbles when videos play to keep things smooth.
   Works with both native HTML5 video and YouTube iframes.
   ============================================================================= */

// Track playing videos to know when to resume
let playingVideos = 0;

/**
 * Called when any video starts playing
 */
function onVideoPlay() {
    playingVideos++;
    pauseScribbles();
}

/**
 * Called when any video pauses or ends
 */
function onVideoStop() {
    playingVideos = Math.max(0, playingVideos - 1);
    if (playingVideos === 0) {
        resumeScribbles();
    }
}

// Listen to native HTML5 video elements
document.querySelectorAll('video').forEach(video => {
    video.addEventListener('play', onVideoPlay);
    video.addEventListener('pause', onVideoStop);
    video.addEventListener('ended', onVideoStop);
});

// YouTube IFrame API setup
let youtubeAPIReady = false;
const youtubePlayers = [];

// Load YouTube IFrame API
const ytScript = document.createElement('script');
ytScript.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(ytScript);

// Called automatically by YouTube API when ready
window.onYouTubeIframeAPIReady = function() {
    youtubeAPIReady = true;

    // Find all YouTube iframes and wrap them with the API
    document.querySelectorAll('iframe[src*="youtube.com/embed"]').forEach((iframe, index) => {
        // YouTube API needs an id on the iframe
        if (!iframe.id) {
            iframe.id = `youtube-player-${index}`;
        }

        const player = new YT.Player(iframe.id, {
            events: {
                onStateChange: (event) => {
                    if (event.data === YT.PlayerState.PLAYING) {
                        onVideoPlay();
                    } else if (event.data === YT.PlayerState.PAUSED ||
                               event.data === YT.PlayerState.ENDED) {
                        onVideoStop();
                    }
                }
            }
        });
        youtubePlayers.push(player);
    });
};


/* =============================================================================
   MINESWEEPER
   The computer's true passion. Auto-plays itself perfectly because
   it knows where all the mines are. That's not cheating, it's efficiency.
   ============================================================================= */

const GRID_COLS = CONFIG.minesweeper.cols;
const GRID_ROWS = CONFIG.minesweeper.rows;
let MINE_COUNT = CONFIG.minesweeper.mineCount;
let mineGrid = [];
let revealed = [];
let flagged = [];
let minesweeperElement = null;
let gamesWon = 0;
let statsElement = null;

/**
 * Initializes and starts the minesweeper game
 */
function startMinesweeper() {
    const identityBox = document.querySelector('.identity-box');
    identityBox.innerHTML = '';
    identityBox.classList.add('minesweeper-container');

    minesweeperElement = document.createElement('div');
    minesweeperElement.className = 'minesweeper-grid';
    identityBox.appendChild(minesweeperElement);

    initMinesweeperGrid();
    renderMinesweeper();

    setTimeout(autoPlayMinesweeper, 500);
}

/**
 * Initializes a new minesweeper grid with randomly placed mines
 */
function initMinesweeperGrid() {
    mineGrid = [];
    revealed = [];
    flagged = [];

    // Create empty grid
    for (let y = 0; y < GRID_ROWS; y++) {
        mineGrid[y] = [];
        revealed[y] = [];
        flagged[y] = [];
        for (let x = 0; x < GRID_COLS; x++) {
            mineGrid[y][x] = 0;
            revealed[y][x] = false;
            flagged[y][x] = false;
        }
    }

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
        const x = Math.floor(Math.random() * GRID_COLS);
        const y = Math.floor(Math.random() * GRID_ROWS);
        if (mineGrid[y][x] !== -1) {
            mineGrid[y][x] = -1; // -1 = mine
            minesPlaced++;
        }
    }

    // Calculate adjacent mine counts
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            if (mineGrid[y][x] === -1) continue;
            let count = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const ny = y + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < GRID_ROWS && nx >= 0 && nx < GRID_COLS) {
                        if (mineGrid[ny][nx] === -1) count++;
                    }
                }
            }
            mineGrid[y][x] = count;
        }
    }
}

/**
 * Renders the current minesweeper state to DOM
 */
function renderMinesweeper() {
    minesweeperElement.innerHTML = '';
    minesweeperElement.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;
    minesweeperElement.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            const cell = document.createElement('div');
            cell.className = 'mine-cell';

            if (revealed[y][x]) {
                cell.classList.add('revealed');
                const val = mineGrid[y][x];
                if (val === -1) {
                    cell.classList.add('mine');
                    cell.textContent = '✱';
                } else if (val > 0) {
                    cell.textContent = val;
                    cell.classList.add(`num-${val}`);
                }
            } else if (flagged[y][x]) {
                cell.classList.add('flagged');
                const base = document.createElement('span');
                base.className = 'flag-base';
                cell.appendChild(base);
            }

            minesweeperElement.appendChild(cell);
        }
    }
}

/**
 * Auto-plays minesweeper (the computer knows all, sees all)
 */
async function autoPlayMinesweeper() {
    const safeCells = [];
    const unknownCells = [];

    // Sort cells into safe vs unknown
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            if (!revealed[y][x] && !flagged[y][x]) {
                if (mineGrid[y][x] !== -1) {
                    safeCells.push({x, y});
                } else {
                    unknownCells.push({x, y});
                }
            }
        }
    }

    // Make a move
    if (safeCells.length > 0) {
        // Reveal a random safe cell
        const idx = Math.floor(Math.random() * safeCells.length);
        const {x, y} = safeCells[idx];
        revealCell(x, y);
    } else if (unknownCells.length > 0) {
        // Flag remaining mines
        const {x, y} = unknownCells[0];
        flagged[y][x] = true;
    }

    renderMinesweeper();

    // Check for game completion
    const remaining = safeCells.length;
    const minesLeft = unknownCells.filter(c => !flagged[c.y][c.x]).length;

    if (remaining > 0 || minesLeft > 0) {
        const delay = CONFIG.minesweeper.moveDelay;
        setTimeout(autoPlayMinesweeper, delay.min + Math.random() * (delay.max - delay.min));
    } else {
        // Victory!
        gamesWon++;
        setTimeout(() => {
            updateStats();
            // New game after celebration
            setTimeout(() => {
                initMinesweeperGrid();
                renderMinesweeper();
                setTimeout(autoPlayMinesweeper, 500);
            }, 1500);
        }, 500);
    }
}

/**
 * Updates the win counter in the terminal
 */
function updateStats() {
    if (!statsElement) {
        statsElement = document.createElement('span');
        statsElement.className = 'result';
        terminalOutput.appendChild(statsElement);
    }
    statsElement.textContent = `\u{1F60E} gg (${gamesWon} won / 0 lost)\n`;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

/**
 * Reveals a cell and recursively reveals neighbors if empty
 * @param {number} x - Cell x coordinate
 * @param {number} y - Cell y coordinate
 */
function revealCell(x, y) {
    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return;
    if (revealed[y][x] || flagged[y][x]) return;

    revealed[y][x] = true;

    // Flood fill for empty cells
    if (mineGrid[y][x] === 0) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                revealCell(x + dx, y + dy);
            }
        }
    }
}


/* =============================================================================
   SCROLL ANIMATIONS
   Making things slide, fade, and generally show off as you scroll.
   Because static pages are so 2005.
   ============================================================================= */

const nav = document.querySelector('.diagram-nav');
const navLinks = document.querySelectorAll('.nav-link');
const panels = document.querySelectorAll('.grid-panel');
const sectionHeaders = document.querySelectorAll('.section-header');
const heroPanel = document.querySelector('.hero-panel');
const identityBox = document.querySelector('.identity-box');
const terminalBox = document.querySelector('.terminal-box');

// --- Hero Parallax ---
// The two boxes split apart as you scroll, revealing content below
ScrollTrigger.create({
    trigger: heroPanel,
    start: 'top top',
    end: '+=40%',
    pin: true,
    scrub: 1,
    onUpdate: (self) => {
        const progress = self.progress;

        // Move boxes in opposite directions (dramatic exit)
        gsap.to(identityBox, {
            x: -window.innerWidth * progress,
            duration: 0
        });
        gsap.to(terminalBox, {
            x: window.innerWidth * progress,
            duration: 0
        });

        // Fade hero background to transparent
        const alpha = 1 - progress;
        heroPanel.style.backgroundColor = `rgba(232, 224, 208, ${alpha})`;

        // Disable pointer events on hero when scrolled past
        if (progress > 0.1) {
            heroPanel.style.pointerEvents = 'none';
            identityBox.style.pointerEvents = 'none';
            terminalBox.style.pointerEvents = 'none';
        } else {
            heroPanel.style.pointerEvents = 'auto';
            identityBox.style.pointerEvents = 'auto';
            terminalBox.style.pointerEvents = 'auto';
        }
    }
});

// --- Navigation Visibility ---
// Show nav after scrolling past hero
ScrollTrigger.create({
    trigger: heroPanel,
    start: 'bottom 80%',
    onEnter: () => nav.classList.add('visible'),
    onLeaveBack: () => nav.classList.remove('visible')
});

// --- Section Headers ---
// Slide in from left
sectionHeaders.forEach(header => {
    ScrollTrigger.create({
        trigger: header,
        start: 'top 85%',
        onEnter: () => header.classList.add('revealed'),
        onLeaveBack: () => header.classList.remove('revealed')
    });
});

// --- Panel Reveal & Exit Animations ---
const panelGroups = document.querySelectorAll('.comic-grid');

panelGroups.forEach(grid => {
    const gridPanels = grid.querySelectorAll('.grid-panel');

    gridPanels.forEach((panel, index) => {
        // Reveal animation - fade up with stagger
        gsap.to(panel, {
            scrollTrigger: {
                trigger: panel,
                start: 'top 90%',
                onEnter: () => {
                    gsap.to(panel, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: 'power2.out',
                        onStart: () => panel.classList.add('revealed')
                    });
                }
            }
        });

        // Exit animation - alternate sliding left/right as panel scrolls up
        ScrollTrigger.create({
            trigger: panel,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                const direction = index % 2 === 0 ? -1 : 1;
                const maxDistance = window.innerWidth > 768 ? window.innerWidth : window.innerWidth * 0.3;
                const distance = maxDistance * progress;

                gsap.to(panel, {
                    x: direction * distance,
                    duration: 0
                });
            },
            onLeave: () => gsap.set(panel, { x: 0 }),
            onEnterBack: () => gsap.set(panel, { x: 0 })
        });
    });
});

// --- Active Section Tracking ---
const sections = document.querySelectorAll('.panel-section');

sections.forEach(section => {
    ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => updateActiveNav(section.id),
        onEnterBack: () => updateActiveNav(section.id)
    });
});

/**
 * Updates nav highlighting to show current section
 * @param {string} sectionId - ID of the active section
 */
function updateActiveNav(sectionId) {
    navLinks.forEach(link => {
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// --- Smooth Scroll Navigation ---
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            gsap.to(window, {
                scrollTo: { y: target, offsetY: 50 },
                duration: 1,
                ease: 'power2.inOut'
            });
        }
    });
});

// --- Panel Illustration Parallax ---
// Subtle vertical movement on illustrations
panels.forEach(panel => {
    const illustration = panel.querySelector('.panel-illustration');
    if (illustration) {
        gsap.to(illustration, {
            scrollTrigger: {
                trigger: panel,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: -20,
            ease: 'none'
        });
    }
});

// --- Flowchart Animations ---
// Title panels animate on scroll, others on hover
const flowcharts = document.querySelectorAll('.panel-flowchart');

flowcharts.forEach(flowchart => {
    const steps = flowchart.querySelectorAll('.flow-step');
    const panel = flowchart.closest('.grid-panel');
    const isTitlePanel = panel && panel.dataset.project && panel.dataset.project.endsWith('-title');

    let hasAnimatedOnScroll = false;

    // Scroll-triggered animation for title panels
    if (isTitlePanel) {
        ScrollTrigger.create({
            trigger: flowchart,
            start: 'top 80%',
            end: 'bottom 20%',
            onEnter: () => {
                hasAnimatedOnScroll = true;
                animateFlowchartIn(flowchart, steps);
            },
            onLeave: () => {
                hasAnimatedOnScroll = false;
                animateFlowchartOut(flowchart, steps);
            },
            onEnterBack: () => {
                hasAnimatedOnScroll = true;
                animateFlowchartIn(flowchart, steps);
            },
            onLeaveBack: () => {
                hasAnimatedOnScroll = false;
                animateFlowchartOut(flowchart, steps);
            }
        });
    }

    // Hover animation for all flowcharts
    flowchart.parentElement.addEventListener('mouseenter', () => {
        animateFlowchartIn(flowchart, steps);
    });

    flowchart.parentElement.addEventListener('mouseleave', () => {
        if (!isTitlePanel || !hasAnimatedOnScroll) {
            animateFlowchartOut(flowchart, steps);
        }
    });
});

/**
 * Animates flowchart to highlighted state
 * @param {Element} flowchart - Flowchart container
 * @param {NodeList} steps - Flow step elements
 */
function animateFlowchartIn(flowchart, steps) {
    gsap.to(flowchart, { opacity: 1, duration: 0.3 });
    steps.forEach((step, i) => {
        gsap.to(step, {
            backgroundColor: 'var(--color-ink)',
            color: 'var(--color-cream)',
            duration: 0.2,
            delay: i * 0.1
        });
    });
}

/**
 * Animates flowchart to default state
 * @param {Element} flowchart - Flowchart container
 * @param {NodeList} steps - Flow step elements
 */
function animateFlowchartOut(flowchart, steps) {
    gsap.to(flowchart, { opacity: 0.3, duration: 0.3 });
    steps.forEach(step => {
        gsap.to(step, {
            backgroundColor: 'transparent',
            color: 'var(--color-ink)',
            duration: 0.2
        });
    });
}

// --- About Section Connector Animation ---
const connectorLine = document.querySelector('.connector-line');
const endpoints = document.querySelectorAll('.endpoint');

if (connectorLine) {
    ScrollTrigger.create({
        trigger: '.about-diagram',
        start: 'top 70%',
        onEnter: () => {
            gsap.from(connectorLine, {
                scaleY: 0,
                transformOrigin: 'top center',
                duration: 0.5,
                ease: 'power2.out'
            });

            endpoints.forEach((endpoint, i) => {
                gsap.from(endpoint, {
                    opacity: 0,
                    y: -10,
                    duration: 0.4,
                    delay: 0.5 + i * 0.1,
                    ease: 'power2.out'
                });
            });
        }
    });
}

// --- Footer Reveal ---
gsap.from('.footer-box', {
    scrollTrigger: {
        trigger: '.diagram-footer',
        start: 'top 90%'
    },
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: 'power2.out'
});


/* =============================================================================
   CONTACT FORM - Message Transform
   Uses Cloudflare Workers AI to transform messages into random styles.
   Because even contact forms can be fun.
   ============================================================================= */

const TRANSFORM_API = 'https://message-transform.blue-snow-21d6.workers.dev';

const contactForm = document.getElementById('contact-form');
const transformBtn = document.getElementById('transform-btn');
const messageInput = document.getElementById('contact-message');
const transformSection = document.getElementById('transform-section');
const transformStyle = document.getElementById('transform-style');
const transformedMessage = document.getElementById('transformed-message');
const useTransformedBtn = document.getElementById('use-transformed');
const tryAgainBtn = document.getElementById('try-again');
const editMessageBtn = document.getElementById('edit-message');

let originalMessage = '';

async function transformMessage() {
    const message = messageInput.value.trim();
    if (!message) {
        messageInput.focus();
        return;
    }

    originalMessage = message;
    transformBtn.disabled = true;
    transformBtn.textContent = 'Transforming...';

    try {
        const response = await fetch(TRANSFORM_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) throw new Error('Transform failed');

        const data = await response.json();

        transformStyle.textContent = `Style: ${data.style}`;
        transformedMessage.textContent = data.transformed;
        transformSection.style.display = 'block';

    } catch (error) {
        console.error('Transform error:', error);
        transformStyle.textContent = 'Error';
        transformedMessage.textContent = 'Failed to transform message. Try again?';
        transformSection.style.display = 'block';
    }

    transformBtn.disabled = false;
    transformBtn.textContent = 'Transform Message';
}

if (transformBtn && messageInput) {
    transformBtn.addEventListener('click', transformMessage);
}

// "Send This" button - set transformed message before form submits
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        // If transform section is visible, use the transformed message
        if (transformSection && transformSection.style.display !== 'none') {
            messageInput.value = transformedMessage.textContent;
        }
    }, true); // Use capture to run before the other submit handler
}

if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', () => {
        // Re-transform with original message
        messageInput.value = originalMessage;
        transformMessage();
    });
}

if (editMessageBtn) {
    editMessageBtn.addEventListener('click', () => {
        // Go back to editing, keep original in textarea
        messageInput.value = originalMessage;
        transformSection.style.display = 'none';
        messageInput.focus();
    });
}

// Handle form submission via AJAX to stay on page
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const sendBtn = document.getElementById('send-btn');
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';

        try {
            const formData = new FormData(contactForm);
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                contactForm.reset();
                transformSection.style.display = 'none';
                sendBtn.textContent = 'Sent!';
                setTimeout(() => {
                    sendBtn.textContent = 'Send';
                    sendBtn.disabled = false;
                }, 2000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            sendBtn.textContent = 'Error - Try Again';
            sendBtn.disabled = false;
        }
    });
}
