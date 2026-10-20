import { afterEach, describe, expect, it } from 'vitest'
import { createInitialState } from '@game/engine'
import {
  getShopOffers,
  registerItemEffect,
  registerShopOffer,
  resetFeatureRegistry,
} from '@game/features'
import { buyShopOffer, SHOP_OFFERS } from '@game/shop'

describe('feature registry', () => {
  afterEach(() => {
    resetFeatureRegistry()
  })

  it('loads built-in shop rows', () => {
    expect(SHOP_OFFERS.length).toBeGreaterThanOrEqual(8)
    expect(getShopOffers()).toBe(SHOP_OFFERS)
  })

  it('registers extra shop offers without editing core shop code', () => {
    registerShopOffer({
      id: 'mod-coins',
      label: 'Bonus coins',
      price: 1,
      apply: (state) => {
        state.money += 50
        return true
      },
    })
    const state = createInitialState()
    state.money = 1
    const index = SHOP_OFFERS.findIndex((row) => row.id === 'mod-coins')
    expect(buyShopOffer(state, index)).toBe(true)
    expect(state.money).toBe(50)
  })

  it('rejects duplicate shop or item registration', () => {
    expect(() => {
      registerShopOffer({
        id: 'hammer2',
        label: 'dup',
        price: 1,
        apply: () => {
          return true
        },
      })
    }).toThrow(/already registered/)
    expect(() => {
      registerItemEffect({
        id: 'stone',
        apply: () => {
          /* duplicate */
        },
      })
    }).toThrow(/already registered/)
  })
})
