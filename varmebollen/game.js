const CONFIG = {
    BASE_URL: 'https://keyvalue.immanuel.co/api/KeyVal',
    APP_KEY: 'Varmebollen_Standalone_v1'
};

const GAME = {
    active: false,
    playing: false,
    isTeacher: false, // In this context: isHost (controls hornet AI and temperature)
    studentId: '',
    studentName: '',
    allBees: new Map(),
    deadBees: new Set(),
    canvas: null,
    ctx: null,
    animFrame: null,
    syncInterval: null,
    pointerTarget: { x: 0.5, y: 0.5 },
    pointerDown: false,
    keysDown: new Set(),
    
    // Physics & State
    temperature: 25.0,
    ambientTemp: 25.0,
    lethalTemp: 47.0, // Hornet dies
    heatRate: 0.4,
    coolRate: 0.8,
    heatRadius: 0.15,
    beeSpeed: 0.25,
    chaseStickTime: 2.0,
    
    hornet: { x: 0.5, y: 0.5, vx: 0, vy: 0, speed: 0.12, targetBee: null, chaseTimer: 0, heading: 0 },
    myBee: { x: 0.2, y: 0.2, heading: 0 },
    bgStars: [],
    victory: false,
    defeat: false,
    initialBeeCount: 0,
    
    // Images
    beeImg: new Image(),
    hornetImg: new Image()
};

GAME.beeImg.src = 'assets/bee.png';
GAME.hornetImg.src = 'assets/hornet.png';

// ─── UTILS ───
function strToHex(str) {
    return Array.from(new TextEncoder().encode(str)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function hexToStr(hex) {
    try {
        const bytes = new Uint8Array(Math.ceil(hex.length / 2));
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        return new TextDecoder().decode(bytes);
    } catch(e) { return ''; }
}
function generateId() { return 'bee_' + Math.random().toString(36).substring(2, 8); }

async function fetchWithTimeout(url, opts = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(url, { ...opts, signal: controller.signal });
        clearTimeout(id);
        return res;
    } catch(e) {
        clearTimeout(id);
        throw e;
    }
}

async function apiSet(key, value) {
    try {
        await fetchWithTimeout(`${CONFIG.BASE_URL}/UpdateValue/${CONFIG.APP_KEY}/${key}/${value}`, { method: 'POST', mode: 'cors' });
    } catch(e) { console.warn('API set failed:', e); }
}

async function apiGet(key) {
    try {
        const res = await fetchWithTimeout(`${CONFIG.BASE_URL}/GetValue/${CONFIG.APP_KEY}/${key}?t=${Date.now()}`, { cache: 'no-store' });
        const text = await res.text();
        if (!text || text.includes('not found')) return null;
        return text.replace(/"/g, '').trim();
    } catch(e) { return null; }
}

function lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return a + diff * t;
}

// ─── INIT ───
function joinGame(isTeacher) {
    const nameInput = document.getElementById('playerName').value.trim();
    GAME.studentName = nameInput || (isTeacher ? 'Svärm-Ledare' : 'Biet');
    GAME.studentId = generateId();
    GAME.isTeacher = isTeacher;
    
    // Register self if teacher (to keep track of known students if needed, though we can just pull from game_state or a lobby list)
    // Actually, simple approach: teacher pulls all bees starting with "bee_" that updated recently.
    // For simplicity, the teacher can just fetch all "bee_*" keys? KeyValue API doesn't support wildcard search easily.
    // Instead, every student appends their ID to a "lobby" key.
    if (!isTeacher) {
        registerInLobby();
    } else {
        // Teacher resets lobby
        apiSet('lobby', GAME.studentId);
    }
    
    document.getElementById('loginScreen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'block';
        document.getElementById('gameHud').style.display = 'flex';
        document.getElementById('instructions').style.display = 'block';
        
        if (isTeacher) {
            document.getElementById('teacherStartBtn').style.display = 'block';
            document.getElementById('studentWaitMsg').style.display = 'none';
        } else {
            document.getElementById('teacherStartBtn').style.display = 'none';
            document.getElementById('studentWaitMsg').style.display = 'block';
        }

        startBeeGame();
    }, 500);
}

async function registerInLobby() {
    let lobby = await apiGet('lobby');
    if (!lobby) lobby = '';
    let ids = lobby.split(',').filter(id => id.length > 0);
    if (!ids.includes(GAME.studentId)) {
        ids.push(GAME.studentId);
        await apiSet('lobby', ids.join(','));
    }
}

