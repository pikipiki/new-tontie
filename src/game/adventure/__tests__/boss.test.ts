import { HOLES } from '../../engine/shared'
import { describe, expect, it } from 'vitest'
import { queueHit, tick } from '../../engine'
import { tickActors } from '../interactions'
import { addActor } from './helpers'
import { FPS } from '../../spec'
import { spawnConductor, strikeConductor, tickConductor } from '../boss'
import { adventureGame } from './helpers'

describe('three-hole conductor', () => {
  it('occupies three holes and protects itself until the telegraph completes', () => {
    const { state, adventure } = adventureGame(3)
    spawnConductor(state)
    expect(state.moguraOn).toBe(3)
    strikeConductor(state, 8)
    expect(adventure.progress).toBe(0)
    for (let frame = 0; frame < FPS * 2; frame += 1) tickConductor(state)
    expect(adventure.boss?.warning).toBe(false)
    strikeConductor(state, 7)
    expect(adventure.progress).toBe(0)
    strikeConductor(state, 8)
    expect(adventure.progress).toBe(1)
    expect(adventure.boss?.weak).toBe(9)
  })
  it('punishes missed windows with a table wave and moves its weak point', () => {
    const { state, adventure } = adventureGame(3)
    spawnConductor(state)
    const health = state.hp
    for (let frame = 0; frame < FPS * 5; frame += 1) tickConductor(state)
    expect(state.hp).toBe(health - 6)
    expect(adventure.boss?.wave).toBe(1)
    expect(adventure.boss?.weak).toBe(9)
  })
  it('a gold hammer doubles weak-point damage, while the ray remains one-target damage', () => {
    const { state, adventure } = adventureGame(6)
    adventure.upgrades = ['hammer', 'laser']
    spawnConductor(state)
    if (!adventure.boss) throw new Error('Boss missing')
    adventure.boss.warning = false
    strikeConductor(state, 8)
    expect(adventure.progress).toBe(2)
    adventure.boss.warning = false
    strikeConductor(state, 9, true)
    expect(adventure.progress).toBe(3)
  })
})

describe('boss helpers', () => {
  it('spawns normal-sized helpers in free holes and lets the player hit them separately', () => {
    const { state, adventure } = adventureGame(3)
    for (let frame = 0; frame < FPS * 4 + 1; frame += 1) tick(state, () => 0.3)
    const helper = HOLES.find(
      (hole) => hole < 7 && adventure.actors[hole]?.role !== undefined,
    )
    if (!helper) throw new Error('Helper did not spawn')
    const hole = helper
    const progress = adventure.progress
    queueHit(state, hole)
    tick(state, () => 0.3)
    expect(adventure.progress).toBe(progress)
    expect(adventure.boss?.hp).toBe(6)
    expect(state.holes[hole].nikaiRemaining).toBe(0)
    expect(adventure.actors[7]?.role).toBe('boss')
  })
  it('tinkerers and jesters never give helmets to the boss or swap its weak points', () => {
    const { state, adventure } = adventureGame(6)
    spawnConductor(state)
    addActor(state, 4, 'tinkerer')
    addActor(state, 5, 'prankster')
    for (let frame = 0; frame < FPS * 3; frame += 1) tickActors(state)
    for (const hole of [7, 8, 9] as const) {
      expect(adventure.actors[hole]?.role).toBe('boss')
      expect(state.holes[hole].nikaiRemaining).toBe(0)
    }
  })
})
