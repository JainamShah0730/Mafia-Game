export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 12;
export const FRAMER_MIN_PLAYERS = 7;

export const NIGHT_ROLES = ['MAFIA', 'DOCTOR', 'DETECTIVE', 'FRAMER'];
export const MAFIA_TEAM = ['MAFIA', 'FRAMER'];
export const isMafiaTeam = (role) => MAFIA_TEAM.includes(role);

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function assignRoles(count) {
    const mafiaCount = Math.max(1, Math.floor(count / 4));
    const roles = Array(mafiaCount).fill('MAFIA');
    roles.push('DOCTOR', 'DETECTIVE');
    if (count >= FRAMER_MIN_PLAYERS) roles.push('FRAMER');
    while (roles.length < count) roles.push('VILLAGER');
    return shuffle(roles);
}