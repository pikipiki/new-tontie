import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import {
  bananaFacing,
  bananaThrowPosition,
  bananaArmSwing,
  REDUCED_BANANA_ARC_HEIGHT,
} from '../bananaMotion'
import { holeWorldPosition } from '../layout3d'

describe('bananas announce the swap', () => {
  it('turns both plushes toward one another before releasing their bananas', () => {
    for (const [source, target] of [
      [5, 7],
      [7, 5],
    ] as const) {
      const yaw = bananaFacing(source, target, 0.3)
      const forward = new Vector3(Math.sin(yaw), 0, Math.cos(yaw))
      const origin = holeWorldPosition(source),
        end = holeWorldPosition(target)
      const direction = new Vector3(
        end[0] - origin[0],
        0,
        end[2] - origin[2],
      ).normalize()
      expect(forward.dot(direction)).toBeCloseTo(1)
    }
  })
  it('sends both bananas along high arcs, then into the other plush’s hand', () => {
    const launch = bananaThrowPosition(0.36, 5, 7, false)
    const middle = bananaThrowPosition(0.57, 5, 7, false)
    const catchPosition = bananaThrowPosition(0.9, 5, 7, false)
    expect(middle.y).toBeGreaterThan(launch.y + 0.4)
    expect(catchPosition.distanceTo(launch)).toBeGreaterThan(0.5)
    expect(bananaArmSwing(0.38, false, 1)).toBeLessThan(-1)
    for (const value of bananaThrowPosition(0.6, 7, 5, true).toArray())
      expect(Number.isFinite(value)).toBe(true)
  })
  it('keeps the reduced-motion throw lower but still in the catching hand', () => {
    const full = bananaThrowPosition(0.57, 5, 7, false)
    const reduced = bananaThrowPosition(
      0.57,
      5,
      7,
      false,
      REDUCED_BANANA_ARC_HEIGHT,
    )
    expect(reduced.y).toBeLessThan(full.y - 0.3)
    expect(
      bananaThrowPosition(0.9, 5, 7, false, REDUCED_BANANA_ARC_HEIGHT),
    ).toEqual(bananaThrowPosition(0.9, 5, 7, false))
  })
})
