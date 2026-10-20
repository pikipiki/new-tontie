import { Vector3, type Group } from 'three'
import type { GameState, HoleIndex } from '@game/types'
import { BOARD_SURFACE_Y } from './layout3d'
import { fxProgress, type GameFx } from './fxState'
import { strikeHitY, strikeAnchor } from './plushPlayerFlightHelpers'

import { LASER_SHOT_MS, LASER_MUZZLE } from './laserLayout'
export { LASER_SHOT_MS } from './laserLayout'
const LASER_UP = new Vector3(0, 1, 0)

export function laserIsEquipped(
  state: GameState,
  gameFx: GameFx,
  now: number,
): boolean {
  return (
    state.gun > 0 ||
    (gameFx.laser !== null &&
      fxProgress(gameFx.laser.at, now, LASER_SHOT_MS) !== null)
  )
}

function laserTarget(
  state: GameState,
  gameFx: GameFx,
  hole: HoleIndex,
  now: number,
  target: Vector3,
) {
  const heightScale =
    state.adventure?.boss && [7, 8, 9].includes(hole) ? 1 : 0.65
  const anchor = strikeAnchor(state, hole)
  target.set(
    anchor[0],
    BOARD_SURFACE_Y +
      Math.max(0.1, strikeHitY(state, gameFx, hole, now, false) * heightScale),
    anchor[2],
  )
}

function aimLaserAt(weapon: Group, target: Vector3) {
  const aim = target.clone()
  for (let iteration = 0; iteration < 4; iteration++) {
    weapon.lookAt(aim)
    const barrelOffset = weapon
      .localToWorld(new Vector3(0, LASER_MUZZLE[1], 0))
      .sub(weapon.getWorldPosition(new Vector3()))
    aim.copy(target).sub(barrelOffset)
  }
  weapon.lookAt(aim)
}

/** World-space aiming keeps both the gun's grip and the beam's muzzle attached to the hand. */
export function updateLaserPresentation(
  weapon: Group,
  muzzle: Group,
  flash: Group,
  beam: Group,
  state: GameState,
  gameFx: GameFx,
  now: number,
) {
  const shot = gameFx.laser
  const progress = shot ? fxProgress(shot.at, now, LASER_SHOT_MS) : null
  const target = new Vector3()
  laserTarget(state, gameFx, shot?.hole ?? 5, now, target)
  aimLaserAt(weapon, target)
  const start = muzzle.getWorldPosition(new Vector3())
  flash.visible = progress !== null
  flash.scale.setScalar(progress === null ? 0 : (1 - progress) * 1.1)
  beam.visible = progress !== null
  if (!beam.visible || !shot) return
  laserTarget(state, gameFx, shot.hole, now, target)
  const direction = target.clone().sub(start)
  beam.position.copy(start).add(target).multiplyScalar(0.5)
  beam.quaternion.setFromUnitVectors(LASER_UP, direction.clone().normalize())
  const radius = 0.018 * (1 - (progress ?? 0) * 0.85)
  beam.scale.set(radius, direction.length(), radius)
}
