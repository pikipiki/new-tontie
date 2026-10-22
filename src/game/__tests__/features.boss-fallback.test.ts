import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('@reference/game-spec.json', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@reference/game-spec.json')>()
  return { default: { ...actual, round: { ...actual.round, bossLevels: [] } } }
})
afterEach(() => {
  vi.doUnmock('@reference/game-spec.json')
  vi.resetModules()
})

describe('optional classic boss schedule', () => {
  it('can load an empty boss schedule for a custom campaign', async () => {
    vi.resetModules()
    const { loadBuiltinBossLevels, listBossLevels } =
      await import('@game/features/bossLevels')
    loadBuiltinBossLevels()
    expect(listBossLevels()).toEqual([])
  })
})
