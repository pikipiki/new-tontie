import { HOLE_POS } from '@/game/layout'
import type { HoleIndex, MolePhase } from '@/game/types'

/** Flash board 400×400 → world units (board ≈ 4.2 wide). */
const SCALE = 4.2 / 400
const ORIGIN_X = 200
const ORIGIN_Z = 200

export function holeWorldPosition(hole: HoleIndex): [number, number, number] {
  const { x, y } = HOLE_POS[hole]
  const wx = (x + 36 - ORIGIN_X) * SCALE
  const wz = (y + 36 - ORIGIN_Z) * SCALE
  return [wx, 0, wz]
}

/**
 * Invisible tap volume per hole: almost the full cell between neighbours (106 × 80 SWF px),
 * so fingers do not need to land exactly on the pit.
 */
export const HOLE_TAP_WIDTH = 106 * SCALE * 0.97
export const HOLE_TAP_DEPTH = 80 * SCALE * 0.97

/** Default distance below the tile top when fully hidden; callers pass the model height. */
export const MOLE_HIDE_DEPTH = 0.8
/** Feet stay inside the pit when fully up, so mobs read as standing in the hole. */
export const MOLE_TOP_SINK = 0.18

export function moleLiftWorld(
  phase: MolePhase,
  koma: number,
  phaseTicks: number,
  depth: number = MOLE_HIDE_DEPTH,
): number {
  const travel = depth - MOLE_TOP_SINK
  if (phase === 'off') {
    return -depth
  }
  const k = Math.min(1, phaseTicks / Math.max(1, koma))
  if (phase === 'rising') {
    return -depth + (1 - (1 - k) ** 2) * travel
  }
  if (phase === 'top') {
    return -MOLE_TOP_SINK
  }
  return -MOLE_TOP_SINK - k * k * travel
}

/** Fraction of the strike clip at which the head lands (impact ring / burst). */
export const HAMMER_IMPACT_T = 0.42
const HAMMER_RAISED = -1.05
const HAMMER_WINDUP = -1.45

function easeInCubic(x: number): number {
  return x * x * x
}

function easeOutCubic(x: number): number {
  return 1 - (1 - x) ** 3
}

/**
 * Swing angle around the grip (radians about +Z; 0 = head flat on the target, negative = raised)
 * and visibility scale, for strike progress t in [0, 1].
 */
export function hammerSwing(t: number): { angle: number; scale: number } {
  const c = Math.min(1, Math.max(0, t))
  if (c < 0.22) {
    const k = easeOutCubic(c / 0.22)
    return {
      angle: HAMMER_RAISED + (HAMMER_WINDUP - HAMMER_RAISED) * k,
      scale: 0.85 + 0.15 * k,
    }
  }
  if (c < HAMMER_IMPACT_T) {
    const k = easeInCubic((c - 0.22) / (HAMMER_IMPACT_T - 0.22))
    return { angle: HAMMER_WINDUP * (1 - k), scale: 1 }
  }
  if (c < 0.62) {
    const k = (c - HAMMER_IMPACT_T) / (0.62 - HAMMER_IMPACT_T)
    return { angle: -0.12 * Math.sin(k * Math.PI), scale: 1 }
  }
  const k = easeOutCubic((c - 0.62) / 0.38)
  return { angle: HAMMER_RAISED * k, scale: 1 - 0.9 * k }
}

/** hammer.glb: head centre this far along -X from the pivot (the player's shoulder). */
export const HAMMER_REACH = 0.52
export const HAMMER_HEAD_HALF_HEIGHT = 0.16
/** player.glb shoulder (glTF local, feet at y = 0) where the hammer arm attaches. */
export const PLAYER_SHOULDER: readonly [number, number, number] = [
  0.2, 0.48, 0.02,
]
/** The pink Goonk turns towards the hole while still showing its face to the camera. */
export const PLAYER_YAW = -0.95
/** Towards the camera, so the head lands on the front of the monster rather than inside it. */
export const HAMMER_LANE_Z = 0.1
/** The pink Goonk hovers with its feet this high above the top of its target. */
export const PLAYER_HOVER = 0.14

export interface StrikePose {
  /** Shoulder pivot, relative to the hole centre at board level. */
  pivot: [number, number, number]
  /** Extra downward tilt (radians, +Z) when the target is below the shoulder. */
  tilt: number
  /** player.glb origin (feet, hovering), relative to the hole centre at board level. */
  body: [number, number, number]
}

/**
 * Where the pink Goonk stands and swings from so the mallet head lands on `hitY`
 * (top of the monster, or the pit when empty). It floats above its target and swings down.
 */
export function strikePose(hitY: number): StrikePose {
  const [sx, sy, sz] = PLAYER_SHOULDER
  const headY = hitY + HAMMER_HEAD_HALF_HEIGHT + 0.01
  const pivotY = hitY + PLAYER_HOVER + sy
  const tilt = Math.asin(Math.min(1, (pivotY - headY) / HAMMER_REACH))
  const pivotX = HAMMER_REACH * Math.cos(tilt)
  const cos = Math.cos(PLAYER_YAW)
  const sin = Math.sin(PLAYER_YAW)
  const shoulderX = sx * cos + sz * sin
  const shoulderZ = -sx * sin + sz * cos
  return {
    pivot: [pivotX, pivotY, HAMMER_LANE_Z],
    tilt,
    body: [pivotX - shoulderX, pivotY - sy, HAMMER_LANE_Z - shoulderZ],
  }
}

export const BOARD_WIDTH = 4.2
export const BOARD_DEPTH = 4.2
/** World Y of the tile tops (board.glb tile top is at local y = 0). */
export const BOARD_SURFACE_Y = 0.36

export const CAMERA_POSITION: [number, number, number] = [3.4, 4.6, 6.5]
export const CAMERA_TARGET: [number, number, number] = [-0.1, 0.85, 0.1]
/** Vertical FOV that frames the board on a square viewport (the SWF stage is 400×400). */
export const BASE_FOV = 39
const MAX_PORTRAIT_FOV = 56

/**
 * Portrait phones: widen the FOV up to a limit, then dolly back along the view axis
 * so the board's full width stays visible. Landscape keeps the square framing.
 */
export function cameraFit(aspect: number): {
  fov: number
  distanceScale: number
} {
  if (aspect >= 1) {
    return { fov: BASE_FOV, distanceScale: 1 }
  }
  const toRad = Math.PI / 180
  const needTan = Math.tan((BASE_FOV / 2) * toRad) / aspect
  const tan = Math.min(Math.tan((MAX_PORTRAIT_FOV / 2) * toRad), needTan)
  return {
    fov: (2 * Math.atan(tan)) / toRad,
    distanceScale: (needTan / tan) * 1.03,
  }
}

/** Mobs lean back so their front faces the camera instead of the horizon. */
export const MOB_TILT_X = -0.22

/** The companion lives below and in front of the complete 3×3 touch grid. */
export const PINK_LEDGE_POSITION: [number, number, number] = [-1.35, -0.26, 2.5]
export const PINK_LEDGE_SCALE = 1.3

export function sceneCameraView(
  aspect: number,
  photo = false,
): {
  position: [number, number, number]
  target: [number, number, number]
  distanceScale: number
} {
  if (photo)
    return {
      position: CAMERA_POSITION,
      target: CAMERA_TARGET,
      distanceScale: 1,
    }
  return {
    position: aspect < 0.8 ? [0, 6.9, 4.9] : [0, 5.9, 6.1],
    target: [0, 0.6, 0.2],
    distanceScale: aspect >= 0.8 ? 1.16 : 1,
  }
}
