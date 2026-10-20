import { describe, expect, it } from 'vitest'
import gameSpec from '@reference/game-spec.json'
import manifest from '@reference/reconstruction-manifest.json'
import { catalogForFrame } from '@game/catalog'
import { applyItem, enemyFromCatalogFrame } from '@game/combat'
import { createInitialState } from '@game/engine'
import type { ItemId } from '@game/types'

describe('reconstruction coverage', () => {
  it('catalog frames 5–24 map to spawns', () => {
    for (let frame = 5; frame <= 24; frame++) {
      const enemy = enemyFromCatalogFrame(frame)
      expect(enemy.maxHp).toBeGreaterThan(0)
      expect(enemy.catalogFrame).toBe(frame)
      expect(catalogForFrame(frame).frame).toBeLessThanOrEqual(frame)
    }
  })

  it('game-spec items are handled in applyItem', () => {
    const state = createInitialState()
    for (const raw of gameSpec.items) {
      const itemId = raw as ItemId
      expect(() => {
        applyItem(state, itemId)
      }).not.toThrow()
    }
  })

  it('reconstruction manifest lists core surfaces', () => {
    expect(manifest.surfaces.length).toBeGreaterThanOrEqual(7)
    const ids = manifest.surfaces.map((surface) => surface.surface_id)
    expect(ids).toContain('spawn.DefineSprite_459')
    expect(ids).toContain('combat.DefineSprite_669')
  })

  it('every manifest surface has an owner export path', () => {
    for (const surface of manifest.surfaces) {
      expect(surface.owner).toMatch(/^src\//)
      expect(surface.export.length).toBeGreaterThan(0)
    }
  })
})
