import { describe, expect, it } from 'vitest'
import { BOARD_SURFACE_Y, holeWorldPosition, moleLiftWorld } from './layout3d'

describe('layout3d', () => {
  it('exports board surface height for hole slots', () => {
    expect(BOARD_SURFACE_Y).toBeGreaterThan(0)
  })

  it('maps holes into board bounds', () => {
    const [x, y, z] = holeWorldPosition(5)
    expect(y).toBe(0)
    expect(Math.abs(x)).toBeLessThan(2.2)
    expect(Math.abs(z)).toBeLessThan(2.2)
    const [x1, , z1] = holeWorldPosition(1)
    const [x9, , z9] = holeWorldPosition(9)
    expect(x1).not.toBe(x9)
    expect(z1).not.toBe(z9)
  })

  it('mole lift follows phase', () => {
    expect(moleLiftWorld('off', 10, 0)).toBeLessThan(0)
    expect(moleLiftWorld('top', 10, 0)).toBe(0)
    expect(moleLiftWorld('rising', 10, 5)).toBeGreaterThan(moleLiftWorld('rising', 10, 0))
  })
})
