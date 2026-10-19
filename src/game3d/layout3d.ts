import { HOLE_POS, MOLE_RISE_DEPTH } from '@/game/layout'
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

export function moleLiftWorld(phase: MolePhase, koma: number, phaseTicks: number): number {
  const depth = MOLE_RISE_DEPTH * SCALE
  if (phase === 'off') {
    return -depth
  }
  if (phase === 'rising') {
    return -depth + (phaseTicks / koma) * depth
  }
  if (phase === 'top') {
    return 0
  }
  return -(phaseTicks / koma) * depth
}

export function hammerStrikeAngle(frame: number, frameCount: number): number {
  const t = frame / Math.max(1, frameCount - 1)
  if (t < 0.35) {
    return -t / 0.35 * (Math.PI / 2)
  }
  if (t < 0.55) {
    return -Math.PI / 2
  }
  return -Math.PI / 2 + ((t - 0.55) / 0.45) * (Math.PI / 2)
}

export const BOARD_WIDTH = 4.2
export const BOARD_DEPTH = 4.2
/** Top of play cells (BoardProcedural3D). */
export const BOARD_SURFACE_Y = 0.36
