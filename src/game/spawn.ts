import { FPS } from './spec'
import type { GameState } from './types'

export type SpawnDecision =
  | { type: 'mob'; catalogFrame: number }
  | { type: 'treasure' }
  | { type: 'shop' }

/** DefineSprite_459/frame_1 onClipEvent(load) */
export function rollSpawnDecision(
  state: GameState,
  random: () => number,
): SpawnDecision {
  const { level } = state
  let k: number

  if (level === 10 || level === 20) {
    k = Math.floor(random() * 35)
  } else if (state.shopL === 0) {
    const divisor = Math.max(1, state.lvUpSikakuK / FPS)
    k = Math.floor(random() * divisor)
  } else {
    k = 1
  }

  if (k !== 0) {
    const k2 = Math.floor(random() * 80)
    if (k2 !== 0) {
      const catalogFrame = Math.floor(random() * level + 5)
      return { type: 'mob', catalogFrame }
    }
    return { type: 'treasure' }
  }

  state.shopL = 1
  return { type: 'shop' }
}
