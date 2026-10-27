import { useEffect, useState } from 'react';
import { send } from '../socket.js';
import Chat from './Chat.jsx';
import {
    SkullIcon, SearchIcon, FrameIcon, UserIcon,
    StopwatchIcon, FedoraIcon, RibbonBadgeIcon,
    MobsterSilhouette, DetectiveSilhouette, DoctorSilhouette, VillagerSilhouette,
    HomeIcon, PlusIcon, getAvatarColor,
    CoffinIcon, ScalesIcon, HandshakeIcon,
} from './Icons.jsx';

/* ---- Constants ---- */
const NIGHT_ROLES = ['MAFIA', 'DOCTOR', 'DETECTIVE', 'FRAMER'];
const MAFIA_TEAM = ['MAFIA', 'FRAMER'];

const PROMPTS = {
    VOTING: 'Vote to eliminate someone',
    NIGHT_MAFIA: 'Vote to eliminate someone',
    NIGHT_DOCTOR: 'Choose someone to save',
    NIGHT_DETECTIVE: 'Choose someone to investigate',
    NIGHT_FRAMER: 'Choose someone to frame',
    NIGHT_VILLAGER: 'The town sleeps. Wait for sunrise.',
    DAY: 'Discuss in the chat. Voting starts soon.',
};

const ACTION_VERBS = {
    MAFIA: 'Eliminate',
    DOCTOR: 'Protect',
    DETECTIVE: 'Investigate',
    FRAMER: 'Frame',
};

/* ---- Countdown hook ---- */
function useCountdown(endsAt) {
    const [left, setLeft] = useState(0);
    useEffect(() => {
        if (!endsAt) { setLeft(0); return; }
        const tick = () => setLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
        tick();
        const t = setInterval(tick, 250);
        return () => clearInterval(t);
    }, [endsAt]);
    return left;
}

/* ---- Log entry text matching reference ---- */
function logText(entry) {
    if (entry.type === 'NIGHT') {
        return entry.killed ? `${entry.killed} was killed last night.` : 'Nobody died last night.';
    }
    return entry.eliminated
        ? `${entry.eliminated.name} was voted out. They were ${entry.eliminated.role}.`
        : 'The vote ended with no elimination.';
}

