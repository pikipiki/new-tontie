import { describe, expect, it } from 'vitest'
import { holeBlockedForRandomSpawn } from '@game/enemies'
import { BOSS_HOLE } from '@game/spec'

describe('enemy spawn rules', () => {
  it('only blocks the boss hole on boss levels', () => {
    expect(holeBlockedForRandomSpawn(10, BOSS_HOLE)).toBe(true)
    expect(holeBlockedForRandomSpawn(10, 1)).toBe(false)
    expect(holeBlockedForRandomSpawn(3, BOSS_HOLE)).toBe(false)
  })
})
