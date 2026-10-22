import { useEffect, useRef, useState } from 'react';
import { send } from '../socket.js';

export default function Chat({ game, messages }) {
    const [text, setText] = useState('');
    const bottom = useRef(null);

    useEffect(() => {
        bottom.current?.scrollIntoView();
    }, [messages]);

    const canChat =
        game.phase !== 'NIGHT' && (game.me.alive || game.phase === 'GAME_OVER');

    async function submit(e) {
        e.preventDefault();
        if (!text.trim()) return;
        await send('chat', { code: game.code, text });
        setText('');
    }

    return (
        <div className="card chat">
            <div className="messages">
                {messages.map((m, i) => (
                    <div key={i}>
                        <b>{m.from}:</b> {m.text}
                    </div>
                ))}
                <div ref={bottom} />
            </div>
            <form onSubmit={submit}>
                <input
                    value={text}
                    disabled={!canChat}
                    placeholder={canChat ? 'Say something...' : 'Chat is closed right now'}
                    onChange={(e) => setText(e.target.value)}
                />
            </form>
        </div>
    );
}