function startBeeGame() {
    GAME.active = true;
    GAME.playing = false;
    GAME.lastTime = performance.now();
    GAME.victory = false;
    GAME.defeat = false;
    GAME.deadBees = new Set();
    GAME.initialBeeCount = 0;
    GAME.temperature = GAME.ambientTemp;
    GAME.hornet = { x: 0.5, y: 0.5, vx: 0, vy: 0, speed: 0.12, targetBee: null, chaseTimer: 0, heading: 0 };
    GAME.myBee = { x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6, heading: 0 };
    GAME.allBees.clear();
    GAME.bgStars = Array.from({ length: 60 }, () => ({
        x: Math.random(), y: Math.random(), r: 0.5 + Math.random() * 1.5, a: 0.2 + Math.random() * 0.4
    }));

    GAME.canvas = document.getElementById('gameCanvas');
    GAME.ctx = GAME.canvas.getContext('2d');
    resizeGameCanvas();
    window.addEventListener('resize', resizeGameCanvas);

    GAME.canvas.addEventListener('pointerdown', onGamePointerDown);
    GAME.canvas.addEventListener('pointermove', onGamePointerMove);
    GAME.canvas.addEventListener('pointerup', onGamePointerUp);
    GAME.canvas.addEventListener('pointercancel', onGamePointerUp);
    window.addEventListener('keydown', onGameKeyDown);
    window.addEventListener('keyup', onGameKeyUp);

    if (!GAME.isTeacher) {
        // STUDENT
        GAME.syncInterval = setInterval(async () => {
            if (!GAME.active) return;
            const posStr = `${GAME.myBee.x.toFixed(3)}_${GAME.myBee.y.toFixed(3)}_${(GAME.myBee.heading || 0).toFixed(2)}_${encodeURIComponent(GAME.studentName)}`;
            apiSet(`pos_${GAME.studentId}`, posStr);

            const gs = await apiGet('game_state');
            if (!gs) return;
            try {
                const decoded = hexToStr(gs);
                const sections = decoded.split('|');
                const header = sections[0].split(',');
                if (header.length >= 4) {
                    GAME.hornet.x = parseFloat(header[0]) || 0.5;
                    GAME.hornet.y = parseFloat(header[1]) || 0.5;
                    GAME.temperature = parseFloat(header[2]) || 25;
                    if (header[3] === '1' && !GAME.victory) showVictory();
                    if (header.length > 4 && header[4] === '1' && !GAME.defeat) showDefeat();
                    if (header.length > 5 && header[5]) {
                        GAME.deadBees = new Set(header[5].split(':'));
                    } else {
                        GAME.deadBees = new Set();
                    }
                    if (header.length > 6 && header[6] === '1' && !GAME.playing) {
                        startGamePlay();
                    }
                }
                GAME.allBees.clear();
                for (let i = 1; i < sections.length; i++) {
                    const bParts = sections[i].split(',');
                    if (bParts.length >= 4 && bParts[0] !== GAME.studentId) {
                        GAME.allBees.set(bParts[0], {
                            x: parseFloat(bParts[1]) || 0.5,
                            y: parseFloat(bParts[2]) || 0.5,
                            name: decodeURIComponent(bParts[3]),
                            heading: parseFloat(bParts[4]) || 0
                        });
                    }
                }
            } catch(e) {}
        }, 500);
    } else {
        // HOST / TEACHER
        GAME.syncInterval = setInterval(async () => {
            if (!GAME.active) return;
            // Fetch lobby
            let lobby = await apiGet('lobby');
            if (lobby) {
                let studentIds = lobby.split(',').filter(id => id.length > 0 && id !== GAME.studentId);
                const results = await Promise.all(studentIds.map(sid => apiGet(`pos_${sid}`).catch(() => null)));
                results.forEach((raw, i) => {
                    if (!raw) return;
                    const bParts = raw.split('_');
                    if (bParts.length >= 4) {
                        const x = parseFloat(bParts[0]), y = parseFloat(bParts[1]), heading = parseFloat(bParts[2]);
                        if (!isNaN(x) && !isNaN(y)) {
                            GAME.allBees.set(studentIds[i], { x, y, heading, name: decodeURIComponent(bParts[3]) });
                        }
                    }
                });
            }
            const deadStr = Array.from(GAME.deadBees).join(':');
            let stateStr = `${GAME.hornet.x.toFixed(3)},${GAME.hornet.y.toFixed(3)},${GAME.temperature.toFixed(1)},${GAME.victory ? '1' : '0'},${GAME.defeat ? '1' : '0'},${deadStr},${GAME.playing ? '1' : '0'}`;
            stateStr += `|${GAME.studentId},${GAME.myBee.x.toFixed(3)},${GAME.myBee.y.toFixed(3)},${encodeURIComponent(GAME.studentName)},${(GAME.myBee.heading || 0).toFixed(2)}`;
            GAME.allBees.forEach((bee, sid) => {
                stateStr += `|${sid},${bee.x.toFixed(3)},${bee.y.toFixed(3)},${encodeURIComponent(bee.name)},${(bee.heading || 0).toFixed(2)}`;
            });
            await apiSet('game_state', strToHex(stateStr));
        }, 600);
    }

    gameLoop();
}

