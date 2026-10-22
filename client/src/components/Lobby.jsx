import { send } from '../socket'
import Chat from './Chat.jsx'

export default function Lobby({ game, messages, onError, onLeave }) {
    const isHost = game.hostId === game.me.id

    async function start() {
        const res = await send('start_game', { code: game.code })
        if (!res.ok) onError(res.error)

    }

    return (
        <div className='layout'>
            <div className='card'>
                <p>Room code</p>
                <div className='code'>{game.code}</div>
                <p>Players({game.players.length}/12)</p>
                <ul>
                    {game.players.map((p) => (
                        <li key={p.id} className={p.connected ? '' : 'dim'}>
                            {p.name} {p.id === game.hostId && '👑'} {!p.connected && '(offline)'}
                        </li>
                    ))}
                </ul>
                {isHost ? (
                    <button onClick={start}> Start game (min 4 players)</button>
                ) : (

                    <p className='dim'>Waiting for the host to start...</p>
                )}
                <button className='secondary' onClick={onLeave}>Leave</button>
            </div>
            <Chat game={game} messages={messages} />
        </div>
    )
}