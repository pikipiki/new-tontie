import { describe, expect, it, vi } from 'vitest'

vi.mock('@reference/enemy-catalog.json', () => ({
  default: { entries: [] },
}))

describe('catalog fallbacks (empty enemy catalog)', () => {
  it('synthesizes a default row when the catalog is empty', async () => {
    vi.resetModules()
    const { catalogForFrame } = await import('@game/catalog')
    expect(catalogForFrame(42)).toEqual({
      frame: 42,
      hp: 1,
      attack: 10,
      score: 5,
    })
  })
})
