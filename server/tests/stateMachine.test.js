import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
    createRoom, addPlayer, startGame, beginNight, submitNightAction,
    allNightActionsIn, resolveNight, beginVoting, castVote, resolveVoting, viewFor,
} from '../src/game/stateMachine.js';

const DEFAULT_ROLES = ['MAFIA', 'DOCTOR', 'DETECTIVE', 'VILLAGER', 'VILLAGER'];

// Builds a room in the NIGHT phase with fixed roles: p1, p2, p3...
function makeRoom(roles = DEFAULT_ROLES) {
    const room = createRoom('TEST', { id: 'p1', name: 'P1' });
    for (let i = 2; i <= roles.length; i++) {
        addPlayer(room, { id: `p${i}`, name: `P${i}` });
    }
    roles.forEach((role, i) => (room.players[`p${i + 1}`].role = role));
    return beginNight(room);
}

describe('lobby and start', () => {
    test('needs at least 4 players', () => {
        const room = createRoom('T', { id: 'p1', name: 'P1' });
        addPlayer(room, { id: 'p2', name: 'P2' });
        addPlayer(room, { id: 'p3', name: 'P3' });
        assert.throws(() => startGame(room, 'p1'), /at least 4/);
    });

    test('only the host can start', () => {
        const room = createRoom('T', { id: 'p1', name: 'P1' });
        for (let i = 2; i <= 5; i++) addPlayer(room, { id: `p${i}`, name: `P${i}` });
        assert.throws(() => startGame(room, 'p2'), /Only the host/);
    });

    test('assigns roles for 5 players and starts night 1', () => {
        const room = createRoom('T', { id: 'p1', name: 'P1' });
        for (let i = 2; i <= 5; i++) addPlayer(room, { id: `p${i}`, name: `P${i}` });
        startGame(room, 'p1');
        const roles = Object.values(room.players).map((p) => p.role).sort();
        assert.deepEqual(roles, ['DETECTIVE', 'DOCTOR', 'MAFIA', 'VILLAGER', 'VILLAGER']);
        assert.equal(room.phase, 'NIGHT');
        assert.equal(room.round, 1);
    });

    test('new players cannot join after the game started', () => {
        const room = makeRoom();
        assert.throws(() => addPlayer(room, { id: 'late', name: 'Late' }), /already started/);
    });

    test('an existing player can reconnect mid-game', () => {
        const room = makeRoom();
        room.players.p2.connected = false;
        addPlayer(room, { id: 'p2', name: 'P2' });
        assert.equal(room.players.p2.connected, true);
    });

    test('room is limited to 12 players', () => {
        const room = createRoom('T', { id: 'p1', name: 'P1' });
        for (let i = 2; i <= 12; i++) addPlayer(room, { id: `p${i}`, name: `P${i}` });
        assert.throws(() => addPlayer(room, { id: 'p13', name: 'P13' }), /full/);
    });
});

