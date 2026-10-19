import { MONEY_CAP } from './spec'
import type { GameState } from './types'

export function addCoin(state: GameState, amount: number): void {
  state.money = Math.min(MONEY_CAP, state.money + amount)
}
