import { describe, expect, it } from 'vitest'
import { enemyFromCatalogFrame } from '@/game/combat'
import {
  createInitialState,
  drainEvents,
  queueHit,
  startLevel,
  tick,
} from '@/game/engine'
import {
  BOARD_SURFACE_Y,
  HAMMER_IMPACT_T,
  HAMMER_REACH,
  PINK_LEDGE_POSITION,
} from './layout3d'
import { pinkFlightPose, plushIsFrightened } from './plushAnimation'

describe('flying pink plush', () => {
  it('leaves home, hovers above the selected violet, then returns home', () => {
    const target = [1.113, 0, -0.693]
    const start = pinkFlightPose(0, PINK_LEDGE_POSITION, target, 0.6)
    const hover = pinkFlightPose(0.45, PINK_LEDGE_POSITION, target, 0.6)
    const end = pinkFlightPose(1, PINK_LEDGE_POSITION, target, 0.6)
    expect(start.body).toEqual(PINK_LEDGE_POSITION)
    expect(end.body).toEqual(PINK_LEDGE_POSITION)
    expect(hover.body[1]).toBeGreaterThan(BOARD_SURFACE_Y + 0.6)
    expect(Math.abs(hover.body[0] - 1.113)).toBeLessThan(0.65)
    expect(Math.abs(hover.body[2] + 0.693)).toBeLessThan(0.4)
  })
  it('keeps the held mallet aligned with the selected hole at impact', () => {
    const pose = pinkFlightPose(
      0.12 + 0.72 * HAMMER_IMPACT_T,
      PINK_LEDGE_POSITION,
      [1.113, 0, -0.693],
      0.6,
    )
    const headX = pose.pivot[0] - HAMMER_REACH * Math.cos(pose.angle)
    expect(headX).toBeCloseTo(1.113, 6)
    expect(pose.body[1]).toBeGreaterThan(BOARD_SURFACE_Y + 0.6)
  })
  it('continues from its current flight position when another target is tapped', () => {
    const current = pinkFlightPose(
      0.35,
      PINK_LEDGE_POSITION,
      [0, 0, 0],
      0.5,
    ).body
    expect(
      pinkFlightPose(0, PINK_LEDGE_POSITION, [-1, 0, 1], 0.6, current).body,
    ).toEqual(current)
  })
})

describe('helmet first hit', () => {
  it('survives one hit, becomes frightened, and is defeated on the next hit', () => {
    const state = createInitialState()
    startLevel(state)
    const enemy = enemyFromCatalogFrame(6)
    state.holes[5] = {
      phase: 'top',
      phaseTicks: 0,
      enemy,
      nikaiRemaining: enemy.nikai ? 1 : 0,
    }
    state.moguraOn = 1
    expect(plushIsFrightened(enemy, state.holes[5].nikaiRemaining)).toBe(false)
    queueHit(state, 5)
    tick(state, () => 0.99)
    expect(state.holes[5].phase).not.toBe('off')
    expect(
      plushIsFrightened(state.holes[5].enemy, state.holes[5].nikaiRemaining),
    ).toBe(true)
    expect(drainEvents(state).some((event) => event.kind === 'hit')).toBe(true)
    queueHit(state, 5)
    tick(state, () => 0.99)
    expect(state.holes[5].phase).toBe('off')
  })
  it('recognises a used extra-hit shield even when the engine restores HP', () => {
    const enemy = { ...enemyFromCatalogFrame(6), hp: 1, maxHp: 1, nikai: true }
    expect(plushIsFrightened(enemy, 1)).toBe(false)
    expect(plushIsFrightened(enemy, 0)).toBe(true)
  })
})
