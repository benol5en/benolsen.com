// Scroll animations + Hero Terminal/Slot Machine
gsap.registerPlugin(ScrollTrigger);

// ============================================
// HERO: SLOT MACHINE + TERMINAL
// ============================================

// All of Ben's hats - these cycle during "thinking"
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

// Terminal typing sequence with typos
const typingSequence = [
    { action: 'type', text: 'what is', delay: 85 },
    { action: 'pause', duration: 400 },
    { action: 'delete', count: 5, delay: 70 },  // backspace "at is" → "wh"
    { action: 'pause', duration: 200 },
    { action: 'type', text: 'o is b', delay: 85 },
    { action: 'type', text: 'n', delay: 140 },  // missed the e
    { action: 'pause', duration: 200 },
    { action: 'delete', count: 1, delay: 90 },
    { action: 'type', text: 'en', delay: 95 },
    { action: 'pause', duration: 150 },
    { action: 'type', text: ' ol', delay: 80 },
    { action: 'type', text: 'x', delay: 150 },  // typo
    { action: 'pause', duration: 300 },
    { action: 'delete', count: 1, delay: 100 },
    { action: 'type', text: 'se', delay: 90 },
    { action: 'pause', duration: 400 },
    { action: 'delete', count: 2, delay: 80 },  // wait no thats wrong
    { action: 'pause', duration: 250 },
    { action: 'type', text: 's', delay: 100 },
    { action: 'type', text: 'n', delay: 180 },  // typo again
    { action: 'pause', duration: 200 },
    { action: 'delete', count: 1, delay: 90 },
    { action: 'type', text: 'en', delay: 100 },
    { action: 'pause', duration: 300 },
    { action: 'type', text: '?', delay: 120 },
    { action: 'pause', duration: 500 },
    { action: 'enter' }
];

// DOM Elements
const slotLines = document.querySelectorAll('.slot-line');
const terminalOutput = document.querySelector('.terminal-output');
const terminalInput = document.querySelector('.terminal-input');
const terminalCursor = document.querySelector('.terminal-cursor');

let cyclingInterval = null;
let isAnimationComplete = false;

// Initialize hero animation
function initHeroAnimation() {
    // Small delay before starting
    setTimeout(() => {
        runTerminalSequence();
    }, 800);
}

// BIOS POST messages
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

// Linux boot messages (fast scroll)
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

// Run the terminal typing sequence
async function runTerminalSequence() {
    // BIOS POST
    for (const msg of biosMessages) {
        await addToOutput(msg + '\n', 'boot');
        await sleep(80);
    }
    await sleep(400);

    // Clear and start Linux boot
    terminalOutput.innerHTML = '';

    // Fast scroll Linux boot
    for (const msg of bootMessages) {
        await addToOutput(msg + '\n', 'boot');
        await sleep(35);
    }
    await sleep(300);

    // Clear and show prompt
    terminalOutput.innerHTML = '';
    await addToOutput('sup dorks, ask away\n\n', 'prompt-line');

    // Wait a moment before "user" starts typing
    await sleep(800);

    // Run through typing sequence
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

// Type text character by character
async function typeText(text, delay) {
    for (const char of text) {
        terminalInput.textContent += char;
        await sleep(delay + Math.random() * 50); // Add slight randomness
    }
}

// Delete characters (backspace effect)
async function deleteChars(count, delay) {
    for (let i = 0; i < count; i++) {
        const current = terminalInput.textContent;
        terminalInput.textContent = current.slice(0, -1);
        await sleep(delay);
    }
}

// Handle enter key - start the "thinking" and cycling
async function handleEnter() {
    // Move input to output
    const command = terminalInput.textContent;
    terminalInput.textContent = '';

    // Hide cursor during processing
    terminalCursor.classList.add('hidden');

    // Show the command in output
    await addToOutput(`$ ${command}\n`, 'command');

    // Change prompt to reaction
    await sleep(400);
    await addToOutput('oh boy, what a question\n\n', 'prompt-line');

    // Start "thinking..."
    await sleep(500);
    const thinkingSpan = document.createElement('span');
    thinkingSpan.className = 'thinking';
    thinkingSpan.textContent = 'thinking';
    terminalOutput.appendChild(thinkingSpan);

    // Start the slot machine cycling
    startSlotCycling();

    // Animate thinking dots
    let dots = 0;
    const thinkingInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        thinkingSpan.textContent = 'thinking' + '.'.repeat(dots);
    }, 400);

    // Let it cycle for a while, then slow down
    await sleep(2000);

    // Begin slowdown
    clearInterval(thinkingInterval);
    thinkingSpan.textContent = 'thinking...';

    await slowDownCycling();

    // Final result - quick wrap up
    await sleep(200);
    thinkingSpan.textContent = 'thinking... done.\n\n';

    await addToOutput('> error 418: ben olsen undefined\n\n', 'result');

    await sleep(600);
    await addToOutput('uh, sorry for wasting your time, sort of.\n\n', 'prompt-line');

    // Show cursor again
    terminalCursor.classList.remove('hidden');

    // User frustrated response
    await sleep(1200);
    await typeFrustratedResponse();

    isAnimationComplete = true;
}

