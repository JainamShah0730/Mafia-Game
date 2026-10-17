export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 12;

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr;
}

export function assignRoles(count) {
    const mafiaCount = Math.max(1, Math.floor(count / 4))
    const roles = Array(mafiaCount).fill('MAFIA')
    roles.push('DOCTOR', 'DETECTIVE')
    while (roles.length < count) roles.push('VILLAGER');
    return shuffle(roles)

}

export const NIGHT_ROLES = ['MAFIA', 'DOCTOR', 'DETECTIVE']