import { redis } from '../store/redis.js';
import { store } from '../store/roomStore.js';
import { withRoomLock } from '../store/lock.js';
import * as sm from './stateMachine.js';

const DEADLINES = 'deadlines'; // sorted set: member = room code, score = when the phase ends
const BATCH = Number(process.env.POLL_BATCH || 200); // rooms advanced per tick
const JITTER_MS = Number(process.env.JITTER_MS || 0); // random extra delay per phase, spreads out bursts
console.log(`poller config: batch=${BATCH} jitter=${JITTER_MS}ms`);
export function broadcast(io, room) {
    for (const id of Object.keys(room.players)) {
        io.to(`player:${id}`).emit('state', sm.viewFor(room, id));
    }
}

// The caller must hold the room lock.
export async function enterPhase(io, room) {
    const duration = sm.DURATIONS[room.phase];
    // room.phaseEndsAt = duration ? Date.now() + duration : null;
    room.phaseEndsAt = duration ? Date.now() + duration + Math.random() * JITTER_MS : null;
    await store.set(room);
    if (room.phaseEndsAt) await redis.zadd(DEADLINES, room.phaseEndsAt, room.code);
    else await redis.zrem(DEADLINES, room.code);
    broadcast(io, room);
}

// Move to the next phase. The caller must hold the room lock.
export async function step(io, room) {
    if (room.phase === 'NIGHT') sm.resolveNight(room);
    else if (room.phase === 'DAY') sm.beginVoting(room);
    else if (room.phase === 'VOTING') sm.resolveVoting(room);
    else return;
    await enterPhase(io, room);
}

// Every server runs this. Whoever gets the lock first advances the room;
// the others see the new deadline and skip it. No server owns a room's timer,
// so a crashed server cannot freeze a game.
export function startDeadlinePoller(io) {
    setInterval(async () => {
        try {
            const due = await redis.zrangebyscore(DEADLINES, 0, Date.now(), 'LIMIT', 0, BATCH);
            for (const code of due) {
                await withRoomLock(code, async () => {
                    const room = await store.get(code);
                    if (!room) return redis.zrem(DEADLINES, code);
                    if (!room.phaseEndsAt || room.phaseEndsAt > Date.now()) return; // already advanced
                    await step(io, room);
                }).catch(() => { }); // room busy: try again next tick
            }
        } catch (err) {
            console.error('deadline poller:', err.message);
        }
    }, 1000);
}