describe('night actions', () => {
    test('mafia kills the target', () => {
        const room = makeRoom();
        submitNightAction(room, 'p1', 'p4');
        resolveNight(room);
        assert.equal(room.players.p4.alive, false);
        assert.equal(room.phase, 'DAY');
    });

    test('doctor saves the target, so nobody dies', () => {
        const room = makeRoom();
        submitNightAction(room, 'p1', 'p4');
        submitNightAction(room, 'p2', 'p4');
        resolveNight(room);
        assert.equal(room.players.p4.alive, true);
        assert.equal(room.log.at(-1).killed, null);
    });

    test('doctor saving someone else does not stop the kill', () => {
        const room = makeRoom();
        submitNightAction(room, 'p1', 'p4');
        submitNightAction(room, 'p2', 'p5');
        resolveNight(room);
        assert.equal(room.players.p4.alive, false);
    });

    test('a night with no actions kills nobody', () => {
        const room = makeRoom();
        resolveNight(room);
        assert.ok(Object.values(room.players).every((p) => p.alive));
    });

    test('mafia cannot target their own team', () => {
        const room = makeRoom(['MAFIA', 'MAFIA', 'DOCTOR', 'DETECTIVE', 'VILLAGER', 'VILLAGER']);
        assert.throws(() => submitNightAction(room, 'p1', 'p2'), /own team/);
    });

    test('villagers have no night action', () => {
        const room = makeRoom();
        assert.throws(() => submitNightAction(room, 'p4', 'p1'), /no night action/);
    });

    test('dead players cannot act', () => {
        const room = makeRoom();
        room.players.p2.alive = false;
        assert.throws(() => submitNightAction(room, 'p2', 'p4'), /cannot act/);
    });

    test('cannot target a dead player', () => {
        const room = makeRoom();
        room.players.p4.alive = false;
        assert.throws(() => submitNightAction(room, 'p1', 'p4'), /Invalid target/);
    });

    test('night actions are rejected outside the night phase', () => {
        const room = makeRoom();
        resolveNight(room); // now DAY
        assert.throws(() => submitNightAction(room, 'p1', 'p4'), /not night/);
    });

    test('allNightActionsIn is true only when every night role has acted', () => {
        const room = makeRoom();
        submitNightAction(room, 'p1', 'p4');
        submitNightAction(room, 'p2', 'p4');
        assert.equal(allNightActionsIn(room), false);
        submitNightAction(room, 'p3', 'p1');
        assert.equal(allNightActionsIn(room), true);
    });

    test('detective learns whether the target is mafia', () => {
        const room = makeRoom();
        submitNightAction(room, 'p3', 'p1');
        resolveNight(room);
        assert.equal(room.investigation.isMafia, true);
    });
});

describe('voting', () => {
    test('majority vote eliminates a player and starts the next night', () => {
        const room = makeRoom();
        beginVoting(room);
        ['p1', 'p2', 'p3'].forEach((v) => castVote(room, v, 'p4'));
        resolveVoting(room);
        assert.equal(room.players.p4.alive, false);
        assert.equal(room.phase, 'NIGHT');
        assert.equal(room.round, 2);
    });

    test('a tie eliminates nobody', () => {
        const room = makeRoom();
        beginVoting(room);
        castVote(room, 'p1', 'p4');
        castVote(room, 'p2', 'p5');
        resolveVoting(room);
        assert.ok(Object.values(room.players).every((p) => p.alive));
    });

    test('everyone skipping eliminates nobody', () => {
        const room = makeRoom();
        beginVoting(room);
        Object.keys(room.players).forEach((id) => castVote(room, id, 'SKIP'));
        resolveVoting(room);
        assert.ok(Object.values(room.players).every((p) => p.alive));
    });

    test('a player can change their vote', () => {
        const room = makeRoom();
        beginVoting(room);
        castVote(room, 'p1', 'p4');
        castVote(room, 'p1', 'p5');
        assert.equal(room.votes.p1, 'p5');
    });

    test('voting is rejected outside the voting phase', () => {
        const room = makeRoom();
        assert.throws(() => castVote(room, 'p1', 'p4'), /not voting/);
    });

    test('dead players cannot vote', () => {
        const room = makeRoom();
        beginVoting(room);
        room.players.p4.alive = false;
        assert.throws(() => castVote(room, 'p4', 'p1'), /Dead players/);
    });

    test('cannot vote for a dead player', () => {
        const room = makeRoom();
        beginVoting(room);
        room.players.p4.alive = false;
        assert.throws(() => castVote(room, 'p1', 'p4'), /Invalid target/);
    });
});

describe('win conditions', () => {
    test('town wins when the last mafia is voted out', () => {
        const room = makeRoom();
        beginVoting(room);
        ['p2', 'p3', 'p4', 'p5'].forEach((v) => castVote(room, v, 'p1'));
        resolveVoting(room);
        assert.equal(room.phase, 'GAME_OVER');
        assert.equal(room.winner, 'TOWN');
    });

    test('mafia wins when they equal the town', () => {
        const room = makeRoom(['MAFIA', 'VILLAGER', 'VILLAGER']);
        submitNightAction(room, 'p1', 'p2');
        resolveNight(room); // 1 mafia vs 1 villager left
        assert.equal(room.phase, 'GAME_OVER');
        assert.equal(room.winner, 'MAFIA');
    });

    test('the game continues while town still outnumbers mafia', () => {
        const room = makeRoom();
        submitNightAction(room, 'p1', 'p4');
        resolveNight(room);
        assert.equal(room.winner, null);
        assert.equal(room.phase, 'DAY');
    });
});