function resizeGameCanvas() {
    if (!GAME.canvas) return;
    GAME.canvas.width = window.innerWidth;
    GAME.canvas.height = window.innerHeight;
}

function onGamePointerDown(e) { GAME.pointerDown = true; updatePointerTarget(e); }
function onGamePointerMove(e) { if (GAME.pointerDown) updatePointerTarget(e); }
function onGamePointerUp() { GAME.pointerDown = false; }
function updatePointerTarget(e) {
    if (!GAME.canvas) return;
    GAME.pointerTarget.x = e.clientX / GAME.canvas.width;
    GAME.pointerTarget.y = e.clientY / GAME.canvas.height;
}
function onGameKeyDown(e) {
    const k = e.key;
    if (['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k)) {
        e.preventDefault(); GAME.keysDown.add(k);
    }
}
function onGameKeyUp(e) { GAME.keysDown.delete(e.key); }

function startGamePlay() {
    const el = document.getElementById('instructions');
    if (el) el.style.display = 'none';
    GAME.playing = true;
}

function gameLoop() {
    if (!GAME.active) return;
    const now = performance.now();
    const dt = Math.min((now - GAME.lastTime) / 1000, 0.1);
    GAME.lastTime = now;

    if (GAME.playing) {
        updateBeeMovement(dt);
        if (GAME.isTeacher) { updateHornetAI(dt); updateTemperature(dt); }
    }
    renderGame();
    GAME.animFrame = requestAnimationFrame(gameLoop);
}

function updateBeeMovement(dt) {
    if (GAME.deadBees && GAME.deadBees.has(GAME.studentId)) return;

    const keys = GAME.keysDown;
    let kx = 0, ky = 0;
    if (keys.has('w') || keys.has('ArrowUp')) ky = -1;
    if (keys.has('s') || keys.has('ArrowDown')) ky = 1;
    if (keys.has('a') || keys.has('ArrowLeft')) kx = -1;
    if (keys.has('d') || keys.has('ArrowRight')) kx = 1;
    const hasKeyInput = kx !== 0 || ky !== 0;

    if (hasKeyInput && !GAME.victory) {
        const len = Math.sqrt(kx * kx + ky * ky);
        const move = GAME.beeSpeed * dt;
        GAME.myBee.x += (kx / len) * move;
        GAME.myBee.y += (ky / len) * move;
        GAME.myBee.heading = lerpAngle(GAME.myBee.heading, Math.atan2(ky, kx), 0.15);
    } else if (GAME.pointerDown && !GAME.victory) {
        const dx = GAME.pointerTarget.x - GAME.myBee.x;
        const dy = GAME.pointerTarget.y - GAME.myBee.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.005) {
            const move = Math.min(GAME.beeSpeed * dt, dist);
            GAME.myBee.x += (dx / dist) * move;
            GAME.myBee.y += (dy / dist) * move;
            GAME.myBee.heading = lerpAngle(GAME.myBee.heading, Math.atan2(dy, dx), 0.15);
        }
    }
    GAME.myBee.x = Math.max(0.02, Math.min(0.98, GAME.myBee.x));
    GAME.myBee.y = Math.max(0.02, Math.min(0.98, GAME.myBee.y));
}

