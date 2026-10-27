import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from './store/redis.js';
import { store } from './store/roomStore.js';
import { withRoomLock } from './store/lock.js';
import * as sm from './game/stateMachine.js';
import { broadcast, enterPhase, step, startDeadlinePoller } from './game/controller.js';

const PORT = process.env.PORT || 4000;

const app = express();
const ORIGINS = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : '*';
app.use(cors({ origin: ORIGINS }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: ORIGINS },
    transports: ['websocket'],
});
io.adapter(createAdapter(pubClient, subClient));

const cleanName = (n) => String(n || '').trim().slice(0, 20) || 'Player';
const normCode = (c) => String(c || '').trim().toUpperCase();

async function createRoomWithUniqueCode(host) {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    for (let attempt = 0; attempt < 20; attempt++) {
        let code = '';
        for (let i = 0; i < 4; i++) code += letters[Math.floor(Math.random() * letters.length)];
        const room = sm.createRoom(code, host);
        if (await store.create(room)) return room;
    }
    throw new Error('Could not create a room, try again');
}

io.on('connection', (socket) => {
    const playerId = socket.handshake.auth?.playerId;
    if (!playerId) return socket.disconnect(true);
    socket.join(`player:${playerId}`);
    console.log(`[:${PORT}] connected ${playerId}`);

    const on = (event, handler) =>
        socket.on(event, async (payload = {}, ack = () => { }) => {
            try {
                const result = (await handler(payload)) ?? {};
                ack({ ok: true, ...result });
            } catch (err) {
                ack({ ok: false, error: err.message });
            }
        });

    // Lock the room, load fresh state, check the player belongs, then run fn(room)
    const inRoom = (code, fn) => {
        const c = normCode(code);
        return withRoomLock(c, async () => {
            const room = await store.get(c);
            if (!room) throw new Error('Room not found');
            if (!room.players[playerId]) throw new Error('You are not in this room');
            return fn(room);
        });
    };

    on('create_room', async ({ name }) => {
        const room = await createRoomWithUniqueCode({ id: playerId, name: cleanName(name) });
        socket.data.code = room.code;
        broadcast(io, room);
        return { code: room.code };
    });

    on('join_room', async ({ code, name }) => {
        const c = normCode(code);
        return withRoomLock(c, async () => {
            const room = await store.get(c);
            if (!room) throw new Error('Room not found');
            sm.addPlayer(room, { id: playerId, name: cleanName(name) });
            await store.set(room);
            socket.data.code = c;
            broadcast(io, room);
            return { code: c };
        });
    });

    on('rejoin', ({ code }) =>
        inRoom(code, async (room) => {
            room.players[playerId].connected = true;
            socket.data.code = room.code;
            await store.set(room);
            broadcast(io, room);
        })
    );

    on('start_game', ({ code }) =>
        inRoom(code, async (room) => {
            sm.startGame(room, playerId);
            await enterPhase(io, room);
        })
    );

    on('night_action', ({ code, targetId }) =>
        inRoom(code, async (room) => {
            sm.submitNightAction(room, playerId, targetId);
            if (sm.allNightActionsIn(room)) return step(io, room);
            await store.set(room);
            broadcast(io, room);
        })
    );

    on('vote', ({ code, targetId }) =>
        inRoom(code, async (room) => {
            sm.castVote(room, playerId, targetId);
            if (sm.allVotesIn(room)) return step(io, room);
            await store.set(room);
            broadcast(io, room);
        })
    );

    on('chat', async ({ code, text }) => {
        const room = await store.get(normCode(code)); // read-only, so no lock needed
        if (!room?.players[playerId]) throw new Error('You are not in this room');
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
        try {
            // the player may be connected on another tab or another server
            const remaining = await io.in(`player:${playerId}`).fetchSockets();
            if (remaining.length) return;
            await withRoomLock(code, async () => {
                const room = await store.get(code);
                if (!room?.players[playerId]) return;
                room.players[playerId].connected = false;
                await store.set(room);
                broadcast(io, room);
            });
        } catch (err) {
            console.error('disconnect handler:', err.message);
        }
    });
});

startDeadlinePoller(io);
server.listen(PORT, () => console.log(`Mafia server on :${PORT}`));