import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { store } from './store/roomStore.js';
import * as sm from './game/stateMachine.js';
import { broadcast, enterPhase, advance, clearTimers } from './game/controller.js';


const app = express()
app.use(cors())
app.get('/health', (req, res) => res.send('ok'))

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

const cleanName = (n) => String(n || '').trim().slice(0, 20) || 'Player'
const normCode = (c) => String(c || '').trim().toUpperCase()

async function uniqueCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    for (; ;) {
        let code = ''
        for (let i = 0; i < 4; i++) code += letters[Math.floor(Math.random() * letters.length)]
        if (!(await store.exists(code))) return code
    }
}

async function getRoomFor(code, playerId) {
    const room = await store.get(normCode(code))
    if (!room) throw new Error('Room not found ')
    if (!room.players[playerId]) throw new Error('You are not in this room ')
    return room
}

io.on('connection', (socket) => {
    const playerId = socket.handshake.auth?.playerId
    if (!playerId) return socket.disconnect(true)
    socket.join(`player:${playerId}`)

    const on = (event, handler) =>
        socket.on(event, async (payload = {}, ack = () => { }) => {
            try {
                const result = (await handler(payload)) ?? {}
                ack({ ok: true, ...result })
            } catch (err) {
                ack({ ok: false, error: err.message })
            }
        }
        )

    on('create_room', async ({ name }) => {
        const code = await uniqueCode()
        const room = sm.createRoom(code, { id: playerId, name: cleanName(name) })
        await store.set(room)
        socket.data.code = code
        broadcast(io, room)
        return { code }
    })

    on('join_room', async ({ code, name }) => {
        const room = await store.get(normCode(code))
        if (!room) throw new Error('Room not found')
        sm.addPlayer(room, { id: playerId, name: cleanName(name) })
        await store.set(room)
        socket.data.code = room.code
        broadcast(io, room)
        return { code: room.code }
    })

    on('rejoin', async ({ code }) => {
        const room = await getRoomFor(code, playerId)
        room.players[playerId].connected = true
        socket.data.code = room.code
        await store.set(room)
        broadcast(io, room)
    })

    on('start_game', async ({ code }) => {
        const room = await getRoomFor(code, playerId)
        sm.startGame(room, playerId)
        await enterPhase(io, room)
    })

    on('night_action', async ({ code, targetId }) => {
        const room = await getRoomFor(code, playerId)
        sm.submitNightAction(room, playerId, targetId)
        await store.set(room)
        if (sm.allNightActionsIn(room)) await advance(io, room.code, 'NIGHT', room.round)
        else broadcast(io, room)
    })

    on('vote', async ({ code, targetId }) => {
        const room = await getRoomFor(code, playerId);
        sm.castVote(room, playerId, targetId);
        await store.set(room);
        if (sm.allVotesIn(room)) await advance(io, room.code, 'VOTING', room.round);
        else broadcast(io, room);
    });

    on('chat', async ({ code, text }) => {
        const room = await getRoomFor(code, playerId);
        const me = room.players[playerId];
        const allowed = ['LOBBY', 'DAY', 'VOTING', 'GAME_OVER'].includes(room.phase);
        if (!allowed) throw new Error('No chatting at night');
        if (!me.alive && room.phase !== 'GAME_OVER') throw new Error('Dead players cannot chat');
        const msg = { from: me.name, text: String(text || '').slice(0, 200), at: Date.now() };
        for (const id of Object.keys(room.players)) io.to(`player:${id}`).emit('chat', msg);
    });

    socket.on('disconnect', async () => {
        const code = socket.data.code;
        if (!code) return;
        // the player may have another tab open, so only mark offline if no sockets remain
        const remaining = await io.in(`player:${playerId}`).fetchSockets();
        if (remaining.length) return;

        const room = await store.get(code);
        if (!room?.players[playerId]) return;
        room.players[playerId].connected = false;
        await store.set(room);
        broadcast(io, room);

        // clean up abandoned rooms so memory doesn't grow forever
        if (Object.values(room.players).every((p) => !p.connected)) {
            setTimeout(async () => {
                const r = await store.get(code);
                if (r && Object.values(r.players).every((p) => !p.connected)) {
                    clearTimers(code);
                    await store.delete(code);
                }
            }, 10 * 60 * 1000);
        }
    });

})

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Mafia server on :${PORT}`))