function updateHornetAI(dt) {
    if (GAME.victory) return;
    const h = GAME.hornet;
    const bees = [{ x: GAME.myBee.x, y: GAME.myBee.y, id: GAME.studentId }];
    GAME.allBees.forEach((bee, sid) => bees.push({ x: bee.x, y: bee.y, id: sid }));

    if (bees.length === 0) return;
    const livingBees = bees.filter(b => !GAME.deadBees.has(b.id));
    if (livingBees.length === 0) return;

    h.chaseTimer -= dt;
    if (!h.targetBee || h.chaseTimer <= 0 || GAME.deadBees.has(h.targetBee)) {
        let nearest = null, nearestDist = Infinity;
        livingBees.forEach(b => {
            const dx = b.x - h.x, dy = b.y - h.y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < nearestDist) { nearestDist = d; nearest = b; }
        });
        const defenders = livingBees.filter(b => {
            const dx = b.x - h.x, dy = b.y - h.y;
            return Math.sqrt(dx * dx + dy * dy) < GAME.heatRadius * 1.5;
        });
        h.speed = defenders.length >= 3 ? 0.06 : 0.12;
        h.targetBee = nearest ? nearest.id : null;
        h.chaseTimer = GAME.chaseStickTime;
    }

    const target = livingBees.find(b => b.id === h.targetBee) || livingBees[0];
    if (target) {
        const dx = target.x - h.x, dy = target.y - h.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.01) { h.vx = (dx / dist) * h.speed; h.vy = (dy / dist) * h.speed; }
    }
    h.x += h.vx * dt; h.y += h.vy * dt;
    h.x = Math.max(0.03, Math.min(0.97, h.x));
    h.y = Math.max(0.03, Math.min(0.97, h.y));
    if (Math.abs(h.vx) > 0.001 || Math.abs(h.vy) > 0.001) h.heading = lerpAngle(h.heading, Math.atan2(h.vy, h.vx), 0.1);

    if (GAME.temperature < 42) {
        const eatRadius = 0.015;
        livingBees.forEach(b => {
            const dx = b.x - h.x, dy = b.y - h.y;
            if (Math.sqrt(dx * dx + dy * dy) < eatRadius) GAME.deadBees.add(b.id);
        });
    }

    const aliveCount = bees.length - GAME.deadBees.size;
    if (GAME.initialBeeCount === 0) GAME.initialBeeCount = Math.max(1, bees.length);
    if (GAME.initialBeeCount > 0 && GAME.deadBees.size > 0 && aliveCount < Math.max(3, GAME.initialBeeCount / 2)) {
        if (!GAME.defeat) showDefeat();
    }
}

function updateTemperature(dt) {
    if (GAME.victory) return;
    const h = GAME.hornet;
    let nearbyCount = 0;
    const bees = [{ id: GAME.studentId, x: GAME.myBee.x, y: GAME.myBee.y }];
    GAME.allBees.forEach((b, sid) => bees.push({ id: sid, x: b.x, y: b.y }));

    bees.forEach(b => {
        if (!GAME.deadBees.has(b.id)) {
            const dx = b.x - h.x, dy = b.y - h.y;
            if (Math.sqrt(dx * dx + dy * dy) < GAME.heatRadius) nearbyCount++;
        }
    });

    if (nearbyCount > 0) {
        const heatBonus = 1 + (nearbyCount - 1) * 0.5;
        GAME.temperature += GAME.heatRate * nearbyCount * heatBonus * dt;
    } else {
        GAME.temperature -= GAME.coolRate * dt;
    }
    GAME.temperature = Math.max(GAME.ambientTemp, Math.min(55, GAME.temperature));
    if (GAME.temperature >= GAME.lethalTemp) showVictory();
    updateTempHUD();
}

function updateTempHUD() {
    const fill = document.getElementById('tempFill');
    const text = document.getElementById('tempText');
    const status = document.getElementById('gameStatus');
    const pct = ((GAME.temperature - GAME.ambientTemp) / (GAME.lethalTemp - GAME.ambientTemp)) * 100;
    if (fill) fill.style.width = Math.min(100, pct) + '%';
    if (text) text.textContent = GAME.temperature.toFixed(1) + '°C';
    if (status) {
        if (GAME.defeat) status.textContent = 'SVÄRMEN ÄR BESEGRAD!';
        else if (GAME.temperature < 30) status.textContent = 'Samla bina runt getingen!';
        else if (GAME.temperature < 38) status.textContent = 'Temperaturen stiger! Håll er nära!';
        else if (GAME.temperature < 45) status.textContent = 'Nästan! Getingen är trängd!';
        else status.textContent = 'KRITISK TEMPERATUR!';
    }
}

