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
