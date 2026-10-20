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
  let shopRoll: number

  if (level === 10 || level === 20) {
    shopRoll = Math.floor(random() * 35)
  } else if (state.shopL === 0) {
    const divisor = Math.max(1, state.lvUpSikakuK / FPS)
    shopRoll = Math.floor(random() * divisor)
  } else {
    shopRoll = 1
  }

  if (shopRoll !== 0) {
    const treasureRoll = Math.floor(random() * 80)
    if (treasureRoll !== 0) {
      const catalogFrame = Math.floor(random() * level + 5)
      return { type: 'mob', catalogFrame }
    }
    return { type: 'treasure' }
  }

  state.shopL = 1
  return { type: 'shop' }
}