function showVictory() {
    if (GAME.victory) return;
    GAME.victory = true;
    const div = document.createElement('div');
    div.className = 'vb-victory';
    div.innerHTML = `<h1>GETINGEN BESEGRADES!</h1><p>Temperaturen nådde ${GAME.temperature.toFixed(1)}°C — dödligt för Vespa mandarinia!</p><button class="vb-btn" style="max-width:300px" onclick="location.reload()">Spela igen</button>`;
    document.body.appendChild(div);
}
function showDefeat() {
    if (GAME.defeat) return;
    GAME.defeat = true;
    const div = document.createElement('div');
    div.className = 'vb-defeat';
    div.innerHTML = `<h1>SVÄRMEN KAN INTE STÅ EMOT</h1><p>Värmebollen kollapsade. Sammetsgetingen vann denna gång.</p><button class="vb-btn" style="max-width:300px" onclick="location.reload()">Försök igen</button>`;
    document.body.appendChild(div);
}

function renderGame() {
    const ctx = GAME.ctx;
    const W = GAME.canvas.width;
    const H = GAME.canvas.height;
    if (!ctx) return;

    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, W, H);

    const grd = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.6);
    grd.addColorStop(0, 'rgba(16, 48, 16, 0.3)');
    grd.addColorStop(1, 'rgba(5, 15, 5, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    GAME.bgStars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 230, 200, ${s.a * (0.5 + 0.5 * Math.sin(performance.now() / 2000 + s.x * 10))})`;
        ctx.fill();
    });

    const toX = (nx) => nx * W;
    const toY = (ny) => ny * H;
    const beeSize = Math.min(W, H) * 0.018;
    const hornetSize = Math.min(W, H) * 0.03;

    if (!GAME.victory) {
        const hr = GAME.heatRadius * Math.min(W, H);
        ctx.beginPath();
        ctx.arc(toX(GAME.hornet.x), toY(GAME.hornet.y), hr, 0, Math.PI * 2);
        const heatAlpha = Math.min(0.25, (GAME.temperature - 25) / 50);
        ctx.fillStyle = `rgba(239, 68, 68, ${heatAlpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.15 + heatAlpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    GAME.allBees.forEach((bee, sid) => {
        if (GAME.deadBees.has(sid)) ctx.globalAlpha = 0.3;
        drawBee(ctx, toX(bee.x), toY(bee.y), beeSize, bee.name, false, bee.heading || 0);
        ctx.globalAlpha = 1.0;
    });

    if (GAME.deadBees.has(GAME.studentId)) ctx.globalAlpha = 0.3;
    drawBee(ctx, toX(GAME.myBee.x), toY(GAME.myBee.y), beeSize * 1.1, GAME.studentName, true, GAME.myBee.heading);
    ctx.globalAlpha = 1.0;

    drawHornet(ctx, toX(GAME.hornet.x), toY(GAME.hornet.y), hornetSize);

    if (GAME.temperature > 30) {
        const glowRadius = hornetSize * (1 + (GAME.temperature - 30) / 15);
        const gradient = ctx.createRadialGradient(
            toX(GAME.hornet.x), toY(GAME.hornet.y), hornetSize * 0.3,
            toX(GAME.hornet.x), toY(GAME.hornet.y), glowRadius
        );
        gradient.addColorStop(0, `rgba(245, 158, 11, ${(GAME.temperature - 30) / 40})`);
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.beginPath();
        ctx.arc(toX(GAME.hornet.x), toY(GAME.hornet.y), glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    if (!GAME.isTeacher) updateTempHUD();
}

function drawBee(ctx, x, y, size, name, isMe, heading) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(heading);

    if (isMe) {
        const pulse = 1 + Math.sin(performance.now() / 150) * 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, size * 2.2 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI*2);
    ctx.fillStyle = '#eab308'; // Tailwind Yellow-500
    ctx.fill();

    if (isMe) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ef4444'; // Red ring
        ctx.stroke();
    }

    ctx.restore();

    if (name) {
        const fontSize = Math.max(10, size * 0.65);
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        const textWidth = ctx.measureText(name).width;
        const labelY = y + size * 1.6 + 5;
        
        ctx.fillStyle = isMe ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.4)';
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x - textWidth/2 - 6, labelY - fontSize, textWidth + 12, fontSize + 4, 4);
            ctx.fill();
            if (isMe) {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
        ctx.fillStyle = isMe ? '#ef4444' : 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(name, x, labelY);
    }
}

function drawHornet(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(GAME.hornet.heading || 0);
    
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI*2);
    ctx.fillStyle = '#f97316'; // Tailwind Orange-500
    ctx.fill();
    
    ctx.restore();

    ctx.font = `bold ${Math.max(11, size * 0.45)}px Inter, sans-serif`;
    ctx.fillStyle = '#f97316';
    ctx.textAlign = 'center';
    ctx.fillText('SAMMETSGETING', x, y + size + 16);
}
