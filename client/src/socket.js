import { io } from 'socket.io-client'

function getPlayerId() {
    let id = sessionStorage.getItem('playerId')
    if (!id) {
        id = 'p_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
        sessionStorage.setItem('playerId', id)
    }
    return id
}

const params = new URLSearchParams(window.location.search);
const port = params.get('port') || 4000;
const URL = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:${port}`;

export const socket = io(URL, {
    auth: { playerId: getPlayerId() },
    transports: ['websocket'],
});

export function send(event, payload = {}) {
    return new Promise((resolve) => {
        socket.emit(event, payload, (res) => {
            resolve(res || { ok: false, error: 'No response from server' });
        });
    });
}