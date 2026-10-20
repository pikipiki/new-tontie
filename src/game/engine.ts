import { syncPlayerAttack } from './combat'
import { ensureGameFeaturesLoaded } from './features'
import { runRoundRules } from './features'
import { isBossLevel } from './enemies'
import { buyShopOffer } from './shop'
import { FPS, INIT, ROUND_SECONDS, hammerDamage } from './spec'
import type { GameState, HoleIndex } from './types'
export {
  BOMB_FRAMES,
  HURRY_FRAMES,
  ITEM_SFX,
  LEVEL_CLEAR_FRAMES,
  introCatalogFrame,
  statPercent,
} from './engine/constants'
export { beginRound } from './engine/progression'
import { retireHole, trySpawn, tickHole } from './engine/holes'
import { afterLevelClear, beginRound, nextLevel } from './engine/progression'
import {
  flushHits,
  tickHammerStrikes,
  triggerHammerStrike,
} from './engine/strike'
import {
  drainEvents,
  emit,
  emptyHole,
  freshStats,
  HOLES,
} from './engine/shared'

export { drainEvents }

export function createInitialState(): GameState {
  const holes = {} as Record<HoleIndex, import('./types').HoleState>
  for (const hole of HOLES) {
    holes[hole] = emptyHole()
  }

  const state: GameState = {
    phase: 'levelIntro',
    level: 1,
    score: 0,
    money: INIT.money,
    hp: INIT.heartMax,
    hpMax: INIT.heartMax,
    hammerLv: INIT.hammerLv,
    continues: INIT.continues,
    roundFramesLeft: ROUND_SECONDS * FPS,
    roundFrameCounter: 0,
    kakurituOrg: INIT.kakurituOrg,
    koma: INIT.koma,
    topStay: INIT.topStay,
    kakurituCounter: INIT.kakurituOrg,
    moguraOn: 0,
    pikoOk: true,
    pendingHits: [],
    hammerStrikes: [],
    holes,
    bossSpawned: false,
    lvup: 0,
    shopL: 0,
    lvUpSikakuK: FPS * ROUND_SECONDS,
    wing: false,
    stone: false,
    gun: 0,
    gunAmmo: 0,
    bronze: false,
    silver: false,
    gold: false,
    monsterL: 0,
    monsterLs: 0,
    monsterLsNext: 2,
    lvSilver: 0,
    chousei: INIT.chousei,
    sekiban1: false,
    sekiban2: false,
    sekiban3: false,
    playerAttack: hammerDamage(INIT.hammerLv),
    levelStats: freshStats(0),
    lastClear: null,
    clearFramesLeft: 0,
    shopResume: false,
    events: [],
  }
  return state
}

export { addCoin } from './money'

/** START on the level panel (up_boad "go"): the round and its music begin. */
export function startLevel(state: GameState): void {
  if (state.phase !== 'levelIntro') {
    return
  }
  state.phase = 'playing'
  state.pikoOk = true
  emit(state, {
    kind: 'roundStart',
    music: isBossLevel(state.level) ? 'boss' : 'game',
  })
}

/** The original Continue button spends one credit, resets score and halves coins. */
export function continueGame(state: GameState): boolean {
  if (state.phase !== 'gameOver' || state.continues <= 0) return false
  state.continues -= 1
  state.hp = state.hpMax
  state.score = 0
  state.money = Math.round(state.money / 2)
  state.gun = 0
  state.gunAmmo = 0
  state.stone = false
  for (const hole of HOLES) retireHole(state, hole, false)
  beginRound(state)
  return true
}

export function queueHit(state: GameState, hole: HoleIndex): void {
  if (!state.pikoOk || state.phase !== 'playing') {
    return
  }
  state.pendingHits.push(hole)
  if (state.gun === 0) {
    triggerHammerStrike(state, hole)
  }
}

export function togglePause(state: GameState): void {
  if (state.phase === 'playing') {
    state.phase = 'paused'
    emit(state, { kind: 'pause', sfx: 'pause' })
  } else if (state.phase === 'paused') {
    state.phase = 'playing'
    emit(state, { kind: 'resume', sfx: 'pause_kaijo' })
  }
}

/** up_boad "shop_out": a merchant shop resumes the round where it stopped (AS lv_con). */
export function closeShop(state: GameState): void {
  if (state.phase !== 'shop') {
    return
  }
  if (state.shopResume) {
    state.shopResume = false
    state.phase = 'playing'
    state.pikoOk = true
    emit(state, { kind: 'resume' })
    return
  }
  nextLevel(state)
}

export function buyHammerUpgrade(state: GameState): boolean {
  const purchased = buyShopOffer(state, state.hammerLv - 1)
  if (purchased) {
    syncPlayerAttack(state)
  }
  return purchased
}

export function buyShopIndex(state: GameState, index: number): boolean {
  if (state.phase !== 'shop') {
    return false
  }
  const purchased = buyShopOffer(state, index)
  if (purchased) {
    syncPlayerAttack(state)
  }
  emit(
    state,
    purchased
      ? { kind: 'buy', sfx: 'buy', offer: index }
      : { kind: 'noBuy', sfx: 'no_buy', offer: index },
  )
  return purchased
}

export function tick(state: GameState, random: () => number): GameState {
  ensureGameFeaturesLoaded()
  if (state.phase === 'levelClear') {
    state.clearFramesLeft -= 1
    if (state.clearFramesLeft <= 0) {
      afterLevelClear(state)
    }
    return state
  }
  if (
    state.phase === 'levelIntro' ||
    state.phase === 'paused' ||
    state.phase === 'shop' ||
    state.phase === 'gameOver' ||
    state.phase === 'win'
  ) {
    return state
  }

  flushHits(state)
  tickHammerStrikes(state)

  state.roundFramesLeft -= 1
  state.roundFrameCounter += 1
  runRoundRules('after-clock', state, random)

  trySpawn(state, random)
  for (const hole of HOLES) {
    tickHole(state, hole)
  }

  runRoundRules('after-spawn', state, random)

  return state
}

export function numpadToHole(key: string): HoleIndex | null {
  const digit = Number(key)
  if (digit >= 1 && digit <= 9) {
    return digit as HoleIndex
  }
  return null
}
