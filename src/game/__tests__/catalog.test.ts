import { describe, expect, it } from 'vitest'
import {
  catalogForFrame,
  mapCatalogItem,
  rollTreasureItem,
} from '@game/catalog'

describe('enemy catalog helpers', () => {
  it('falls back to the nearest lower frame', () => {
    const row = catalogForFrame(0)
    expect(row.frame).toBeGreaterThanOrEqual(0)
    const high = catalogForFrame(999)
    expect(high.frame).toBeLessThanOrEqual(999)
    expect(row.hp).toBeGreaterThan(0)
  })

  it('maps SWF item labels to runtime ids', () => {
    expect(mapCatalogItem()).toBeUndefined()
    expect(mapCatalogItem('life')).toBe('life')
    expect(mapCatalogItem('life2')).toBe('life')
    expect(mapCatalogItem('stone')).toBe('stone')
    expect(mapCatalogItem('hammer1')).toBe('hammer1')
    expect(mapCatalogItem('coin5')).toBe('coin')
    expect(mapCatalogItem('hammer3')).toBe('hammer3')
    expect(mapCatalogItem('wing')).toBe('wing')
    expect(mapCatalogItem('sekiban2')).toBe('sekiban2')
    expect(mapCatalogItem('unknown_item')).toBeUndefined()
  })

  it('rolls treasure items from the fixed table', () => {
    expect(rollTreasureItem(() => 0)).toBe('life')
    expect(rollTreasureItem(() => 0.99)).toBe('hammer4')
    expect(rollTreasureItem(() => 1)).toBe('coin')
  })
})
