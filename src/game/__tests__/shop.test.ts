import { describe, expect, it } from 'vitest'
import { createInitialState } from '@game/engine'
import {
  buyShopOffer,
  offerHammerLv,
  offerOwned,
  SHOP_OFFERS,
} from '@game/shop'

function offer(offerId: string) {
  const found = SHOP_OFFERS.find((row) => row.id === offerId)
  if (!found) throw new Error(offerId)
  return found
}

describe('shop offers', () => {
  it('reads the hammer tier from the offer id', () => {
    expect(offerHammerLv(offer('hammer3'))).toBe(3)
    expect(offerHammerLv(offer('heart1'))).toBeNull()
  })

  it('hammers at or below the current tier and a held wing are owned', () => {
    const state = createInitialState()
    state.money = 9999
    expect(offerOwned(state, offer('hammer2'))).toBe(false)
    expect(buyShopOffer(state, SHOP_OFFERS.indexOf(offer('hammer3')))).toBe(
      true,
    )
    expect(offerOwned(state, offer('hammer2'))).toBe(true)
    expect(offerOwned(state, offer('hammer3'))).toBe(true)
    expect(offerOwned(state, offer('hammer4'))).toBe(false)

    const wing = SHOP_OFFERS.indexOf(offer('wing'))
    expect(buyShopOffer(state, wing)).toBe(true)
    expect(offerOwned(state, offer('wing'))).toBe(true)
    const money = state.money
    expect(buyShopOffer(state, wing)).toBe(false)
    expect(state.money).toBe(money)
    expect(offerOwned(state, offer('heart1'))).toBe(false)
  })

  it('sells hearts, continues, and full heals', () => {
    const state = createInitialState()
    state.money = 9999
    state.hp = 1
    expect(buyShopOffer(state, SHOP_OFFERS.indexOf(offer('heart2')))).toBe(true)
    expect(state.hp).toBeGreaterThan(1)
    expect(buyShopOffer(state, SHOP_OFFERS.indexOf(offer('continue')))).toBe(
      true,
    )
    expect(state.continues).toBeGreaterThan(0)
    state.hp = 1
    expect(buyShopOffer(state, SHOP_OFFERS.indexOf(offer('heart3')))).toBe(true)
    expect(state.hp).toBe(state.hpMax)
  })

  it('refuses duplicate hammer and wing purchases', () => {
    const state = createInitialState()
    state.money = 9999
    state.hammerLv = 4
    state.wing = true
    const money = state.money
    expect(buyShopOffer(state, SHOP_OFFERS.indexOf(offer('hammer2')))).toBe(
      false,
    )
    expect(buyShopOffer(state, SHOP_OFFERS.indexOf(offer('hammer3')))).toBe(
      false,
    )
    expect(buyShopOffer(state, SHOP_OFFERS.indexOf(offer('hammer4')))).toBe(
      false,
    )
    expect(buyShopOffer(state, SHOP_OFFERS.indexOf(offer('wing')))).toBe(false)
    expect(state.money).toBe(money)
  })
})
