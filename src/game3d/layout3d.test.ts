import { describe, expect, it } from 'vitest'
import {
  BOARD_SURFACE_Y,
  HAMMER_IMPACT_T,
  hammerSwing,
  holeWorldPosition,
  MOLE_HIDE_DEPTH,
  MOLE_TOP_SINK,
  moleLiftWorld,
} from './layout3d'

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
    expect(moleLiftWorld('off', 10, 0)).toBe(-MOLE_HIDE_DEPTH)
    expect(moleLiftWorld('top', 10, 0)).toBe(-MOLE_TOP_SINK)
    expect(moleLiftWorld('rising', 10, 5)).toBeGreaterThan(
      moleLiftWorld('rising', 10, 0),
    )
    expect(moleLiftWorld('rising', 10, 10)).toBeCloseTo(
      moleLiftWorld('top', 10, 0),
    )
    expect(moleLiftWorld('rising', 10, 0, 1.2)).toBe(-1.2)
  })

  it('hammer winds up, lands at impact, then lifts away', () => {
    const start = hammerSwing(0)
    const windup = hammerSwing(0.2)
    expect(windup.angle).toBeLessThan(start.angle)
    expect(hammerSwing(HAMMER_IMPACT_T).angle).toBeCloseTo(0)
    expect(hammerSwing(1).scale).toBeLessThan(0.2)
    expect(hammerSwing(1).angle).toBeLessThan(-0.5)
  })

  it('mole rise eases out (fast start) and fall eases in', () => {
    const half = moleLiftWorld('rising', 10, 5)
    const linearHalf =
      (moleLiftWorld('rising', 10, 0) + moleLiftWorld('top', 10, 0)) / 2
    expect(half).toBeGreaterThan(linearHalf)
    const fallHalf = moleLiftWorld('falling', 10, 5)
    const linearFall =
      (moleLiftWorld('top', 10, 0) + moleLiftWorld('off', 10, 0)) / 2
    expect(fallHalf).toBeGreaterThan(linearFall)
  })
})