describe('information hiding (viewFor)', () => {
    test('a villager sees only their own role', () => {
        const room = makeRoom();
        const view = viewFor(room, 'p4');
        assert.equal(view.me.role, 'VILLAGER');
        assert.equal(view.players.find((p) => p.id === 'p1').role, null);
        assert.equal(view.players.find((p) => p.id === 'p2').role, null);
    });

    test('mafia members can see each other', () => {
        const room = makeRoom(['MAFIA', 'MAFIA', 'DOCTOR', 'DETECTIVE', 'VILLAGER', 'VILLAGER']);
        const view = viewFor(room, 'p1');
        assert.equal(view.players.find((p) => p.id === 'p2').role, 'MAFIA');
        assert.equal(view.players.find((p) => p.id === 'p3').role, null);
    });

    test('night actions are never sent to clients', () => {
        const room = makeRoom();
        submitNightAction(room, 'p1', 'p4');
        const view = viewFor(room, 'p4');
        assert.equal('nightActions' in view, false);
    });

    test('only the detective sees the investigation result', () => {
        const room = makeRoom();
        submitNightAction(room, 'p3', 'p1');
        resolveNight(room);
        assert.deepEqual(viewFor(room, 'p3').investigation, { targetId: 'p1', isMafia: true });
        assert.equal(viewFor(room, 'p4').investigation, null);
        assert.equal(viewFor(room, 'p1').investigation, null);
    });

    test('votes are hidden outside the voting phase', () => {
        const room = makeRoom();
        beginVoting(room);
        castVote(room, 'p1', 'p4');
        assert.deepEqual(viewFor(room, 'p2').votes, { p1: 'p4' });
        resolveVoting(room);
        assert.deepEqual(viewFor(room, 'p2').votes, {});
    });

    test('all roles are revealed when the game is over', () => {
        const room = makeRoom();
        beginVoting(room);
        ['p2', 'p3', 'p4', 'p5'].forEach((v) => castVote(room, v, 'p1'));
        resolveVoting(room);
        const view = viewFor(room, 'p4');
        assert.equal(view.players.find((p) => p.id === 'p1').role, 'MAFIA');
        assert.equal(view.players.find((p) => p.id === 'p2').role, 'DOCTOR');
    });
});

