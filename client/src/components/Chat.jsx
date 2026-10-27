import { useEffect, useRef, useState } from 'react';
import { send } from '../socket.js';
import { SendIcon, MoonIcon, getAvatarColor } from './Icons.jsx';

const KNOWN_ROLES = ['MAFIA', 'DOCTOR', 'DETECTIVE', 'FRAMER', 'VILLAGER'];

export default function Chat({ game, messages }) {
    const [text, setText] = useState('');
    const bottom = useRef(null);

    useEffect(() => {
        bottom.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const canChat =
        game.phase !== 'NIGHT' && (game.me.alive || game.phase === 'GAME_OVER');

    async function submit(e) {
        e.preventDefault();
        if (!canChat || !text.trim()) return;
        await send('chat', { code: game.code, text });
        setText('');
    }

    // Helper to extract mention tags matching the screenshot
    function extractTags(msgText) {
        if (!msgText) return [];
        const lower = msgText.toLowerCase();
        const tags = [];

        // Check player names
        game.players.forEach((p) => {
            if (lower.includes(p.name.toLowerCase())) {
                tags.push({ label: p.name.toUpperCase(), type: 'player' });
            }
        });

        // Check roles
        KNOWN_ROLES.forEach((r) => {
            if (lower.includes(r.toLowerCase())) {
                tags.push({ label: 'ROLE', type: 'role-label' });
                tags.push({ label: r, type: r.toLowerCase() });
            }
        });

        return tags;
    }

    const placeholderText = canChat
        ? 'Say something...'
        : !game.me.alive && game.phase !== 'GAME_OVER'
        ? 'You are dead (chat disabled)'
        : 'Chat is closed right now';

    return (
        <div className="chat-panel-noir">
            {game.phase === 'NIGHT' ? (
                <div className="chat-closed">
                    <div className="chat-closed__icon"><MoonIcon size={28} /></div>
                    <div className="chat-closed__text">The town sleeps</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chat is closed during the night.</p>
                </div>
            ) : (
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '30px' }}>
                            No messages yet. Say something...
                        </p>
                    )}
                    {messages.map((m, i) => {
                        const tags = extractTags(m.text);
                        const isMafiaSender = game.me.role === 'MAFIA' && m.from === game.me.name;
                        const senderColor = isMafiaSender ? 'var(--neon-red)' : getAvatarColor(m.from);

                        return (
                            <div key={i} className="chat-row">
                                <div className="chat-row__content">
                                    <span className="chat-row__from" style={{ color: senderColor }}>
                                        {m.from}:
                                    </span>
                                    <span className="chat-row__text">{m.text}</span>
                                </div>
                                {tags.length > 0 && (
                                    <div className="chat-row__tags">
                                        {tags.map((t, idx) => (
                                            <span key={idx} className={`chat-pill chat-pill--${t.type}`}>
                                                {t.label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={bottom} />
                </div>
            )}

            <form className={`chat-bar ${!canChat ? 'chat-bar--disabled' : ''}`} onSubmit={submit}>
                <input
                    value={text}
                    disabled={!canChat}
                    placeholder={placeholderText}
                    onChange={(e) => setText(e.target.value)}
                    aria-label="Chat message"
                />
                <button
                    type="submit"
                    className="chat-bar__send"
                    disabled={!canChat || !text.trim()}
                    aria-label="Send message"
                >
                    <SendIcon size={14} />
                    <span>Send</span>
                </button>
            </form>
        </div>
    );
}