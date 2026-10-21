import { io } from 'socket.io-client';

const URL = 'http://localhost:4000';
const names = ['Ava', 'Ben', 'Cy', 'Dee', 'Eli'];
const sockets = names.map((n) => io(URL, { auth: { playerId: 'p_' + n } }));
const states = {};
sockets.forEach((s, i) => s.on('state', (st) => (states[i] = st)));

const emit = (s, ev, payload) => new Promise((res) => s.emit(ev, payload, res));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await sleep(500);
const created = await emit(sockets[0], 'create_room', { name: names[0] });
console.log('create:', created);
const code = created.code;
for (let i = 1; i < names.length; i++) {
    console.log('join', names[i], await emit(sockets[i], 'join_room', { code, name: names[i] }));
}
console.log('start:', await emit(sockets[0], 'start_game', { code }));
await sleep(500);

names.forEach((n, i) => {
    const st = states[i];
    console.log(n, '| phase:', st.phase, '| my role:', st.me.role);
});

// try an illegal action: voting during the night should fail
console.log('bad vote:', await emit(sockets[1], 'vote', { code, targetId: 'p_Ava' }));

sockets.forEach((s) => s.close());