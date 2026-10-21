import { assignRoles, MIN_PLAYERS, MAX_PLAYERS, NIGHT_ROLES } from "./roles.js";
import { checkWin } from "./rules.js";


export const DURATIONS = { NIGHT: 30000, DAY: 30000, VOTING: 30000 }

const newPlayer = ({ id, name }) => ({
    id, name, role: null, alive: true, connected: true,
})

export function createRoom(code, host) {
    return {
        code,
        hostId: host.id,
        phase: 'LOBBY',
        round: 0,
        phaseEndsAt: null,
        players: { [host.id]: newPlayer(host) },
        nightActions: {},
        votes: {},
        investigation: null,
        winner: null,
        log: [],
    }
}

export function addPlayer(room, player) {
    if (room.players[player.id]) {
        room.players[player.id].connected = true;
        return room;
    }
    if (room.phase !== 'LOBBY') throw new Error('Game already started');
    if (Object.keys(room.players).length >= MAX_PLAYERS) throw new Error("Room is full")
    room.players[player.id] = newPlayer(player)
    return room;
}

export function startGame(room, requesterId) {
    if (room.hostId !== requesterId) throw new Error("Only the host can start")
    if (room.phase !== 'LOBBY') throw new Error("Game already started")
    const ids = Object.keys(room.players)
    if (ids.length < MIN_PLAYERS) throw new Error(`Need At least ${MIN_PLAYERS} players`)
    const roles = assignRoles(ids.length)
    ids.forEach((id, i) => (room.players[id].role = roles[i]))
    return beginNight(room)
}

export function beginNight(room) {
    room.phase = 'NIGHT'
    room.round += 1;
    room.nightActions = {}
    room.votes = {}
    room.investigation = null
    return room
}

export function submitNightAction(room, actorId, targetId) {
    if (room.phase !== 'NIGHT') throw new Error('It is not night')
    const actor = room.players[actorId]
    const target = room.players[targetId]
    if (!actor?.alive) throw new Error('You cannot act')
    if (!NIGHT_ROLES.includes(actor.role)) throw new Error('Your role has no night action')
    if (!target?.alive) throw new Error('Invalid target')
    if (actor.role === 'MAFIA' && target.role === 'MAFIA') {
        throw new Error('You cannot target your own team')
    }
    room.nightActions[actorId] = targetId
    return room
}

export function allNightActionsIn(room) {
    return Object.values(room.players)
        .filter((p) => p.alive && NIGHT_ROLES.includes(p.role))
        .every((p) => p.id in room.nightActions)
}

export function resolveNight(room) {
    const mafiaTally = {}
    let savedId = null

    for (const [actorId, targetId] of Object.entries(room.nightActions)) {
        const role = room.players[actorId].role
        if (role === 'MAFIA') mafiaTally[targetId] = (mafiaTally[targetId] || 0) + 1
        if (role === 'DOCTOR') savedId = targetId
        if (role === 'DETECTIVE') {
            room.investigation = {
                detectiveId: actorId,
                targetId,
                isMafia: room.players[targetId].role === 'MAFIA',
            }
        }
    }

    const top = Object.entries(mafiaTally).sort((a, b) => b[1] - a[1])[0]
    let KilledName = null
    if (top && top[0] !== savedId) {
        room.players[top[0]].alive = false
        KilledName = room.players[top[0]].name
    }
    room.log.push({ round: room.round, type: 'NIGHT', killed: KilledName })

    const winner = checkWin(room)
    if (winner) return endGame(room, winner)
    room.phase = 'DAY'
    return room
}

export function beginVoting(room) {
    room.phase = 'VOTING'
    room.votes = {}
    return room;
}

export function castVote(room, voterId, targetId) {
    if (room.phase !== 'VOTING') throw new Error('It is not voting time')
    if (!room.players[voterId]?.alive) throw new Error('Dead players cannot vote')
    if (targetId !== 'SKIP' && !room.players[targetId]?.alive) throw new Error("Invalid target")
    room.votes[voterId] = targetId
    return room
}

export function allVotesIn(room) {
    return Object.values(room.players)
        .filter((p) => p.alive)
        .every((p) => p.id in room.votes)
}

export function resolveVoting(room) {
    const tally = {}
    for (const target of Object.values(room.votes)) {
        if (target !== 'SKIP') tally[target] = (tally[target] || 0) + 1
    }

    const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1])
    const tie = ranked.length > 1 && ranked[0][1] === ranked[1][1]

    let eliminated = null
    if (ranked.length && !tie) {
        const p = room.players[ranked[0][0]]
        p.alive = false
        eliminated = { name: p.name, role: p.role }
    }
    room.log.push({ round: room.round, type: 'VOTE', eliminated })

    const winner = checkWin(room)
    if (winner) return endGame(room, winner)
    return beginNight(room)
}

function endGame(room, winner) {
    room.phase = 'GAME_OVER'
    room.winner = winner
    return room
}

export function viewFor(room, viewerId) {
    const me = room.players[viewerId]
    const reveal = room.phase === 'GAME_OVER'
    const inv = room.investigation

    return {
        code: room.code,
        hostId: room.hostId,
        phase: room.phase,
        round: room.round,
        phaseEndsAt: room.phaseEndsAt,
        winner: room.winner,
        log: room.log,
        votes: room.phase === 'VOTING' ? room.votes : {},
        me: me
            ? { id: me.id, role: me.role, alive: me.alive, hasActed: viewerId in room.nightActions }
            : null,
        players: Object.values(room.players).map((p) => ({
            id: p.id,
            name: p.name,
            connected: p.connected,
            role:
                reveal || p.id === viewerId || (me?.role === 'MAFIA' && p.role === 'MAFIA')
                    ? p.role
                    : null,
        })),
        investigation: room.phase === 'DAY' && inv?.detectiveId === viewerId
            ? { targetId: inv.targetId, isMafia: inv.isMafia }
            : null,
    }
}