describe('framer role', () => {
    // p1 MAFIA, p2 FRAMER, p3 DOCTOR, p4 DETECTIVE, p5 and p6 VILLAGER
    const FRAMER_ROLES = ['MAFIA', 'FRAMER', 'DOCTOR', 'DETECTIVE', 'VILLAGER', 'VILLAGER'];

    test('a framed innocent player looks like mafia to the detective', () => {
        const room = makeRoom(FRAMER_ROLES);
        submitNightAction(room, 'p2', 'p5');
        submitNightAction(room, 'p4', 'p5');
        resolveNight(room);
        assert.equal(room.investigation.isMafia, true);
    });

    test('without a frame, the same player looks innocent', () => {
        const room = makeRoom(FRAMER_ROLES);
        submitNightAction(room, 'p4', 'p5');
        resolveNight(room);
        assert.equal(room.investigation.isMafia, false);
    });

    test('the frame lasts only one night', () => {
        const room = makeRoom(FRAMER_ROLES);
        submitNightAction(room, 'p2', 'p5');
        resolveNight(room);
        beginNight(room); // next night, nobody frames p5
        submitNightAction(room, 'p4', 'p5');
        resolveNight(room);
        assert.equal(room.investigation.isMafia, false);
    });

    test('investigating the framer reveals mafia', () => {
        const room = makeRoom(FRAMER_ROLES);
        submitNightAction(room, 'p4', 'p2');
        resolveNight(room);
        assert.equal(room.investigation.isMafia, true);
    });

    test('framer cannot target the mafia team, and mafia cannot target the framer', () => {
        const room = makeRoom(FRAMER_ROLES);
        assert.throws(() => submitNightAction(room, 'p2', 'p1'), /own team/);
        assert.throws(() => submitNightAction(room, 'p1', 'p2'), /own team/);
    });

    test('framing does not kill anyone', () => {
        const room = makeRoom(FRAMER_ROLES);
        submitNightAction(room, 'p2', 'p5');
        resolveNight(room);
        assert.ok(Object.values(room.players).every((p) => p.alive));
    });

    test('framer action is not counted as a kill vote', () => {
        const room = makeRoom(FRAMER_ROLES);
        submitNightAction(room, 'p1', 'p6');
        submitNightAction(room, 'p2', 'p5');
        resolveNight(room);
        assert.equal(room.players.p6.alive, false);
        assert.equal(room.players.p5.alive, true);
    });

    test('night is not complete until the framer has acted', () => {
        const room = makeRoom(FRAMER_ROLES);
        submitNightAction(room, 'p1', 'p5');
        submitNightAction(room, 'p3', 'p5');
        submitNightAction(room, 'p4', 'p5');
        assert.equal(allNightActionsIn(room), false);
        submitNightAction(room, 'p2', 'p6');
        assert.equal(allNightActionsIn(room), true);
    });

    test('the framer counts toward the mafia win condition', () => {
        const room = makeRoom(['MAFIA', 'FRAMER', 'VILLAGER', 'VILLAGER', 'VILLAGER']);
        submitNightAction(room, 'p1', 'p3');
        resolveNight(room); // 2 mafia team vs 2 villagers
        assert.equal(room.phase, 'GAME_OVER');
        assert.equal(room.winner, 'MAFIA');
    });

    test('town does not win while the framer is alive', () => {
        const room = makeRoom(FRAMER_ROLES);
        beginVoting(room);
        ['p2', 'p3', 'p4', 'p5', 'p6'].forEach((v) => castVote(room, v, 'p1'));
        resolveVoting(room);
        assert.equal(room.winner, null);
        assert.equal(room.phase, 'NIGHT');
    });

    test('town wins once the mafia and the framer are both gone', () => {
        const room = makeRoom(FRAMER_ROLES);
        room.players.p1.alive = false;
        beginVoting(room);
        ['p3', 'p4', 'p5', 'p6'].forEach((v) => castVote(room, v, 'p2'));
        resolveVoting(room);
        assert.equal(room.winner, 'TOWN');
    });

    test('mafia team members see each other; others do not see the framer', () => {
        const room = makeRoom(FRAMER_ROLES);
        const roleOf = (view, id) => view.players.find((p) => p.id === id).role;
        assert.equal(roleOf(viewFor(room, 'p1'), 'p2'), 'FRAMER');
        assert.equal(roleOf(viewFor(room, 'p2'), 'p1'), 'MAFIA');
        assert.equal(roleOf(viewFor(room, 'p5'), 'p2'), null);
    });

    test('games with 7 or more players get exactly one framer', () => {
        const room = createRoom('T', { id: 'p1', name: 'P1' });
        for (let i = 2; i <= 7; i++) addPlayer(room, { id: `p${i}`, name: `P${i}` });
        startGame(room, 'p1');
        const framers = Object.values(room.players).filter((p) => p.role === 'FRAMER');
        assert.equal(framers.length, 1);
    });

    test('games with 6 players have no framer', () => {
        const room = createRoom('T', { id: 'p1', name: 'P1' });
        for (let i = 2; i <= 6; i++) addPlayer(room, { id: `p${i}`, name: `P${i}` });
        startGame(room, 'p1');
        assert.ok(Object.values(room.players).every((p) => p.role !== 'FRAMER'));
    });
});