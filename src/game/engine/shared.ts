import { applyDamage } from '../combat'
import type {
  EnemySpawn,
  GameEvent,
  GameState,
  HoleIndex,
  HoleState,
  LevelStats,
} from '../types'

export const HOLES: HoleIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const MAX_EVENTS = 64

export function freshStats(score: number): LevelStats {
  return { swings: 0, misses: 0, monsters: 0, lost: 0, scoreStart: score }
}

export function countsAsMonster(enemy: EnemySpawn): boolean {
  return (
    enemy.kind !== 'shop' && enemy.kind !== 'treasure' && enemy.kind !== 'none'
  )
}

/** Returns and clears pending events (UI drains after every tick / action). */
export function drainEvents(state: GameState): GameEvent[] {
  const out = state.events
  state.events = []
  return out
}

export function emit(state: GameState, event: GameEvent): void {
  state.events.push(event)
  if (state.events.length > MAX_EVENTS) {
    state.events.splice(0, state.events.length - MAX_EVENTS)
  }
}

export function hurt(state: GameState, amount: number, hole?: HoleIndex): void {
  if (applyDamage(state, amount)) {
    emit(state, { kind: 'damage', hole, sfx: 'damage' })
  } else {
    emit(state, { kind: 'guard', hole, sfx: 'no_damege' })
  }
}

export function emptyHole(): HoleState {
  return {
    phase: 'off',
    phaseTicks: 0,
    enemy: { kind: 'none', hp: 0, maxHp: 0, attack: 0, score: 0 },
    nikaiRemaining: 0,
  }
}
