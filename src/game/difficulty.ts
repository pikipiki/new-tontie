import { INIT } from './spec'
import type { GameState } from './types'

/** frame_141 lv_set() — Silver mode only (game_silver burst + DefineSprite_670 kill ramp). */
export function applyLvSet(state: GameState): void {
  if (state.kakurituOrg > 2) {
    state.kakurituOrg -= INIT.upKakuritu
    if (state.kakurituOrg < 2) {
      state.kakurituOrg = 2
    }
  }
  if (state.koma > 1) {
    state.koma -= INIT.upChar
  }
  if (state.topStay > 1) {
    state.topStay -= INIT.upTop * state.chousei
  }
}

export function applyLvSetBurst(state: GameState, times: number): void {
  for (let index = 0; index < times; index++) {
    applyLvSet(state)
  }
}

/**
 * Normal mode level up — DefineSprite_590 frame 3: one step per level, floored at
 * up_kakuritu_mx / up_char_mx / up_top_mx.
 */
export function applyLevelUpRamp(state: GameState): void {
  if (state.kakurituOrg > INIT.upKakurituMx) {
    state.kakurituOrg = Math.max(
      INIT.upKakurituMx,
      state.kakurituOrg - INIT.upKakuritu,
    )
  }
  if (state.koma > INIT.upCharMx) {
    state.koma -= INIT.upChar
  }
  if (state.topStay > INIT.upTopMx) {
    state.topStay -= INIT.upTop
  }
}
