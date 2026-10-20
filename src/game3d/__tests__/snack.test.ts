import { describe, expect, it } from 'vitest'
import { Group } from 'three'
import { pinkSnackPose, PINK_SNACK_SECONDS } from '@game3d/plushAnimation'
import { snackAge } from '@game3d/snackRig'

describe('whole donut eating cycle', () => {
  it('eats all four quarters before a new whole donut appears', () => {
    expect(
      [0.5, 1.1, 3.6, 6.1, 8.6].map((time) => pinkSnackPose(time).remaining),
    ).toEqual([4, 3, 2, 1, 0])
    expect(pinkSnackPose(9.9).donutScale).toBe(0)
    expect(pinkSnackPose(PINK_SNACK_SECONDS + 0.3).remaining).toBe(4)
    expect(pinkSnackPose(PINK_SNACK_SECONDS + 0.3).donutScale).toBe(1)
  })
  it('pauses the bite during a flight instead of replacing the partly eaten donut', () => {
    const root = new Group(),
      parent = new Group()
    parent.add(root)
    const clock = { current: { age: 0, last: null as number | null } }
    snackAge(root, clock, 10)
    expect(snackAge(root, clock, 14)).toBe(4)
    expect(pinkSnackPose(clock.current.age).remaining).toBe(2)
    parent.visible = false
    expect(snackAge(root, clock, 15)).toBeNull()
    parent.visible = true
    expect(snackAge(root, clock, 20)).toBe(4)
    expect(pinkSnackPose(clock.current.age).remaining).toBe(2)
  })
})
