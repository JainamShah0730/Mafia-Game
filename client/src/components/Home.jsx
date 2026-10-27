import { useState, useRef, useEffect } from 'react';
import { send } from '../socket.js';

export default function Home({ onError }) {
    const [name, setName] = useState(sessionStorage.getItem('name') || '');
    const [codeChars, setCodeChars] = useState(['', '', '', '']);
    const codeRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    // Pre-fill room code from URL ?room=XXXX
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const room = params.get('room');
        if (room && room.length === 4) {
            setCodeChars(room.toUpperCase().split(''));
        }
    }, []);

    function handleCodeChange(index, value) {
        const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!clean) {
            const next = [...codeChars];
            next[index] = '';
            setCodeChars(next);
            return;
        }

        if (clean.length > 1) {
            const next = [...codeChars];
            const start = clean.length === 4 ? 0 : index;
            for (let i = 0; i < clean.length && start + i < 4; i++) {
                next[start + i] = clean[i];
            }
            setCodeChars(next);
            const nextFocus = Math.min(start + clean.length, 3);
            codeRefs[nextFocus].current?.focus();
            return;
        }

        const next = [...codeChars];
        next[index] = clean[0];
        setCodeChars(next);
        if (index < 3) {
            codeRefs[index + 1].current?.focus();
        }
    }

    function handleCodeKeyDown(index, e) {
        if (e.key === 'Backspace') {
            if (!codeChars[index] && index > 0) {
                const next = [...codeChars];
                next[index - 1] = '';
                setCodeChars(next);
                codeRefs[index - 1].current?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            codeRefs[index - 1].current?.focus();
        } else if (e.key === 'ArrowRight' && index < 3) {
            codeRefs[index + 1].current?.focus();
        }
    }

    function handleCodePaste(e, pasteIndex = 0) {
        e.preventDefault();
        const text = (e.clipboardData?.getData('text') || '')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 4);

        if (text.length > 0) {
            const next = [...codeChars];
            const start = text.length === 4 ? 0 : pasteIndex;
            for (let i = 0; i < text.length && start + i < 4; i++) {
                next[start + i] = text[i];
            }
            setCodeChars(next);
            const focusIdx = Math.min(start + text.length, 3);
            codeRefs[focusIdx].current?.focus();
        }
    }

    async function enter(event, payload) {
        if (!name.trim()) return onError('Enter your name first');
        sessionStorage.setItem('name', name);
        const res = await send(event, { name: name.trim(), ...payload });
        if (!res.ok) return onError(res.error);
        sessionStorage.setItem('roomCode', res.code);
    }

    const code = codeChars.join('');

    return (
        <div className="home fade-in">
            <div className="home__card glass">
                <h1 className="logo logo--hero">MAFIA</h1>
                <p className="home__tagline">Trust no one. Play with friends. Fight for your survival.</p>

                <div className="home__field">
                    <label htmlFor="home-name">Enter your name</label>
                    <input
                        id="home-name"
                        placeholder="Your name"
                        value={name}
                        maxLength={20}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <button
                    className="btn btn--red btn--block"
                    onClick={() => enter('create_room', {})}
                >
                    Create room
                </button>

                <div className="home__divider">
                    <span>or join a friend</span>
                </div>

                <div className="home__code-input" onPaste={(e) => handleCodePaste(e, 0)}>
                    {codeChars.map((ch, i) => (
                        <input
                            key={i}
                            ref={codeRefs[i]}
                            value={ch}
                            maxLength={4}
                            onChange={(e) => handleCodeChange(i, e.target.value)}
                            onKeyDown={(e) => handleCodeKeyDown(i, e)}
                            onPaste={(e) => handleCodePaste(e, i)}
                            aria-label={`Room code character ${i + 1}`}
                            autoComplete="off"
                        />
                    ))}
                </div>

                <button
                    className="btn btn--purple btn--block"
                    onClick={() => {
                        if (code.length < 4) return onError('Enter a 4-letter room code');
                        enter('join_room', { code });
                    }}
                >
                    Join room
                </button>
            </div>
        </div>
    );
}