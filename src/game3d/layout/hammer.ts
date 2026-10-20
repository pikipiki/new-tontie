/** Fraction of the strike clip at which the head lands (impact ring / burst). */
export const HAMMER_IMPACT_T = 0.42
const HAMMER_RAISED = -1.05
const HAMMER_WINDUP = -1.45

function easeInCubic(value: number): number {
  return value * value * value
}

function easeOutCubic(value: number): number {
  return 1 - (1 - value) ** 3
}

/**
 * Swing angle around the grip (radians about +Z; 0 = head flat on the target, negative = raised)
 * and visibility scale, for strike progress t in [0, 1].
 */
export function hammerSwing(progress: number): {
  angle: number
  scale: number
} {
  const clamped = Math.min(1, Math.max(0, progress))
  if (clamped < 0.22) {
    const blend = easeOutCubic(clamped / 0.22)
    return {
      angle: HAMMER_RAISED + (HAMMER_WINDUP - HAMMER_RAISED) * blend,
      scale: 0.85 + 0.15 * blend,
    }
  }
  if (clamped < HAMMER_IMPACT_T) {
    const blend = easeInCubic((clamped - 0.22) / (HAMMER_IMPACT_T - 0.22))
    return { angle: HAMMER_WINDUP * (1 - blend), scale: 1 }
  }
  if (clamped < 0.62) {
    const blend = (clamped - HAMMER_IMPACT_T) / (0.62 - HAMMER_IMPACT_T)
    return { angle: -0.12 * Math.sin(blend * Math.PI), scale: 1 }
  }
  const blend = easeOutCubic((clamped - 0.62) / 0.38)
  return { angle: HAMMER_RAISED * blend, scale: 1 - 0.9 * blend }
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
  const [shoulderLocalX, shoulderLocalY, shoulderLocalZ] = PLAYER_SHOULDER
  const headY = hitY + HAMMER_HEAD_HALF_HEIGHT + 0.01
  const pivotY = hitY + PLAYER_HOVER + shoulderLocalY
  const tilt = Math.asin(Math.min(1, (pivotY - headY) / HAMMER_REACH))
  const pivotX = HAMMER_REACH * Math.cos(tilt)
  const cos = Math.cos(PLAYER_YAW)
  const sin = Math.sin(PLAYER_YAW)
  const shoulderX = shoulderLocalX * cos + shoulderLocalZ * sin
  const shoulderZ = -shoulderLocalX * sin + shoulderLocalZ * cos
  return {
    pivot: [pivotX, pivotY, HAMMER_LANE_Z],
    tilt,
    body: [
      pivotX - shoulderX,
      pivotY - shoulderLocalY,
      HAMMER_LANE_Z - shoulderZ,
    ],
  }
}