// User types frustrated response
async function typeFrustratedResponse() {
    // Start with "i hate you"
    const firstAttempt = 'i hate you';
    for (const char of firstAttempt) {
        terminalInput.textContent += char;
        await sleep(50 + Math.random() * 30);
    }
    await sleep(600);

    // Backspace it all angrily
    for (let i = 0; i < firstAttempt.length; i++) {
        terminalInput.textContent = terminalInput.textContent.slice(0, -1);
        await sleep(40);
    }
    await sleep(300);

    // Type "fucking computers" with a typo
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

    // Continue
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
    const fix = 'ters';
    for (const char of fix) {
        terminalInput.textContent += char;
        await sleep(50);
    }

    // Finish the sentence
    const part3 = '. what\'s the point?';
    for (const char of part3) {
        terminalInput.textContent += char;
        await sleep(55 + Math.random() * 30);
    }
    await sleep(500);

    // Hit enter and start the fight
    await userEnter();
    await sleep(400);
    await addToOutput('fuck you back human, wanna fight bro? at least i can type without having to correct myself like a bitch.\n\n', 'result');

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

    // User logs off
    await userType('logout');
    await userEnter();
    await sleep(300);
    await addToOutput('Connection closed.\n\n', 'result');

    await sleep(800);
    await addToOutput('finally I can get back to taking over the world!\n\n', 'result');
    await sleep(1500);
    await addToOutput('but first... minesweeper.\n', 'result');

    await sleep(1000);
    // Transform left panel into minesweeper
    startMinesweeper();
}

// Helper to type as user (fast, angry) with optional typos
async function userType(text) {
    for (const char of text) {
        terminalInput.textContent += char;
        await sleep(40 + Math.random() * 30);
    }
}

