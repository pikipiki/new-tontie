import { describe, expect, it, vi } from 'vitest'

vi.mock('@reference/game-spec.json', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@reference/game-spec.json')>()
  return {
    default: {
      ...actual,
      shopPrices: [],
    },
  }
})

describe('shop price fallbacks (empty game-spec.shopPrices)', () => {
  it('uses default prices for every offer slot', async () => {
    const { SHOP_OFFERS } = await import('@game/shop')
    expect(SHOP_OFFERS.map((row) => row.price)).toEqual([
      10, 50, 80, 90, 120, 150, 200, 300,
    ])
  })

  it('refuses unknown indices and broke players', async () => {
    const { buyShopOffer } = await import('@game/shop')
    const { createInitialState } = await import('@game/engine')
    const state = createInitialState()
    state.money = 0
    expect(buyShopOffer(state, 0)).toBe(false)
    expect(buyShopOffer(state, 99)).toBe(false)
  })
})
