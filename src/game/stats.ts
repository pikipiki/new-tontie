import { hammerDamage } from './spec'
import type { GameState } from './types'

export function heal(state: GameState, amount: number): void {
  state.hp = Math.min(state.hpMax, state.hp + amount)
}

export function syncPlayerAttack(state: GameState): void {
  state.playerAttack = hammerDamage(state.hammerLv)
}

export function applyDamage(state: GameState, amount: number): boolean {
  if (amount <= 0) {
    state.hp = Math.min(state.hpMax, state.hp - amount)
    return true
  }
  if (state.stone) {
    state.stone = false
    return false
  }
  state.hp -= amount
  return true
}

export function applyCoinDamage(state: GameState, amount: number): void {
  state.money = Math.max(0, state.money - amount)
}
