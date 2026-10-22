import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@reference/game-spec.json', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@reference/game-spec.json')>()
  return {
    default: {
      ...actual,
      shop: { levels: actual.shop.levels, offers: [] },
    },
  }
})

afterEach(() => {
  vi.doUnmock('@reference/game-spec.json')
  vi.resetModules()
})

describe('shop offer fallbacks (empty game-spec.shop.offers)', () => {
  it('uses built-in default rows and prices', async () => {
    vi.resetModules()
    const { createBuiltinShopOffers } =
      await import('@game/features/shopOffers')
    const offers = createBuiltinShopOffers()
    expect(offers.map((row) => row.price)).toEqual([
      10, 50, 80, 90, 120, 150, 200, 300,
    ])
    expect(offers.map((row) => row.id)).toEqual([
      'hammer2',
      'hammer3',
      'hammer4',
      'heart1',
      'wing',
      'heart2',
      'continue',
      'heart3',
    ])
  })

  it('refuses unknown indices and broke players', async () => {
    vi.resetModules()
    const { buyShopOffer } = await import('@game/shop')
    const { createInitialState } = await import('@game/engine')
    const state = createInitialState()
    state.money = 0
    expect(buyShopOffer(state, 0)).toBe(false)
    expect(buyShopOffer(state, 99)).toBe(false)
  })
})
