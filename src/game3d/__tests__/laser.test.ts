import { describe, expect, it } from 'vitest'
import { Group, Vector3 } from 'three'
import { queueHit, tick, drainEvents } from '@game/engine'
import {
  fresh,
  place,
  neverSpawn,
} from '@game/__tests__/helpers/events.helpers'
import { createFx, recordEvent, syncStrikes } from '@game3d/fx'
import {
  laserIsEquipped,
  updateLaserPresentation,
  LASER_SHOT_MS,
} from '@game3d/laserPresentation'
import { LASER_GRIP, LASER_MUZZLE } from '@game3d/laserLayout'

function shoot(ammo = 50) {
  const state = fresh()
  state.gun = 1
  state.gunAmmo = ammo
  state.hammerLv = 3
  place(state, 1, { kind: 'mob', hp: 1, attack: 0 })
  place(state, 9, { kind: 'mob', hp: 1, attack: 0 })
  queueHit(state, 1)
  tick(state, neverSpawn)
  const gameFx = createFx()
  for (const event of drainEvents(state))
    recordEvent(gameFx, event, state, 1000)
  syncStrikes(gameFx, state, 1000)
  return { state, gameFx }
}

describe('original Tontie ray gun', () => {
  it('equips 50 rounds after a real treasure pickup', () => {
    const state = fresh()
    place(state, 5, { kind: 'treasure', item: 'gun', attack: 0 })
    queueHit(state, 5)
    tick(state, neverSpawn)
    expect(state.gun).toBe(1)
    expect(state.gunAmmo).toBe(50)
    expect(laserIsEquipped(state, createFx(), 1000)).toBe(true)
  })
  it('hits only the clicked hole, spends one round and preserves the other enemies', () => {
    const { state, gameFx } = shoot()
    expect(state.holes[1].phase).toBe('off')
    expect(state.holes[9].phase).toBe('top')
    expect(state.gunAmmo).toBe(49)
    expect(gameFx.laser).toEqual({ at: 1000, hole: 1 })
    expect(laserIsEquipped(state, gameFx, 1200)).toBe(true)
  })
  it('deals 8 damage and spends ammo even when the enemy survives', () => {
    const state = fresh()
    state.gun = 1
    state.gunAmmo = 50
    state.playerAttack = 1
    place(state, 5, { hp: 12, maxHp: 12, attack: 0 })
    queueHit(state, 5)
    tick(state, neverSpawn)
    expect(state.holes[5].enemy.hp).toBe(4)
    expect(state.gunAmmo).toBe(49)
  })
  it('spends a round on an empty hole without the hammer miss health penalty', () => {
    const state = fresh()
    state.gun = 1
    state.gunAmmo = 50
    const health = state.hp
    queueHit(state, 5)
    tick(state, neverSpawn)
    expect(state.hp).toBe(health)
    expect(state.gunAmmo).toBe(49)
    expect(state.levelStats.misses).toBe(1)
  })
  it('finishes the last shot before restoring the previously equipped hammer', () => {
    const { state, gameFx } = shoot(1)
    expect(state.gun).toBe(0)
    expect(state.gunAmmo).toBe(0)
    expect(laserIsEquipped(state, gameFx, 1001)).toBe(true)
    expect(laserIsEquipped(state, gameFx, 1000 + LASER_SHOT_MS)).toBe(false)
    expect(state.hammerLv).toBe(3)
  })
})

describe('held 3D laser', () => {
  it('aligns the single beam with the held barrel, even when rotated and scaled', () => {
    const { state, gameFx } = shoot()
    const plush = new Group(),
      weapon = new Group(),
      muzzle = new Group(),
      flash = new Group(),
      beam = new Group()
    plush.position.set(-1.35, 0.2, 2.5)
    plush.rotation.set(-0.1, 2.5, 0.02)
    plush.scale.setScalar(1.3)
    weapon.position.set(...LASER_GRIP)
    muzzle.position.set(...LASER_MUZZLE)
    plush.add(weapon)
    weapon.add(muzzle)
    muzzle.add(flash)
    updateLaserPresentation(weapon, muzzle, flash, beam, state, gameFx, 1040)
    const beamStart = new Vector3(0, -beam.scale.y / 2, 0)
      .applyQuaternion(beam.quaternion)
      .add(beam.position)
    const beamDirection = new Vector3(0, 1, 0).applyQuaternion(beam.quaternion)
    expect(
      beamStart.distanceTo(muzzle.getWorldPosition(new Vector3())),
    ).toBeLessThan(0.00001)
    expect(
      beamDirection.dot(weapon.getWorldDirection(new Vector3())),
    ).toBeGreaterThan(0.99999)
    expect(beam.visible).toBe(true)
    expect(flash.visible).toBe(true)
    updateLaserPresentation(weapon, muzzle, flash, beam, state, gameFx, 1500)
    expect(flash.visible).toBe(false)
    expect(beam.visible).toBe(false)
  })
})
