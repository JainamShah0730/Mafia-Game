import { isMafiaTeam } from "./roles.js";

export function checkWin(room) {
    const alive = Object.values(room.players).filter((p) => p.alive)
    const mafia = alive.filter((p) => isMafiaTeam(p.role)).length
    const town = alive.length - mafia
    if (mafia === 0) return 'TOWN'
    if (mafia >= town) return 'MAFIA'
    return null
}