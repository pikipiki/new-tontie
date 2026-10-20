import { describe, expect, it } from 'vitest'
import {
  buyHammerUpgrade,
  buyShopIndex,
  closeShop,
  createInitialState,
  togglePause,
} from '@game/engine'
import { hammerDamage } from '@game/spec'

describe('engine shop flow', () => {
  it('closes the shop, buys upgrades, and toggles pause', () => {
    const state = createInitialState()
    closeShop(state)
    state.phase = 'shop'
    state.shopResume = true
    closeShop(state)
    expect(state.phase).toBe('playing')

    state.phase = 'shop'
    state.money = 9999
    buyShopIndex(state, 1)
    state.money = 0
    expect(buyHammerUpgrade(state)).toBe(false)
    state.money = 9999
    expect(buyHammerUpgrade(state)).toBe(true)
    expect(state.playerAttack).toBe(hammerDamage(state.hammerLv))

    state.phase = 'playing'
    togglePause(state)
    expect(state.phase).toBe('paused')
    togglePause(state)
    expect(state.phase).toBe('playing')
  })
})
