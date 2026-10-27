import { useState, useCallback } from 'react';
import { send } from '../socket';
import Chat from './Chat.jsx';
import { CopyIcon, getAvatarColor } from './Icons.jsx';

// Role assignment logic mirrored from server/src/game/roles.js
function getRolesInPlay(count) {
    if (count < 4) {
        return [
            { role: 'MAFIA', label: 'Mafia', chip: 'chip--mafia' },
            { role: 'DOCTOR', label: 'Doctor', chip: 'chip--doctor' },
            { role: 'DETECTIVE', label: 'Detective', chip: 'chip--detective' },
            { role: 'VILLAGER', label: 'Villagers', chip: 'chip--villager' },
            { role: 'FRAMER', label: 'Framer (7+ players)', chip: 'chip--framer' },
        ];
    }
    const mafiaCount = Math.max(1, Math.floor(count / 4));
    const items = [];
    items.push({ role: 'MAFIA', label: `Mafia${mafiaCount > 1 ? ` x${mafiaCount}` : ''}`, chip: 'chip--mafia' });
    items.push({ role: 'DOCTOR', label: 'Doctor', chip: 'chip--doctor' });
    items.push({ role: 'DETECTIVE', label: 'Detective', chip: 'chip--detective' });
    if (count >= 7) {
        items.push({ role: 'FRAMER', label: 'Framer', chip: 'chip--framer' });
    } else {
        items.push({ role: 'FRAMER', label: 'Framer (7+ players)', chip: 'chip--framer' });
    }
    const specialCount = mafiaCount + 2 + (count >= 7 ? 1 : 0);
    const villagerCount = Math.max(0, count - specialCount);
    items.push({ role: 'VILLAGER', label: `Villagers${villagerCount > 0 ? ` x${villagerCount}` : ''}`, chip: 'chip--villager' });
    return items;
}

export default function Lobby({ game, messages, onError, onLeave }) {
    const isHost = game.hostId === game.me.id;
    const [copied, setCopied] = useState(false);
    const playerCount = game.players.length;
    const rolesList = getRolesInPlay(playerCount);

    async function start() {
        const res = await send('start_game', { code: game.code });
        if (!res.ok) onError(res.error);
    }

    const copyLink = useCallback(() => {
        const url = `${window.location.origin}${window.location.pathname}?room=${game.code}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    }, [game.code]);

    return (
        <div className="layout fade-in">
            <div className="layout__main">
                {/* Header with logo */}
                <div className="glass game-header">
                    <div className="game-header__left">
                        <h1 className="logo">MAFIA</h1>
                    </div>
                </div>

                {/* Room code */}
                <div className="glass lobby__code-section">
                    <div className="lobby__code-label">Room Code</div>
                    <div className="lobby__room-code">{game.code}</div>
                    <div className="copy-feedback">
                        <button className="btn btn--ghost btn--sm" onClick={copyLink}>
                            <CopyIcon size={14} />
                            Copy invite link
                        </button>
                        {copied && <span className="copy-feedback__tooltip">Copied!</span>}
                    </div>
                </div>

                {/* Players */}
                <div className="glass players-section">
                    <div className="section-title">Players ({playerCount}/12)</div>
                    <ul className="player-list">
                        {game.players.map((p) => {
                            const color = getAvatarColor(p.name);
                            const isOffline = !p.connected;
                            return (
                                <li
                                    key={p.id}
                                    className={`player-item${isOffline ? ' player-item--offline' : ''}`}
                                >
                                    <div
                                        className="player-avatar"
                                        style={{ borderColor: color, color }}
                                    >
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="player-name">{p.name}</span>
                                    {p.id === game.hostId && (
                                        <span className="player-chip chip--host">Host</span>
                                    )}
                                    {isOffline && (
                                        <span className="player-chip chip--offline">Offline</span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Roles in play card */}
                <div className="glass lobby__roles-card">
                    <div className="section-title">Roles in play</div>
                    <div className="lobby__roles-list">
                        {rolesList.map((r, idx) => (
                            <span
                                key={idx}
                                className={`lobby__role-chip ${r.chip}`}
                            >
                                {r.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="lobby__actions">
                    {isHost ? (
                        <div className="lobby__start-group">
                            <button
                                className="btn btn--red"
                                onClick={start}
                                disabled={playerCount < 4}
                            >
                                Start game
                            </button>
                            {playerCount < 4 && (
                                <div className="lobby__need-more">
                                    Need {4 - playerCount} more player{4 - playerCount > 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="lobby__waiting">Waiting for the host to start...</p>
                    )}
                    <button className="btn btn--ghost" onClick={onLeave}>
                        Leave room
                    </button>
                </div>
            </div>

            {/* Chat */}
            <div className="layout__aside">
                <Chat game={game} messages={messages} />
            </div>
        </div>
    );
}