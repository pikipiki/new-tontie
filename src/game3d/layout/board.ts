import { HOLE_POS } from '@game/layout'
import type { HoleIndex } from '@game/types'

/** Flash board 400×400 → world units (board ≈ 4.2 wide). */
const SCALE = 4.2 / 400
const ORIGIN_X = 200
const ORIGIN_Z = 200

export function holeWorldPosition(hole: HoleIndex): [number, number, number] {
  const { x: gridX, y: gridY } = HOLE_POS[hole]
  const worldX = (gridX + 36 - ORIGIN_X) * SCALE
  const worldZ = (gridY + 36 - ORIGIN_Z) * SCALE
  return [worldX, 0, worldZ]
}

/**
 * Invisible tap volume per hole: almost the full cell between neighbours (106 × 80 SWF px),
 * so fingers do not need to land exactly on the pit.
 */
export const HOLE_TAP_WIDTH = 106 * SCALE * 0.97
export const HOLE_TAP_DEPTH = 80 * SCALE * 0.97

export const BOARD_WIDTH = 4.2
export const BOARD_DEPTH = 4.2
/** World Y of the tile tops (board.glb tile top is at local y = 0). */
export const BOARD_SURFACE_Y = 0.36

import type { MolePhase } from '@game/types'

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
  const phaseBlend = Math.min(1, phaseTicks / Math.max(1, koma))
  if (phase === 'rising') {
    return -depth + (1 - (1 - phaseBlend) ** 2) * travel
  }
  if (phase === 'top') {
    return -MOLE_TOP_SINK
  }
  return -MOLE_TOP_SINK - phaseBlend * phaseBlend * travel
}

/** Mobs lean back so their front faces the camera instead of the horizon. */
export const MOB_TILT_X = -0.22

/** The companion lives below and in front of the complete 3×3 touch grid. */
export const PINK_LEDGE_POSITION: [number, number, number] = [-1.35, -0.26, 2.5]
export const PINK_LEDGE_SCALE = 1.3
