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

/** Default distance below the tile top when fully hidden; callers pass the model height. */
export const MOLE_HIDE_DEPTH = 0.8
/** Feet stay inside the pit when fully up, so mobs read as standing in the hole. */
export const MOLE_TOP_SINK = 0.12

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
  if (phase === 'rising') {
    return -depth + (phaseTicks / koma) * travel
  }
  if (phase === 'top') {
    return -MOLE_TOP_SINK
  }
  return -MOLE_TOP_SINK - (phaseTicks / koma) * travel
}

/** 0 = raised, 1 = fully down on the hole. */
export function hammerStrikeDrop(frame: number, frameCount: number): number {
  const t = frame / Math.max(1, frameCount - 1)
  if (t < 0.35) {
    return t / 0.35
  }
  if (t < 0.55) {
    return 1
  }
  return 1 - (t - 0.55) / 0.45
}

export const BOARD_WIDTH = 4.2
export const BOARD_DEPTH = 4.2
/** World Y of the tile tops (board.glb tile top is at local y = 0). */
export const BOARD_SURFACE_Y = 0.36

export const CAMERA_POSITION: [number, number, number] = [0, 4.1, 4.0]
export const CAMERA_TARGET: [number, number, number] = [0, 0.25, 0.3]
/** Mobs lean back so their front faces the camera instead of the horizon. */
export const MOB_TILT_X = -0.45
