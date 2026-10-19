import { describe, expect, it } from 'vitest'
import { mobGlbKey, mobGlbUrl, mobModelKey } from './resolveMobGlb'

describe('resolveMobGlb', () => {
  it('maps catalog frames to glb keys', () => {
    expect(mobModelKey({ kind: 'mob', hp: 1, maxHp: 1, attack: 1, score: 1, catalogFrame: 14 })).toBe('14')
    expect(mobGlbUrl('14')).toBe('/game/models/mobs/14.glb')
  })

  it('resolves shop and treasure', () => {
    expect(mobModelKey({ kind: 'shop', hp: 1, maxHp: 1, attack: 0, score: 0 })).toBe('shop')
    expect(mobModelKey({ kind: 'treasure', hp: 1, maxHp: 1, attack: 0, score: 0 })).toBe('treasure')
  })

  it('returns a glb key for active mobs', () => {
    const key = mobGlbKey({ kind: 'mob', hp: 1, maxHp: 1, attack: 1, score: 1, catalogFrame: 7 })
    expect(key).toBeTruthy()
    expect(mobGlbUrl(key!)).toMatch(/\.glb$/)
  })
})
