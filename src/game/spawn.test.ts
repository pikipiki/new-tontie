import { describe, expect, it } from 'vitest'
import { createInitialState } from './engine'
import { rollSpawnDecision } from './spawn'

describe('DefineSprite_459 spawn', () => {
  it('mob frame stays in [5, 5+lv-1] for level 10', () => {
    const state = createInitialState()
    state.level = 10
    state.shopL = 1
    let mob = 0
    for (let i = 0; i < 500; i++) {
      const d = rollSpawnDecision(state, () => 0.5)
      if (d.type === 'mob') {
        mob++
        expect(d.catalogFrame).toBeGreaterThanOrEqual(5)
        expect(d.catalogFrame).toBeLessThan(5 + 10)
      }
    }
    expect(mob).toBeGreaterThan(0)
  })

  it('can roll shop when shop_l is 0 and k is 0', () => {
    const state = createInitialState()
    state.shopL = 0
    const d = rollSpawnDecision(state, () => 0)
    expect(d.type).toBe('shop')
    expect(state.shopL).toBe(1)
  })
})
