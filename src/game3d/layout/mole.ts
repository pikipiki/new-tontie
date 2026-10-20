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
