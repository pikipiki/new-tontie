import { Euler, Vector3 } from 'three'
import type { HoleIndex } from '@game/types'
import { BOARD_SURFACE_Y, MOB_TILT_X, holeWorldPosition } from './layout3d'

const ARM_AXIS = new Vector3(1, 0, 0)
function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}
export function bananaFacing(
  hole: HoleIndex,
  partner: HoleIndex,
  progress: number,
): number {
  const origin = holeWorldPosition(hole),
    target = holeWorldPosition(partner)
  const turn = clamp(progress / 0.22)
  return (
    Math.atan2(target[0] - origin[0], target[2] - origin[2]) *
    turn *
    turn *
    (3 - 2 * turn)
  )
}
export function bananaArmSwing(
  progress: number,
  reverse: boolean,
  side: number,
): number {
  const phase = clamp(progress - (reverse ? 0.06 : 0))
  if (side < 0) return -Math.sin(clamp((phase - 0.6) / 0.4) * Math.PI) * 1.2
  if (phase < 0.24) return (phase / 0.24) * 0.7
  if (phase < 0.38) return 0.7 - ((phase - 0.24) / 0.14) * 2.5
  return -1.8 * (1 - clamp((phase - 0.38) / 0.36))
}
function bananaPalm(
  hole: HoleIndex,
  partner: HoleIndex,
  progress: number,
  reverse: boolean,
  side: number,
): Vector3 {
  const origin = holeWorldPosition(hole)
  const shoulder = new Vector3(side * 0.27, 0.43, 0.015)
  const palm = new Vector3(side * 0.355, 0.24, 0.205).sub(shoulder)
  palm
    .applyAxisAngle(ARM_AXIS, bananaArmSwing(progress, reverse, side))
    .add(shoulder)
  palm.applyEuler(
    new Euler(MOB_TILT_X, bananaFacing(hole, partner, progress), 0),
  )
  return palm.add(new Vector3(origin[0], BOARD_SURFACE_Y - 0.18, origin[2]))
}
export const BANANA_ARC_HEIGHT = 0.85
export const REDUCED_BANANA_ARC_HEIGHT = 0.3
export function bananaThrowPosition(
  progress: number,
  source: HoleIndex,
  target: HoleIndex,
  reverse: boolean,
  arcHeight = BANANA_ARC_HEIGHT,
): Vector3 {
  const launch = reverse ? 0.42 : 0.36,
    landing = launch + 0.43
  if (progress <= launch)
    return bananaPalm(source, target, progress, reverse, 1)
  if (progress >= landing)
    return bananaPalm(target, source, progress, !reverse, -1)
  const phase = clamp((progress - launch) / (landing - launch))
  const start = bananaPalm(source, target, launch, reverse, 1)
  const end = bananaPalm(target, source, landing, !reverse, -1)
  start.lerp(end, phase)
  start.y += Math.sin(phase * Math.PI) * arcHeight
  return start
}
