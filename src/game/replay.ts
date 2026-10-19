import type { GameState } from './types'

/** Compact fingerprint for regression / seeded replay tests. */
export function stateFingerprint(state: GameState): string {
  const holes = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map((h) => {
      const slot = state.holes[h as keyof typeof state.holes]
      const e = slot.enemy
      return slot.phase.charAt(0) + e.kind.charAt(0) + String(e.hp)
    })
    .join('')

  return [
    state.phase,
    state.level,
    state.score,
    state.money,
    state.hp,
    state.hammerLv,
    state.moguraOn,
    state.bossSpawned ? 1 : 0,
    state.shopL,
    holes,
  ].join('|')
}