export default function Game({ game, messages, onError, onLeave }) {
    const { me, players, phase, code } = game;
    const left = useCountdown(game.phaseEndsAt);
    const alive = players.filter((p) => p.alive);
    const nameOf = (id) => players.find((p) => p.id === id)?.name ?? '?';
    const [selectedTarget, setSelectedTarget] = useState(null);

    // Reset selection on phase change
    useEffect(() => { setSelectedTarget(null); }, [phase, game.round]);

    async function act(event, targetId) {
        const res = await send(event, { code, targetId });
        if (!res.ok) onError(res.error);
    }

    // Vote tally
    const tally = {};
    Object.values(game.votes).forEach((t) => (tally[t] = (tally[t] || 0) + 1));

    // Determine prompt for the role action card
    let promptText = PROMPTS.DAY;
    if (phase === 'VOTING') {
        promptText = PROMPTS.VOTING;
    } else if (phase === 'NIGHT') {
        if (me.role === 'MAFIA') promptText = PROMPTS.NIGHT_MAFIA;
        else if (me.role === 'DOCTOR') promptText = PROMPTS.NIGHT_DOCTOR;
        else if (me.role === 'DETECTIVE') promptText = PROMPTS.NIGHT_DETECTIVE;
        else if (me.role === 'FRAMER') promptText = PROMPTS.NIGHT_FRAMER;
        else promptText = PROMPTS.NIGHT_VILLAGER;
    }

    // Role-dependent artwork, badge, and gradient class
    const roleKey = (me.role || 'villager').toLowerCase();
    function renderRoleArtwork() {
        if (me.role === 'MAFIA' || me.role === 'FRAMER') {
            return <MobsterSilhouette className="role-action-card__silhouette" />;
        }
        if (me.role === 'DETECTIVE') {
            return <DetectiveSilhouette className="role-action-card__silhouette" />;
        }
        if (me.role === 'DOCTOR') {
            return <DoctorSilhouette className="role-action-card__silhouette" />;
        }
        return <VillagerSilhouette className="role-action-card__silhouette" />;
    }

    function renderRoleBadge() {
        if (me.role === 'MAFIA' || me.role === 'FRAMER') {
            return <RibbonBadgeIcon size={38} />;
        }
        if (me.role === 'DETECTIVE') {
            return <SearchIcon size={26} className="role-badge-icon--detective" />;
        }
        if (me.role === 'DOCTOR') {
            return <PlusIcon size={26} className="role-badge-icon--doctor" />;
        }
        return <UserIcon size={26} className="role-badge-icon--villager" />;
    }

    // Target icon for night action buttons
    function renderNightTargetIcon() {
        if (me.role === 'DETECTIVE') return <SearchIcon size={13} />;
        if (me.role === 'DOCTOR') return <PlusIcon size={13} />;
        if (me.role === 'FRAMER') return <FrameIcon size={13} />;
        return <SkullIcon size={13} />; // Mafia
    }

    // Right-side badge for player list: ONLY role-specific when player.role is non-null
    function renderPlayerListBadge(p) {
        if (p.role) {
            const r = p.role.toUpperCase();
            if (r === 'MAFIA' || r === 'FRAMER') {
                return <FedoraIcon size={16} className="player-badge-mafia" />;
            }
            if (r === 'DETECTIVE') {
                return <SearchIcon size={16} className="player-badge-detective" />;
            }
            if (r === 'DOCTOR') {
                return <PlusIcon size={16} className="player-badge-doctor" />;
            }
            if (r === 'VILLAGER') {
                return <UserIcon size={16} className="player-badge-villager" />;
            }
        }
        if (!p.alive) {
            return <SkullIcon size={14} className="player-badge-dead" />;
        }
        return <UserIcon size={16} className="player-badge-neutral" />;
    }

    /* ---- GAME OVER SCREEN ---- */
    if (phase === 'GAME_OVER') {
        return (
            <div className="slide-up" style={{ flex: 1 }}>
                <div className="game-over">
                    <h2 className={`game-over__title game-over__title--${game.winner === 'MAFIA' ? 'mafia' : 'town'}`}>
                        {game.winner === 'MAFIA' ? 'MAFIA WINS' : 'TOWN WINS'}
                    </h2>
                    <p className="game-over__subtitle">
                        {game.winner === 'MAFIA'
                            ? 'The Mafia have seized the town. Have fun seeing everyone\'s real roles.'
                            : 'The town triumphed over evil. Justice prevails!'}
                    </p>
                </div>

                <div className="glass revealed-roles">
                    <div className="section-title">Revealed Roles</div>
                    <div className="revealed-grid">
                        {players.map((p) => (
                            <div key={p.id} className="revealed-player">
                                <div
                                    className="player-avatar"
                                    style={{ borderColor: getAvatarColor(p.name), width: 32, height: 32, fontSize: '0.75rem' }}
                                >
                                    {p.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="revealed-player__name">{p.name}</div>
                                    <span className={`player-chip chip--${(p.role || 'villager').toLowerCase()}`}>
                                        {p.role}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="game-over__actions">
                    <button className="btn btn--red" onClick={onLeave}>
                        <HomeIcon size={14} /> Play again
                    </button>
                    <button className="btn btn--ghost" onClick={onLeave}>
                        Back to home
                    </button>
                </div>
            </div>
        );
    }

    const myVote = game.votes[me.id];

    return (
        <div className="noir-layout fade-in">
            {/* Left Column: Game controls & info */}
            <div className="noir-main">
                {/* Timer bar across the top that shrinks with countdown */}
                {game.phaseEndsAt && (
                    <div className="noir-timer-bar">
                        <div
                            className={`noir-timer-bar__fill noir-timer-bar__fill--${phase.toLowerCase()}`}
                            style={{ width: `${Math.min(100, Math.max(0, (left / 30) * 100))}%` }}
                        />
                    </div>
                )}

                {/* Topbar: MAFIA title + room/round + countdown */}
                <div className="noir-topbar">
                    <h1 className="noir-logo">MAFIA</h1>
                    <div className="noir-topbar__sub">
                        <span className="noir-topbar__room">
                            ROOM: {code} &bull; ROUND {game.round}
                        </span>
                        <span className="noir-topbar__timer">
                            <StopwatchIcon size={16} />
                            <span>{phase} &bull; {left}s</span>
                        </span>
                    </div>
                </div>

                {/* Role Banner & Action Card */}
                <div className={`role-action-card role-action-card--${roleKey}`}>
                    <div className="role-action-card__top">
                        <div className="role-action-card__badge">
                            {renderRoleBadge()}
                        </div>
                        <div className="role-action-card__info">
                            <div className="role-action-card__role">
                                YOUR ROLE: <span className={`role-action-card__rolename role-action-card__rolename--${roleKey}`}>{me.role}</span>
                            </div>
                            <div className="role-action-card__sub">{promptText}</div>
                        </div>
                        {renderRoleArtwork()}
                    </div>

                    {/* Investigation info if Detective in DAY */}
                    {phase === 'DAY' && game.investigation && (
                        <div className="investigation-pill">
                            <SearchIcon size={14} />
                            <span>
                                <strong>{nameOf(game.investigation.targetId)}</strong> is{' '}
                                <span className={game.investigation.isMafia ? 'investigation-mafia' : 'investigation-clear'}>
                                    {game.investigation.isMafia ? 'Mafia' : 'not Mafia'}
                                </span>
                            </span>
                        </div>
                    )}

                    {/* Voting Pills in VOTING Phase */}
                    {phase === 'VOTING' && (
                        <div className="role-action-card__pills">
                            {alive.map((p) => {
                                const isSelected = myVote === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        className={`vote-pill-noir vote-pill-noir--purple ${isSelected ? 'vote-pill-noir--selected-red' : ''}`}
                                        onClick={() => act('vote', p.id)}
                                    >
                                        <span>{p.name} ({tally[p.id] || 0})</span>
                                        <span className="vote-pill-noir__icon">
                                            <SkullIcon size={13} />
                                        </span>
                                    </button>
                                );
                            })}
                            <button
                                className={`vote-pill-noir vote-pill-noir--purple ${myVote === 'SKIP' ? 'vote-pill-noir--selected-red' : ''}`}
                                onClick={() => act('vote', 'SKIP')}
                            >
                                <span>Skip ({tally.SKIP || 0})</span>
                            </button>
                        </div>
                    )}

                    {/* Night Action Pills in NIGHT Phase */}
                    {phase === 'NIGHT' && NIGHT_ROLES.includes(me.role) && !me.hasActed && (
                        <div className="role-action-card__pills">
                            {alive
                                .filter((p) => {
                                    if (MAFIA_TEAM.includes(me.role)) return !MAFIA_TEAM.includes(p.role);
                                    if (me.role === 'DETECTIVE') return p.id !== me.id;
                                    return true;
                                })
                                .map((p) => {
                                    const isSelected = selectedTarget === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            className={`vote-pill-noir vote-pill-noir--purple ${isSelected ? 'vote-pill-noir--selected-purple' : ''}`}
                                            onClick={() => setSelectedTarget(isSelected ? null : p.id)}
                                        >
                                            <span>{p.name}</span>
                                            <span className="vote-pill-noir__icon">
                                                {renderNightTargetIcon()}
                                            </span>
                                        </button>
                                    );
                                })}
                            {selectedTarget && (
                                <button
                                    className="btn btn--purple confirm-night-btn"
                                    onClick={() => { act('night_action', selectedTarget); setSelectedTarget(null); }}
                                >
                                    {ACTION_VERBS[me.role]} {nameOf(selectedTarget)}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Players Section (2-column grid matching reference image) */}
                <div className="noir-card players-card">
                    <h3 className="noir-card__title">Players</h3>
                    <div className="players-grid-noir">
                        {players.map((p) => {
                            const isMe = p.id === me.id;
                            const isDead = !p.alive;
                            const isMafiaTeam = MAFIA_TEAM.includes(me.role) && MAFIA_TEAM.includes(p.role);
                            const isHighlighted = (isMe && me.role === 'MAFIA') || isMafiaTeam;
                            const avatarColor = getAvatarColor(p.name);

                            return (
                                <div
                                    key={p.id}
                                    className={`player-item-noir ${isHighlighted ? 'player-item-noir--highlight' : ''} ${isDead ? 'player-item-noir--dead' : ''}`}
                                >
                                    {/* Left Avatar: Stable per player name */}
                                    <div
                                        className="player-avatar-noir"
                                        style={{ borderColor: avatarColor, color: avatarColor }}
                                    >
                                        <UserIcon size={16} />
                                    </div>

                                    {/* Player Name */}
                                    <span className={`player-item-noir__name ${isHighlighted ? 'player-item-noir__name--mafia' : ''}`}>
                                        {p.name}
                                        {isHighlighted && ' (MAFIA)'}
                                    </span>

                                    {/* Right Badge: ONLY role-specific when p.role is non-null */}
                                    <div className="player-item-noir__badge">
                                        {renderPlayerListBadge(p)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Events Log (matching reference image) */}
                <div className="noir-card events-card">
                    <h3 className="noir-card__title">Events</h3>
                    <div className="events-list-noir">
                        {game.log.length === 0 ? (
                            <div className="event-item-noir event-item-noir--highlight">
                                <span className="event-item-noir__icon"><CoffinIcon size={14} /></span>
                                <span className="event-item-noir__text">Nobody died last night.</span>
                            </div>
                        ) : (
                            [...game.log].reverse().map((e, i) => {
                                const isNight = e.type === 'NIGHT';
                                const isHighlight = i === 0 && isNight; // latest night event highlighted in red strip

                                let IconComp = ScalesIcon;
                                if (isNight) {
                                    IconComp = e.killed ? CoffinIcon : HandshakeIcon;
                                }

                                return (
                                    <div
                                        key={i}
                                        className={`event-item-noir ${isHighlight ? 'event-item-noir--highlight' : ''}`}
                                    >
                                        <span className="event-item-noir__icon">
                                            <IconComp size={14} />
                                        </span>
                                        <span className="event-item-noir__text">
                                            Round {e.round}: {logText(e)}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Chat panel */}
            <div className="noir-aside">
                <Chat game={game} messages={messages} />
            </div>
        </div>
    );
}