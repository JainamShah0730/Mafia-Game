import { useEffect, useState } from 'react';
import { send } from '../socket.js';
import Chat from './Chat.jsx';

const NIGHT_ROLES = ['MAFIA', 'DOCTOR', 'DETECTIVE', 'FRAMER'];
const MAFIA_TEAM = ['MAFIA', 'FRAMER'];
const PROMPT = {
    MAFIA: 'Choose someone to eliminate',
    DOCTOR: 'Choose someone to save',
    DETECTIVE: 'Choose someone to investigate',
    FRAMER: 'Choose someone to frame (the Detective will see them as Mafia tonight)',
};

function useCountdown(endsAt) {
    const [left, setLeft] = useState(0);
    useEffect(() => {
        if (!endsAt) {
            setLeft(0);
            return;
        }
        const tick = () => setLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
        tick();
        const t = setInterval(tick, 250);
        return () => clearInterval(t);
    }, [endsAt]);
    return left;
}

function logText(entry) {
    if (entry.type === 'NIGHT')
        return entry.killed ? `${entry.killed} was killed in the night.` : 'Nobody died last night.';
    return entry.eliminated
        ? `${entry.eliminated.name} was voted out. They were ${entry.eliminated.role}.`
        : 'The vote ended with no elimination.';
}

export default function Game({ game, messages, onError, onLeave }) {
    const { me, players, phase, code } = game;
    const left = useCountdown(game.phaseEndsAt);
    const alive = players.filter((p) => p.alive);
    const nameOf = (id) => players.find((p) => p.id === id)?.name ?? '?';

    async function act(event, targetId) {
        const res = await send(event, { code, targetId });
        if (!res.ok) onError(res.error);
    }

    const tally = {};
    Object.values(game.votes).forEach((t) => (tally[t] = (tally[t] || 0) + 1));

    function renderAction() {
        if (phase === 'GAME_OVER') {
            return (
                <>
                    <h2>{game.winner === 'MAFIA' ? '🔪 Mafia wins!' : '🏘️ Town wins!'}</h2>
                    <button onClick={onLeave}>Back to home</button>
                </>
            );
        }
        if (!me.alive) return <p>You are dead. Watch quietly...</p>;

        if (phase === 'NIGHT') {
            if (!NIGHT_ROLES.includes(me.role)) return <p>You sleep through the night... 😴</p>;
            if (me.hasActed) return <p>Action submitted. Waiting for the others...</p>;
            const targets = alive.filter((p) => {
                if (MAFIA_TEAM.includes(me.role)) return !MAFIA_TEAM.includes(p.role);
                if (me.role === 'DETECTIVE') return p.id !== me.id;
                return true;
            });
            return (
                <>
                    <p>{PROMPT[me.role]}</p>
                    {targets.map((p) => (
                        <button key={p.id} onClick={() => act('night_action', p.id)}>{p.name}</button>
                    ))}
                </>
            );
        }

        if (phase === 'DAY') {
            const inv = game.investigation;
            return (
                <>
                    <p>Discuss in the chat. Voting starts soon.</p>
                    {inv && (
                        <p className="result">
                            🔎 {nameOf(inv.targetId)} is {inv.isMafia ? 'MAFIA' : 'not Mafia'}.
                        </p>
                    )}
                </>
            );
        }

        if (phase === 'VOTING') {
            const myVote = game.votes[me.id];
            return (
                <>
                    <p>Vote to eliminate someone</p>
                    {alive.map((p) => (
                        <button
                            key={p.id}
                            className={myVote === p.id ? 'picked' : ''}
                            onClick={() => act('vote', p.id)}
                        >
                            {p.name} ({tally[p.id] || 0})
                        </button>
                    ))}
                    <button className={myVote === 'SKIP' ? 'picked' : ''} onClick={() => act('vote', 'SKIP')}>
                        Skip ({tally.SKIP || 0})
                    </button>
                </>
            );
        }
    }

    return (
        <div className="layout">
            <div>
                <div className="card">
                    <div className="header">
                        <span>Room {code} · Round {game.round}</span>
                        <span>{phase}{game.phaseEndsAt && ` · ${left}s`}</span>
                    </div>
                    <p>
                        Your role: <b>{me.role}</b> {!me.alive && '(dead)'}
                    </p>
                    {renderAction()}
                </div>

                <div className="card">
                    <b>Players</b>
                    <ul>
                        {players.map((p) => (
                            <li key={p.id} className={p.alive ? '' : 'dead'}>
                                {p.name}
                                {p.role && ` (${p.role})`}
                                {!p.connected && ' (offline)'}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card">
                    <b>Events</b>
                    {game.log.length === 0 && <p className="dim">Nothing yet.</p>}
                    {game.log.map((e, i) => (
                        <div key={i}>Round {e.round}: {logText(e)}</div>
                    ))}
                </div>
            </div>
            <Chat game={game} messages={messages} />
        </div>
    );
}