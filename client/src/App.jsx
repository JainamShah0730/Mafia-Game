import { useEffect, useState } from "react";
import { socket, send } from './socket.js'
import Home from './components/Home.jsx'
import Lobby from './components/Lobby.jsx'
import Game from './components/Game.jsx'

export default function App() {
  const [game, setGame] = useState(null)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')

  const showError = (msg) => {
    setError(msg)
    setTimeout(() => setError(''), 4000)
  }

  const leave = () => {
    sessionStorage.removeItem('roomCode')
    setGame(null)
    setMessages([])
  }

  useEffect(() => {
    const onState = (s) => setGame(s)
    const onChat = (m) => setMessages((prev) => [...prev.slice(-99), m])
    const onConnect = async () => {
      const code = sessionStorage.getItem('roomCode')
      if (!code) return
      const res = await send('rejoin', { code })
      if (!res.ok) sessionStorage.removeItem('roomCode')
    }

    socket.on('state', onState)
    socket.on('chat', onChat)
    socket.on('connect', onConnect)
    if (socket.connected) onConnect()

    return () => {
      socket.off('state', onState)
      socket.off('chat', onChat)
      socket.off('connect', onConnect)
    }
  }, [])

  let screen;
  if (!game) screen = <Home onError={showError} />
  else if (game.phase === 'LOBBY')
    screen = <Lobby game={game} messages={messages} onError={showError} onLeave={leave} />
  else screen = <Game game={game} messages={messages} onError={showError} onLeave={leave} />
  return (
    <div className="app">
      <h1>Mafia</h1>
      {error && <div className="error">{error}</div>}
      {screen}
    </div>
  )

}
