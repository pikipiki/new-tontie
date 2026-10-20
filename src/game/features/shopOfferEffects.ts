import { heal } from '../stats'
import type { GameState } from '../types'

export type ShopEffectSpec =
  | { kind: 'hammer'; level: number }
  | { kind: 'heal'; amount: number }
  | { kind: 'wing' }
  | { kind: 'continue'; amount?: number }
  | { kind: 'fullHeal' }

export function applyShopEffect(
  state: GameState,
  effect: ShopEffectSpec,
): boolean {
  switch (effect.kind) {
    case 'hammer': {
      if (state.hammerLv >= effect.level) return false
      state.hammerLv = effect.level
      if (effect.level === 2) state.bronze = true
      if (effect.level === 3) state.silver = true
      if (effect.level === 4) state.gold = true
      return true
    }
    case 'heal': {
      heal(state, effect.amount)
      return true
    }
    case 'wing': {
      if (state.wing) return false
      state.wing = true
      return true
    }
    case 'continue': {
      state.continues += effect.amount ?? 1
      return true
    }
    case 'fullHeal': {
      state.hp = state.hpMax
      return true
    }
    default:
      return false
  }
}
