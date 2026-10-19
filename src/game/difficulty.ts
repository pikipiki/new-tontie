import { INIT } from './spec'
import type { GameState } from './types'

/** frame_141 / DefineSprite_559 — lv_set() */
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
  for (let i = 0; i < times; i++) {
    applyLvSet(state)
  }
}
