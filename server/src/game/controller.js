import { store } from '../store/roomStore.js'
import * as sm from './stateMachine.js'


const timers = new Map();

export function broadcast(io, room) {
    for (const id of Object.keys(room.players)) {
        io.to(`player:${id}`).emit('state', sm.viewFor(room, id))
    }
}

export function clearTimers(code) {
    clearTimeout(timers.get(code))
    timers.delete(code)
}

export async function enterPhase(io, room) {
    clearTimers(room.code)
    const duration = sm.DURATIONS[room.phase]
    room.phaseEndsAt = duration ? Date.now() + duration : null
    await store.set(room)
    broadcast(io, room)

    if (!duration) return
    const { code, phase, round } = room
    timers.set(code, setTimeout(() => advance(io, code, phase, round), duration))
}

export async function advance(io, code, expectedPhase, expectedRound) {
    const room = await store.get(code)
    if (!room || room.phase !== expectedPhase || room.round !== expectedRound) return;

    if (room.phase === 'NIGHT') sm.resolveNight(room)
    else if (room.phase === 'DAY') sm.beginVoting(room)
    else if (room.phase === 'VOTING') sm.resolveVoting(room)

    await enterPhase(io, room)

}
