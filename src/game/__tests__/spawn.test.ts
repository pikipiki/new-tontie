import { describe, expect, it } from 'vitest'
import { createInitialState } from '@game/engine'
import { rollSpawnDecision } from '@game/spawn'

describe('DefineSprite_459 spawn', () => {
  it('mob frame stays in [5, 5+lv-1] for level 10', () => {
    const state = createInitialState()
    state.level = 10
    state.shopL = 1
    let mob = 0
    for (let attempt = 0; attempt < 500; attempt++) {
      const decision = rollSpawnDecision(state, () => 0.5)
      if (decision.type === 'mob') {
        mob++
        expect(decision.catalogFrame).toBeGreaterThanOrEqual(5)
        expect(decision.catalogFrame).toBeLessThan(5 + 10)
      }
    }
    expect(mob).toBeGreaterThan(0)
  })

  it('can roll shop when shop_l is 0 and k is 0', () => {
    const state = createInitialState()
    state.shopL = 0
    const decision = rollSpawnDecision(state, () => 0)
    expect(decision.type).toBe('shop')
    expect(state.shopL).toBe(1)
  })
})
