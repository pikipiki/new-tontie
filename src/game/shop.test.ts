import { describe, expect, it } from 'vitest'
import { createInitialState } from './engine'
import { buyShopOffer, offerHammerLv, offerOwned, SHOP_OFFERS } from './shop'

function offer(id: string) {
  const o = SHOP_OFFERS.find((x) => x.id === id)
  if (!o) throw new Error(id)
  return o
}

describe('shop offers', () => {
  it('reads the hammer tier from the offer id', () => {
    expect(offerHammerLv(offer('hammer3'))).toBe(3)
    expect(offerHammerLv(offer('heart1'))).toBeNull()
  })

  it('hammers at or below the current tier and a held wing are owned', () => {
    const s = createInitialState()
    s.money = 9999
    expect(offerOwned(s, offer('hammer2'))).toBe(false)
    expect(buyShopOffer(s, SHOP_OFFERS.indexOf(offer('hammer3')))).toBe(true)
    expect(offerOwned(s, offer('hammer2'))).toBe(true)
    expect(offerOwned(s, offer('hammer3'))).toBe(true)
    expect(offerOwned(s, offer('hammer4'))).toBe(false)

    const wing = SHOP_OFFERS.indexOf(offer('wing'))
    expect(buyShopOffer(s, wing)).toBe(true)
    expect(offerOwned(s, offer('wing'))).toBe(true)
    const money = s.money
    expect(buyShopOffer(s, wing)).toBe(false)
    expect(s.money).toBe(money)
    expect(offerOwned(s, offer('heart1'))).toBe(false)
  })
})
