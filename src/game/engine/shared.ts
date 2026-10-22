import { applyDamage } from '../stats'
import { FPS } from '../spec'
import type {
  EnemySpawn,
  GameEvent,
  GameState,
  HoleIndex,
  HoleState,
  LevelStats,
} from '../types'

/** Ascending order is replay-sensitive; the visual HOLE_ORDER runs top to bottom. */
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

export function retireHole(
  state: GameState,
  hole: HoleIndex,
  escaped: boolean,
): void {
  const slot = state.holes[hole]
  if (slot.phase === 'off') {
    return
  }
  if (escaped && countsAsMonster(slot.enemy)) state.levelStats.lost += 1
  if (escaped && slot.enemy.attack > 0) {
    hurt(state, slot.enemy.attack, hole)
  }
  slot.phase = 'off'
  slot.phaseTicks = 0
  slot.enemy = { kind: 'none', hp: 0, maxHp: 0, attack: 0, score: 0 }
  slot.nikaiRemaining = 0
  state.moguraOn = Math.max(0, state.moguraOn - 1)
}

export function announce(state: GameState, message: string): void {
  if (!state.adventure) return
  state.adventure.notice = message
  state.adventure.noticeFrames = FPS * 3
}
