import type { GameState } from './types'

export function heal(state: GameState, amount: number): void {
  state.hp = Math.min(state.hpMax, state.hp + amount)
}
