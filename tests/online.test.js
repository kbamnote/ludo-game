/**
 * Phase 5 online play — the seams that break silently.
 *
 * Two things here cannot be caught by playing the game for a minute:
 *
 *   1. The projection from server state to engine state. A wrong field renders
 *      tokens in the wrong place, and it will look like a board bug.
 *   2. The room-code guard. `joinOrCreate` with a mistyped code would open a
 *      new empty room instead of failing, leaving the player alone in a lobby
 *      wondering where their friends went.
 */
import { project } from '../src/features/gameplay/useOnlineMatch';
import { summarise } from '../src/game/engine/engine';
import { joinPrivateMatch, RealtimeError } from '../src/services/realtime';

/** A Colyseus view is schema objects, not plain data; this mimics the parts used. */
function serverView(overrides = {}) {
  const players = new Map([
    ['sess_a', { userId: 'u_a', name: 'Alice', seat: 0, connected: true, ready: true, bot: false, tokensHome: 1 }],
    ['sess_b', { userId: 'u_b', name: 'Bo', seat: 2, connected: false, ready: true, bot: true, tokensHome: 0 }],
  ]);

  return {
    roomCode: 'AB2D',
    phase: 'playing',
    turn: 2,
    roll: 6,
    turnPhase: 'awaitingMove',
    entryFee: 0,
    pot: 0,
    turnDeadline: 0,
    winner: '',
    players,
    tokens: [
      { id: '0-0', seat: 0, slot: 0, progress: 57 },
      { id: '0-1', seat: 0, slot: 1, progress: -1 },
      { id: '2-0', seat: 2, slot: 0, progress: 13 },
    ],
    legalTokenIds: ['2-0'],
    ranking: [0],
    ...overrides,
  };
}

describe('server state projection', () => {
  it('produces the fields the board and engine helpers read', () => {
    const state = project(serverView());

    // Seats come from the players, sorted — the board draws houses by seat.
    expect(state.seats).toEqual([0, 2]);
    expect(state.turn).toBe(2);
    expect(state.phase).toBe('awaitingMove');
    expect(state.roll).toBe(6);
    expect(state.legalMoves).toEqual([{ tokenId: '2-0' }]);
    expect(state.ranking).toEqual([0]);

    // Token identity AND position must survive, or tokens jump.
    expect(state.tokens).toEqual([
      { id: '0-0', seat: 0, slot: 0, progress: 57 },
      { id: '0-1', seat: 0, slot: 1, progress: -1 },
      { id: '2-0', seat: 2, slot: 0, progress: 13 },
    ]);
  });

  it('turns a roll of 0 into null so the dice reads "tap to roll"', () => {
    // The schema cannot send null, so "nothing rolled yet" arrives as 0. Left
    // as 0 it would render a blank dice face and a "Rolled 0" label.
    const state = project(serverView({ roll: 0, turnPhase: 'awaitingRoll' }));
    expect(state.roll).toBeNull();
  });

  it('carries no RNG state, so a client cannot predict a roll', () => {
    const state = project(serverView());
    expect(state.rngState).toBe(0);
    expect(state.rollCount).toBe(0);
  });

  it('names the winner only once the match is finished', () => {
    expect(project(serverView()).winner).toBeNull();
    expect(project(serverView({ phase: 'finished' })).winner).toBe(0);
  });

  it('is accepted by summarise, which the results screen depends on', () => {
    // summarise reads state.seats, state.ranking and the tokens. A projection
    // missing any of them throws here rather than on the results screen.
    const standings = summarise(project(serverView()));

    expect(standings.map((row) => row.seat)).toEqual([0, 2]);
    expect(standings[0].place).toBe(1);
    expect(standings[0].home).toBe(1);
    expect(standings.every((row) => typeof row.faction === 'string')).toBe(true);
  });

  it('survives a state patch that has arrived empty', () => {
    // Colyseus delivers the first patch before the room is populated.
    expect(() => project({})).not.toThrow();
    const state = project({});
    expect(state.tokens).toEqual([]);
    expect(state.seats).toEqual([]);
    expect(state.phase).toBe('awaitingRoll');
  });
});

describe('private match codes', () => {
  it('rejects a code that is not four characters', async () => {
    await expect(joinPrivateMatch({ code: 'AB' })).rejects.toBeInstanceOf(RealtimeError);
    await expect(joinPrivateMatch({ code: '' })).rejects.toBeInstanceOf(RealtimeError);
    await expect(joinPrivateMatch({ code: 'ABCDE' })).rejects.toBeInstanceOf(RealtimeError);
  });
});