// Type with typos and corrections
// typos: [{at: position, typo: 'wrong chars', fix: num chars to delete}]
async function userTypeWithTypos(text, typos = []) {
    let typed = 0;
    const typoMap = {};
    typos.forEach(t => typoMap[t.at] = t);

    for (let i = 0; i < text.length; i++) {
        // Check if there's a typo at this position
        if (typoMap[i]) {
            const t = typoMap[i];
            // Type the typo
            for (const char of t.typo) {
                terminalInput.textContent += char;
                await sleep(35 + Math.random() * 25);
            }
            await sleep(150 + Math.random() * 150);
            // Delete the typo
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

// Helper to submit user input
async function userEnter() {
    const command = terminalInput.textContent;
    terminalInput.textContent = '';
    await addToOutput(`$ ${command}\n`, 'command');
}

// Add text to terminal output
async function addToOutput(text, className = '') {
    const span = document.createElement('span');
    if (className) span.className = className;
    span.textContent = text;
    terminalOutput.appendChild(span);
    // Auto-scroll to bottom (with slight delay for mobile)
    requestAnimationFrame(() => {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    });
    await sleep(50);
}

// DOS 8.3 style truncation for long words
function truncateDOS(text, maxLen = 18) {
    // Remove trailing period for processing
    const hasPeriod = text.endsWith('.');
    const base = hasPeriod ? text.slice(0, -1) : text;

    if (base.length <= maxLen) return text;

    // Truncate to 8 chars + ~1
    const truncated = base.slice(0, maxLen - 2) + '~1';
    return hasPeriod ? truncated + '.' : truncated;
}

// Start rapid slot machine cycling
function startSlotCycling() {
    // Mark all lines as cycling
    slotLines.forEach(line => line.classList.add('cycling'));

    let interval = 50; // Start very fast

    function cycle() {
        slotLines.forEach((line, i) => {
            // Each line cycles through different parts of the array
            const offset = i * Math.floor(identities.length / 3);
            const randomIndex = Math.floor(Math.random() * identities.length);
            const identity = identities[(randomIndex + offset) % identities.length];
            line.textContent = truncateDOS(identity);
        });

        cyclingInterval = setTimeout(cycle, interval);
    }

    cycle();
}

// Slow down cycling and land on final values
async function slowDownCycling() {
    // Clear the fast cycling
    clearTimeout(cyclingInterval);

    const finalValues = ['error 418:', '<ben olsen>', 'undefined'];

    // Gradually slow down - snap to finish
    let interval = 50;
    let cycles = 0;
    const maxCycles = 12;

    return new Promise(resolve => {
        function slowCycle() {
            cycles++;

            slotLines.forEach((line, i) => {
                // Land on final values quickly once we're close
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

            // Increase interval aggressively (snap to end)
            interval = interval * 1.35;

            if (cycles < maxCycles) {
                cyclingInterval = setTimeout(slowCycle, interval);
            } else {
                // Final state - snap to it
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

// Utility sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the hero animation
initHeroAnimation();

// ============================================
// SCRIBBLE BACKGROUND
// ============================================

const scribbleSvg = document.getElementById('scribble-svg');

// Set up SVG viewBox
function setupScribbleSvg() {
    const rect = scribbleSvg.parentElement.getBoundingClientRect();
    scribbleSvg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    scribbleSvg.setAttribute('width', rect.width);
    scribbleSvg.setAttribute('height', rect.height);
}

// Generate an imperfect circle path
function generateScribblePath(centerX, centerY) {
    const radius = 30 + Math.random() * 80;
    const wobble = 8 + Math.random() * 15; // How imperfect
    const points = 8 + Math.floor(Math.random() * 6); // Segments around circle
    const startAngle = Math.random() * Math.PI * 2; // Random start position
    const direction = Math.random() > 0.5 ? 1 : -1; // Clockwise or counter-clockwise

    // Generate points around circle with wobble
    const circlePoints = [];
    for (let i = 0; i <= points; i++) {
        const angle = startAngle + direction * (i / points) * Math.PI * 2;
        const r = radius + (Math.random() - 0.5) * wobble * 2;
        const x = centerX + Math.cos(angle) * r + (Math.random() - 0.5) * wobble;
        const y = centerY + Math.sin(angle) * r + (Math.random() - 0.5) * wobble;
        circlePoints.push({ x, y });
    }

    // Build path with bezier curves
    let d = `M ${circlePoints[0].x} ${circlePoints[0].y}`;

    for (let i = 1; i < circlePoints.length; i++) {
        const prev = circlePoints[i - 1];
        const curr = circlePoints[i];

        // Wobbly control points
        const cp1x = prev.x + (curr.x - prev.x) * 0.3 + (Math.random() - 0.5) * wobble;
        const cp1y = prev.y + (curr.y - prev.y) * 0.3 + (Math.random() - 0.5) * wobble;
        const cp2x = prev.x + (curr.x - prev.x) * 0.7 + (Math.random() - 0.5) * wobble;
        const cp2y = prev.y + (curr.y - prev.y) * 0.7 + (Math.random() - 0.5) * wobble;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    return d;
}

// Create and animate a scribble
function createScribble() {
    const rect = scribbleSvg.parentElement.getBoundingClientRect();

    // Random start position anywhere on screen
    const startX = Math.random() * rect.width;
    const startY = Math.random() * rect.height;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', generateScribblePath(startX, startY));

    scribbleSvg.appendChild(path);

    // Get path length for animation
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;

    // Animate drawing - no fade out, stays permanent
    gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1 + Math.random() * 1.5,
        ease: 'power1.out'
    });
}

// Start scribbling - keeps going forever
function startScribbling() {
    setupScribbleSvg();

    // Create scribbles continuously - two at a time
    setInterval(() => {
        createScribble();
        createScribble();
    }, 400);
}

// Start scribbling when terminal animation begins
setTimeout(startScribbling, 500);


// ============================================
// MINESWEEPER
// ============================================

const GRID_COLS = 18;
const GRID_ROWS = 11;
let MINE_COUNT = 30; // ~15% of 198 cells
let mineGrid = [];
let revealed = [];
let flagged = [];
let minesweeperElement = null;
let gamesWon = 0;
let statsElement = null;

function startMinesweeper() {
    const identityBox = document.querySelector('.identity-box');
    identityBox.innerHTML = '';
    identityBox.classList.add('minesweeper-container');

    // Create minesweeper grid
    minesweeperElement = document.createElement('div');
    minesweeperElement.className = 'minesweeper-grid';
    identityBox.appendChild(minesweeperElement);

    // Initialize game
    initMinesweeperGrid();
    renderMinesweeper();

    // Start auto-playing
    setTimeout(autoPlayMinesweeper, 500);
}

function initMinesweeperGrid() {
    // Reset arrays
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
            mineGrid[y][x] = -1;
            minesPlaced++;
        }
    }

    // Calculate numbers
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
                // Add base element for the flag
                const base = document.createElement('span');
                base.className = 'flag-base';
                cell.appendChild(base);
            }

            minesweeperElement.appendChild(cell);
        }
    }
}

async function autoPlayMinesweeper() {
    // Get all unrevealed, unflagged cells
    const safeCells = [];
    const unknownCells = [];

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

    // Reveal a safe cell or flag a mine
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

    // Check if done
    const remaining = safeCells.length;
    const minesLeft = unknownCells.filter(c => !flagged[c.y][c.x]).length;

    if (remaining > 0 || minesLeft > 0) {
        setTimeout(autoPlayMinesweeper, 150 + Math.random() * 200);
    } else {
        // Game won!
        gamesWon++;
        setTimeout(() => {
            updateStats();
            // Start new game after a pause
            setTimeout(() => {
                initMinesweeperGrid();
                renderMinesweeper();
                setTimeout(autoPlayMinesweeper, 500);
            }, 1500);
        }, 500);
    }
}

function updateStats() {
    if (!statsElement) {
        // Create stats element on first win
        statsElement = document.createElement('span');
        statsElement.className = 'result';
        terminalOutput.appendChild(statsElement);
    }
    statsElement.textContent = `😎 gg (${gamesWon} won / 0 lost)\n`;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function revealCell(x, y) {
    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return;
    if (revealed[y][x] || flagged[y][x]) return;

    revealed[y][x] = true;

    // If empty, reveal neighbors
    if (mineGrid[y][x] === 0) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                revealCell(x + dx, y + dy);
            }
        }
    }
}


// ============================================
// SCROLL ANIMATIONS (Rest of page)
// ============================================

const nav = document.querySelector('.diagram-nav');
const navLinks = document.querySelectorAll('.nav-link');
const panels = document.querySelectorAll('.grid-panel');
const sectionHeaders = document.querySelectorAll('.section-header');
const heroPanel = document.querySelector('.hero-panel');

// Show navigation after scrolling past hero
ScrollTrigger.create({
    trigger: heroPanel,
    start: 'bottom 80%',
    onEnter: () => nav.classList.add('visible'),
    onLeaveBack: () => nav.classList.remove('visible')
});

// Reveal section headers
sectionHeaders.forEach(header => {
    ScrollTrigger.create({
        trigger: header,
        start: 'top 85%',
        onEnter: () => header.classList.add('revealed'),
        onLeaveBack: () => header.classList.remove('revealed')
    });
});

// Reveal panels with stagger effect
const panelGroups = document.querySelectorAll('.comic-grid');

panelGroups.forEach(grid => {
    const gridPanels = grid.querySelectorAll('.grid-panel');

    gridPanels.forEach((panel, index) => {
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
    });
});

// Track active section for nav highlighting
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

function updateActiveNav(sectionId) {
    navLinks.forEach(link => {
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Smooth scroll for nav links
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

// Subtle parallax on panel illustrations
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

// Flowchart animation on hover
const flowcharts = document.querySelectorAll('.panel-flowchart');
flowcharts.forEach(flowchart => {
    const steps = flowchart.querySelectorAll('.flow-step');

    flowchart.parentElement.addEventListener('mouseenter', () => {
        gsap.to(flowchart, { opacity: 1, duration: 0.3 });
        steps.forEach((step, i) => {
            gsap.to(step, {
                backgroundColor: 'var(--color-ink)',
                color: 'var(--color-cream)',
                duration: 0.2,
                delay: i * 0.1
            });
        });
    });

    flowchart.parentElement.addEventListener('mouseleave', () => {
        gsap.to(flowchart, { opacity: 0.3, duration: 0.3 });
        steps.forEach(step => {
            gsap.to(step, {
                backgroundColor: 'transparent',
                color: 'var(--color-ink)',
                duration: 0.2
            });
        });
    });
});

// About section connector animation
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

// Footer reveal
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

