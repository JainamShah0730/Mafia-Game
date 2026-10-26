import { io } from 'socket.io-client';

const URLS = (process.env.URLS || 'http://localhost:4000,http://localhost:4001').split(',');
const ROOMS = Number(process.env.ROOMS || 20);
const PLAYERS = 5;
const GAME_TIMEOUT_MS = 180000;
const CONNECT_TIMEOUT_MS = 10000;
const RUN = Date.now();
const MAFIA_TEAM = ['MAFIA', 'FRAMER'];

const latencies = [];
const errors = {};
let finished = 0;
let timedOut = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// emit and measure how long the server takes to acknowledge
function emit(socket, event, payload) {
    const start = performance.now();
    return new Promise((resolve) => {
        socket.emit(event, payload, (res) => {
            latencies.push(performance.now() - start);
            if (!res?.ok) errors[res?.error] = (errors[res?.error] || 0) + 1;
            resolve(res);
        });
    });
}

function makeBot(id, onGameOver, url) {
    const socket = io(url, { auth: { playerId: id }, transports: ['websocket'] });
    let lastKey = '';

    socket.on('state', (s) => {
        if (s.phase === 'GAME_OVER') return onGameOver();
        if (!s.me?.alive) return;
        const key = `${s.round}:${s.phase}`;
        if (key === lastKey) return; // act once per phase
        const alive = s.players.filter((p) => p.alive);

        if (s.phase === 'NIGHT' && ['MAFIA', 'DOCTOR', 'DETECTIVE', 'FRAMER'].includes(s.me.role)) {
            let targets = alive.filter((p) => p.id !== s.me.id);
            if (MAFIA_TEAM.includes(s.me.role)) targets = alive.filter((p) => !MAFIA_TEAM.includes(p.role));
            if (s.me.role === 'DOCTOR') targets = alive;
            if (!targets.length) return;
            lastKey = key;
            emit(socket, 'night_action', { code: s.code, targetId: pick(targets).id });
        } else if (s.phase === 'VOTING') {
            lastKey = key;
            emit(socket, 'vote', { code: s.code, targetId: pick(alive).id });
        }
    });

    return socket;
}

async function runRoom(index) {
    let gameOver;
    const done = new Promise((r) => (gameOver = r));
    const sockets = Array.from({ length: PLAYERS }, (_, j) =>
        makeBot(`bot_${RUN}_${index}_${j}`, gameOver, URLS[(index + j) % URLS.length])
    );

    const connected = await Promise.race([
        Promise.all(sockets.map((s) => new Promise((r) => s.once('connect', r)))).then(() => true),
        sleep(CONNECT_TIMEOUT_MS).then(() => false),
    ]);
    if (!connected) {
        errors['could not connect'] = (errors['could not connect'] || 0) + 1;
        sockets.forEach((s) => s.close());
        return;
    }

    const created = await emit(sockets[0], 'create_room', { name: 'Bot0' });
    if (!created.ok) return sockets.forEach((s) => s.close());

    for (let j = 1; j < PLAYERS; j++) {
        await emit(sockets[j], 'join_room', { code: created.code, name: `Bot${j}` });
    }
    await emit(sockets[0], 'start_game', { code: created.code });

    const result = await Promise.race([
        done.then(() => 'done'),
        sleep(GAME_TIMEOUT_MS).then(() => 'timeout'),
    ]);
    if (result === 'done') finished++;
    else timedOut++;
    sockets.forEach((s) => s.close());
}

function percentile(sorted, p) {
    if (!sorted.length) return 0;
    return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

const started = Date.now();
console.log(`Starting ${ROOMS} rooms x ${PLAYERS} bots against ${URLS.join(', ')}`);

const jobs = [];
for (let i = 0; i < ROOMS; i++) {
    jobs.push(runRoom(i));
    // await sleep(50); // ramp up gradually instead of all at once
    await sleep(Number(process.env.RAMP_MS ?? 50));
}
await Promise.all(jobs);

const sorted = latencies.sort((a, b) => a - b);
console.log('\n--- results ---');
console.log(`rooms finished: ${finished}/${ROOMS} (timed out: ${timedOut})`);
console.log(`total time: ${((Date.now() - started) / 1000).toFixed(1)}s`);
console.log(`requests acknowledged: ${sorted.length}`);
console.log(
    `ack latency ms  p50: ${percentile(sorted, 50).toFixed(1)}  p95: ${percentile(sorted, 95).toFixed(1)}  p99: ${percentile(sorted, 99).toFixed(1)}  max: ${(sorted.at(-1) || 0).toFixed(1)}`
);
console.log('errors:', Object.keys(errors).length ? errors : 'none');
process.exit(0);