import { io } from 'socket.io-client'

function getPlayerId() {
    let id = sessionStorage.getItem('playerId')
    if (!id) {
        id = 'p_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
        sessionStorage.setItem('playerId', id)
    }
    return id
}

export const playerId = getPlayerId()

const URL = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:4000`
export const socket = io(URL, { auth: { playerId } })

export const send = (event, payload) =>
    new Promise((resolve) => socket.emit(event, payload, resolve))