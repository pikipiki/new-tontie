import { describe, expect, it } from 'vitest'
import gameSpec from '../../reference/game-spec.json'
import manifest from '../../reference/reconstruction-manifest.json'
import { catalogForFrame } from './catalog'
import { applyItem, enemyFromCatalogFrame } from './combat'
import { createInitialState } from './engine'
import type { ItemId } from './types'

describe('reconstruction coverage', () => {
  it('catalog frames 5–24 map to spawns', () => {
    for (let frame = 5; frame <= 24; frame++) {
      const e = enemyFromCatalogFrame(frame)
      expect(e.maxHp).toBeGreaterThan(0)
      expect(e.catalogFrame).toBe(frame)
      expect(catalogForFrame(frame).frame).toBeLessThanOrEqual(frame)
    }
  })

  it('game-spec items are handled in applyItem', () => {
    const items = gameSpec.items as string[]
    const state = createInitialState()
    for (const raw of items) {
      const id = raw as ItemId
      expect(() => applyItem(state, id)).not.toThrow()
    }
  })

  it('reconstruction manifest lists core surfaces', () => {
    expect(manifest.surfaces.length).toBeGreaterThanOrEqual(7)
    const ids = manifest.surfaces.map((s) => s.surface_id)
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
