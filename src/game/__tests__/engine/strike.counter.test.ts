import { describe, expect, it } from 'vitest'
import { resolveStrike } from '@game/engine/strike'
import { fresh, place } from '@game/__tests__/helpers/events.helpers'

describe('falling counter attacks', () => {
  it('damages the player when a mob is struck while falling', () => {
    const state = fresh()
    state.wing = true
    state.playerAttack = 1
    place(
      state,
      2,
      { kind: 'mob', hp: 10, maxHp: 10, counterDamage: 4, catalogFrame: 20 },
      'falling',
    )
    const hpBefore = state.hp
    resolveStrike(state, 2)
    expect(state.hp).toBe(hpBefore - 4)
    expect(state.holes[2].enemy.hp).toBe(9)
  })
})
