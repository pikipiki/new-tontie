import { applyLevelUpRamp } from '../difficulty'
import { syncPlayerAttack } from '../combat'
import { FPS, ROUND_SECONDS, SHOP_LEVELS } from '../spec'
import type { GameState } from '../types'
import { introCatalogFrame, LEVEL_CLEAR_FRAMES, statPercent } from './constants'
import { retireHole } from './holes'
import { emit, freshStats, HOLES } from './shared'

export function endRound(state: GameState): void {
  for (const holeIndex of HOLES) {
    if (state.holes[holeIndex].phase !== 'off') {
      retireHole(state, holeIndex, false)
    }
  }
  clearLevel(state)
}

/** up_boad "up": stopAllSounds, stats panel, then the shop or the next level's panel. */
export function clearLevel(state: GameState): void {
  const levelStats = state.levelStats
  state.lastClear = {
    level: state.level,
    hitRate: statPercent(levelStats.swings, levelStats.misses),
    beatRate: statPercent(levelStats.monsters, levelStats.lost),
    scoreGained: state.score - levelStats.scoreStart,
  }
  state.pikoOk = false
  state.pendingHits = []
  if (state.level >= 20) {
    state.phase = 'win'
    emit(state, { kind: 'win', sfx: 'last', music: 'stop' })
    return
  }
  state.phase = 'levelClear'
  state.clearFramesLeft = LEVEL_CLEAR_FRAMES
  emit(state, { kind: 'levelUp', sfx: 'level_up', music: 'stop' })
}

export function afterLevelClear(state: GameState): void {
  if ((SHOP_LEVELS as readonly number[]).includes(state.level)) {
    state.phase = 'shop'
    state.shopResume = false
    emit(state, { kind: 'shop', sfx: 'shop_in' })
    return
  }
  nextLevel(state)
}

export function nextLevel(state: GameState): void {
  state.level += 1
  applyLevelUpRamp(state)
  beginRound(state)
}

/** Resets the round and opens the level panel; play resumes with {@link startLevel}. */
export function beginRound(state: GameState): void {
  state.roundFramesLeft = ROUND_SECONDS * FPS
  state.roundFrameCounter = 0
  state.bossSpawned = false
  state.lvup = 0
  state.shopL = 0
  state.kakurituCounter = state.kakurituOrg
  state.lvUpSikakuK = FPS * ROUND_SECONDS
  state.phase = 'levelIntro'
  state.pikoOk = false
  state.pendingHits = []
  state.hammerStrikes = []
  state.levelStats = freshStats(state.score)
  syncPlayerAttack(state)
  emit(state, {
    kind: 'intro',
    sfx: 'panel',
    frame: introCatalogFrame(state.level),
  })
}
