import { useState } from 'react';
import { send } from '../socket.js';

export default function Home({ onError }) {
    const [name, setName] = useState(sessionStorage.getItem('name') || '');
    const [code, setCode] = useState('');

    async function enter(event, payload) {
        if (!name.trim()) return onError('Enter your name first');
        sessionStorage.setItem('name', name);
        const res = await send(event, { name, ...payload });
        if (!res.ok) return onError(res.error);
        sessionStorage.setItem('roomCode', res.code);
    }

    return (
        <div className="card">
            <input
                placeholder="Your name"
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={() => enter('create_room', {})}>Create room</button>
            <hr />
            <input
                placeholder="Room code"
                value={code}
                maxLength={4}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <button onClick={() => enter('join_room', { code })}>Join room</button>
        </div>
    );
}