import { HOLE_ORDER } from '@game/layout'
import type { GameState, HoleIndex } from '@game/types'
import type { GameFx } from '@game3d/fx'
import { PINK_FLIGHT_MS, pinkFlightPose } from '@game3d/plushAnimation'
import {
  BOARD_SURFACE_Y,
  holeWorldPosition,
  moleLiftWorld,
  PINK_LEDGE_POSITION,
  PINK_LEDGE_SCALE,
} from '@game3d/layout3d'
import {
  catalogFrameGlbKey,
  mobGlbHeight,
  mobGlbKey,
} from '@game3d/resolveMobGlb'
import type { Group } from 'three'

export function plushFlightStartFrom(
  continuing: boolean,
  photo: boolean,
  bodyPosition: { x: number; y: number; z: number },
): [number, number, number] {
  if (continuing) {
    return [bodyPosition.x, bodyPosition.y, bodyPosition.z]
  }
  if (photo) {
    return [-1.82, BOARD_SURFACE_Y + 0.02, 1.75]
  }
  return [...PINK_LEDGE_POSITION]
}

export function latestStrikeHole(gameFx: GameFx): {
  latest: number
  hole: HoleIndex
} {
  let latest = -1e9
  let hole: HoleIndex = 5
  for (const index of HOLE_ORDER)
    if (gameFx.holes[index].strikeAt > latest) {
      latest = gameFx.holes[index].strikeAt
      hole = index
    }
  return { latest, hole }
}

export function strikeAnchor(
  state: GameState,
  hole: HoleIndex,
): [number, number, number] {
  const anchor = holeWorldPosition(hole)
  if (state.adventure?.boss && [7, 8, 9].includes(hole))
    anchor[2] += hole === 8 ? 0.95 : 0.15
  return anchor
}

export function strikeHitY(
  state: GameState,
  gameFx: GameFx,
  hole: HoleIndex,
  now: number,
  attract: boolean,
): number {
  if (state.adventure?.boss && [7, 8, 9].includes(hole))
    return hole === 8 ? 2.24 : 1.12
  const slot = state.holes[hole]
  const height = mobGlbHeight(mobGlbKey(slot.enemy))
  const occupied = slot.phase !== 'off' && slot.enemy.kind !== 'none'
  const killed = now - gameFx.holes[hole].killAt < PINK_FLIGHT_MS
  if (attract) {
    return hole === 9 || hole === 3 ? 0.72 : 0.6
  }
  if (occupied) {
    return (
      height +
      moleLiftWorld(slot.phase, state.koma, slot.phaseTicks, height + 0.05)
    )
  }
  if (killed) {
    return mobGlbHeight(catalogFrameGlbKey(gameFx.holes[hole].killFrame)) - 0.18
  }
  return 0.04
}

export function applyPlushIdleMotion(
  root: Group,
  mallet: Group,
  elapsed: number,
): void {
  root.position.y = Math.sin(elapsed * 2) * 0.045 + 0.07
  root.rotation.z = Math.sin(elapsed * 1.6) * 0.015
  mallet.rotation.z = -2.08 + Math.sin(elapsed * 1.8) * 0.045
}

export function applyPlushFlightMotion(
  flight: number,
  photo: boolean,
  capture: {
    y: number
    hole: HoleIndex
    from: [number, number, number]
    anchor?: [number, number, number]
  },
  flyerBody: Group,
  flyerHammer: Group,
): void {
  const pose = pinkFlightPose(
    flight,
    photo ? [-1.82, BOARD_SURFACE_Y + 0.02, 1.75] : PINK_LEDGE_POSITION,
    capture.anchor ?? holeWorldPosition(capture.hole),
    capture.y,
    capture.from,
  )
  flyerBody.position.set(...pose.body)
  const idleScale = photo ? 1.55 : PINK_LEDGE_SCALE
  flyerBody.scale.setScalar(idleScale + (1 - idleScale) * pose.amount)
  flyerBody.rotation.set(
    -0.45 * (1 - pose.amount),
    pose.yaw,
    Math.sin(flight * Math.PI) * -0.08,
  )
  flyerHammer.position.set(...pose.pivot)
  flyerHammer.rotation.z = pose.angle
}
