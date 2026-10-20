import { describe, expect, it } from 'vitest'
import { enemyFromCatalogFrame } from '@game/combat'
import { registerEnemyBuilder, resetFeatureRegistry } from '@game/features'

describe('enemy builder resolution', () => {
  it('skips non-matching builders before using the default catalog mapping', () => {
    registerEnemyBuilder({
      id: 'no-match',
      match: () => false,
      build: () => ({
        kind: 'mob',
        hp: 1,
        maxHp: 1,
        attack: 0,
        score: 0,
      }),
    })
    expect(enemyFromCatalogFrame(5).kind).toBe('mob')
    resetFeatureRegistry()
  })
})
