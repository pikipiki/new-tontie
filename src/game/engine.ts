import {
  applyDamage,
  applyItem,
  heal,
  onEnemyKilled,
  syncPlayerAttack,
} from './combat'
import { applyLevelUpRamp } from './difficulty'
import {
  bossForLevel,
  holeBlockedForRandomSpawn,
  isBossLevel,
  rollEnemyForHole,
} from './enemies'
import { addCoin } from './money'
import { buyShopOffer } from './shop'
import {
  BOSS_HOLE,
  FPS,
  INIT,
  ROUND_SECONDS,
  SHOP_LEVELS,
  hammerDamage,
  HAMMER_STRIKE_FRAMES,
} from './spec'
import type {
  EnemySpawn,
  GameEvent,
  GameState,
  HoleIndex,
  HoleState,
  ItemId,
  LevelStats,
  SoundLabel,
} from './types'

const HOLES: HoleIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/** Catalog frames drawn as bombs; their se is "bokan" (DefineSprite_458 frames 12/23). */
export const BOMB_FRAMES: readonly number[] = [12, 21, 23]

/** DefineSprite_590 turns the boss timer red, then DefineSprite_589 frame 12 plays "hurry". */
export const HURRY_FRAMES = FPS * 5

/** up_boad "up" (frame 26) → frame 71 where `_root.lv += 1` and the next panel opens. */
export const LEVEL_CLEAR_FRAMES = 45

/** Each level opens with up_boad "on": the monster it introduces is DefineSprite_458 frame lv + 4. */
export function introCatalogFrame(level: number): number {
  return level + 4
}

const MAX_EVENTS = 64

function freshStats(score: number): LevelStats {
  return { swings: 0, misses: 0, monsters: 0, lost: 0, scoreStart: score }
}

/** up_boad frame 67: Math.round((total - bad) / total * 1000) / 10. */
export function statPercent(total: number, bad: number): number {
  if (total <= 0) return 100
  return Math.round(((total - bad) / total) * 1000) / 10
}

function countsAsMonster(enemy: EnemySpawn): boolean {
  return (
    enemy.kind !== 'shop' && enemy.kind !== 'treasure' && enemy.kind !== 'none'
  )
}

/** DefineSprite_669 `se` per item. */
export const ITEM_SFX: Record<ItemId, SoundLabel> = {
  life: 'life_get',
  utsuwa: 'sp_get',
  coin: 'coin_get',
  stone: 'crystal_get',
  gun: 'gun_get',
  wing: 'sp_get',
  allcoin: 'allcoin_get',
  alllife: 'alllife_get',
  hammer1: 'item_on',
  hammer2: 'item_on',
  hammer3: 'item_on',
  hammer4: 'item_on',
  sekiban1: 'sekiban',
  sekiban2: 'sekiban',
  sekiban3: 'sekiban',
}

function emit(state: GameState, event: GameEvent): void {
  state.events.push(event)
  if (state.events.length > MAX_EVENTS) {
    state.events.splice(0, state.events.length - MAX_EVENTS)
  }
}

/** Returns and clears pending events (UI drains after every tick / action). */
export function drainEvents(state: GameState): GameEvent[] {
  const out = state.events
  state.events = []
  return out
}

function hurt(state: GameState, amount: number, hole?: HoleIndex): void {
  if (applyDamage(state, amount)) {
    emit(state, { kind: 'damage', hole, sfx: 'damage' })
  } else {
    emit(state, { kind: 'guard', hole, sfx: 'no_damege' })
  }
}

function emptyHole(): HoleState {
  return {
    phase: 'off',
    phaseTicks: 0,
    enemy: { kind: 'none', hp: 0, maxHp: 0, attack: 0, score: 0 },
    nikaiRemaining: 0,
  }
}

export function createInitialState(): GameState {
  const holes = {} as Record<HoleIndex, HoleState>
  for (const h of HOLES) {
    holes[h] = emptyHole()
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

function activateHole(
  state: GameState,
  hole: HoleIndex,
  enemy: EnemySpawn,
): void {
  const slot = state.holes[hole]
  if (slot.phase !== 'off') {
    return
  }
  slot.enemy = { ...enemy }
  slot.nikaiRemaining = enemy.nikai ? 1 : enemy.kind === 'twoHit' ? 1 : 0
  slot.phase = 'rising'
  slot.phaseTicks = 0
  state.moguraOn += 1
  if (countsAsMonster(enemy)) state.levelStats.monsters += 1
  if (enemy.kind === 'boss') {
    emit(state, { kind: 'boss', hole, frame: enemy.catalogFrame })
  }
}

function trySpawn(state: GameState, random: () => number): void {
  if (state.phase !== 'playing' || state.moguraOn >= 9 || state.lvup > 0) {
    return
  }

  if (!state.bossSpawned && isBossLevel(state.level)) {
    state.bossSpawned = true
    activateHole(state, BOSS_HOLE, bossForLevel(state.level))
    return
  }

  state.kakurituCounter -= 1
  if (state.kakurituCounter > 0) {
    return
  }
  state.kakurituCounter = state.kakurituOrg

  const candidates = HOLES.filter((h) => {
    if (holeBlockedForRandomSpawn(state.level, h)) {
      return false
    }
    return state.holes[h].phase === 'off'
  })
  if (candidates.length === 0) {
    return
  }

  const hole = candidates[Math.floor(random() * candidates.length)]
  if (hole === undefined) {
    return
  }
  const enemy = rollEnemyForHole(state, random)
  activateHole(state, hole, enemy)
}

function retireHole(state: GameState, hole: HoleIndex, escaped: boolean): void {
  const slot = state.holes[hole]
  if (slot.phase === 'off') {
    return
  }
  if (escaped && countsAsMonster(slot.enemy)) state.levelStats.lost += 1
  if (escaped && slot.enemy.attack > 0) {
    hurt(state, slot.enemy.attack, hole)
  }
  slot.phase = 'off'
  slot.phaseTicks = 0
  slot.enemy = { kind: 'none', hp: 0, maxHp: 0, attack: 0, score: 0 }
  slot.nikaiRemaining = 0
  state.moguraOn = Math.max(0, state.moguraOn - 1)
}

function tickHole(state: GameState, hole: HoleIndex): void {
  const slot = state.holes[hole]
  if (slot.phase === 'off') {
    return
  }

  slot.phaseTicks += 1

  if (slot.phase === 'rising') {
    if (slot.phaseTicks >= state.koma) {
      slot.phase = 'top'
      slot.phaseTicks = 0
    }
    return
  }

  if (slot.phase === 'top') {
    if (slot.phaseTicks >= state.topStay) {
      slot.phase = 'falling'
      slot.phaseTicks = 0
    }
    return
  }

  if (slot.phaseTicks >= state.koma) {
    retireHole(state, hole, true)
  }
}

function resolveStrike(state: GameState, hole: HoleIndex): void {
  const slot = state.holes[hole]
  const dmg = state.playerAttack

  const frame = slot.enemy.catalogFrame

  if (
    slot.phase === 'off' ||
    slot.enemy.kind === 'none' ||
    (slot.phase === 'falling' && !state.wing)
  ) {
    emit(state, { kind: 'miss', hole, sfx: 'karaburi' })
    state.levelStats.misses += 1
    hurt(state, INIT.karaburi)
    return
  }

  if (slot.enemy.kind === 'treasure') {
    emit(state, { kind: 'pickup', hole, sfx: 'takara_open' })
    if (slot.enemy.item) {
      applyItem(state, slot.enemy.item)
      emit(state, { kind: 'pickup', hole, sfx: ITEM_SFX[slot.enemy.item] })
    }
    retireHole(state, hole, false)
    return
  }

  if (slot.enemy.kind === 'shop') {
    retireHole(state, hole, false)
    state.phase = 'shop'
    state.shopResume = true
    state.pikoOk = false
    emit(state, { kind: 'shop', hole, sfx: 'shop_in' })
    return
  }

  if (slot.enemy.kind === 'item') {
    if (slot.enemy.item === 'life') {
      heal(state, 8)
      emit(state, { kind: 'pickup', hole, frame, sfx: 'life_get' })
    } else if (slot.enemy.item === 'coin') {
      addCoin(state, slot.enemy.coinSteal ?? 10)
      emit(state, { kind: 'pickup', hole, frame, sfx: 'coin_get' })
    }
    onEnemyKilled(state, slot.enemy)
    retireHole(state, hole, false)
    return
  }

  slot.enemy.hp -= dmg
  if (slot.enemy.hp > 0) {
    emit(state, { kind: 'hit', hole, frame, sfx: 'hit' })
    if (slot.enemy.counterDamage && slot.phase === 'falling') {
      hurt(state, slot.enemy.counterDamage, hole)
    }
    return
  }

  if (slot.nikaiRemaining > 0) {
    slot.nikaiRemaining -= 1
    slot.enemy.hp = slot.enemy.maxHp
    emit(state, { kind: 'hit', hole, frame, sfx: 'kan' })
    return
  }

  const bomb = frame !== undefined && BOMB_FRAMES.includes(frame)
  emit(state, { kind: 'kill', hole, frame, sfx: bomb ? 'bokan' : 'todome' })
  onEnemyKilled(state, slot.enemy)

  if (slot.enemy.kind === 'boss') {
    state.lvup = 1
    state.pikoOk = false
    for (const h of HOLES) {
      if (h !== BOSS_HOLE && state.holes[h].phase !== 'off') {
        heal(state, 4)
        retireHole(state, h, false)
      }
    }
    retireHole(state, hole, false)
    clearLevel(state)
    return
  }

  retireHole(state, hole, false)

  if (state.gun > 0) {
    state.gunAmmo -= 1
    if (state.gunAmmo <= 0) {
      state.gun = 0
      emit(state, { kind: 'pickup', sfx: 'gun_end' })
    }
  }
}

function triggerHammerStrike(state: GameState, hole: HoleIndex): void {
  const existing = state.hammerStrikes.find((s) => s.hole === hole)
  if (existing) {
    existing.frame = 0
    return
  }
  state.hammerStrikes.push({ hole, frame: 0 })
}

function tickHammerStrikes(state: GameState): void {
  if (state.hammerStrikes.length === 0) {
    return
  }
  const next: GameState['hammerStrikes'] = []
  for (const strike of state.hammerStrikes) {
    const frame = strike.frame + 1
    if (frame < HAMMER_STRIKE_FRAMES) {
      next.push({ hole: strike.hole, frame })
    }
  }
  state.hammerStrikes = next
}

function flushHits(state: GameState): void {
  while (state.pendingHits.length > 0 && state.pikoOk) {
    const hole = state.pendingHits.shift()
    if (hole === undefined) {
      break
    }
    state.pikoOk = false
    state.levelStats.swings += 1
    if (state.gun > 0) {
      emit(state, { kind: 'hit', sfx: 'gun' })
      for (const h of HOLES) {
        if (state.holes[h].phase !== 'off') {
          triggerHammerStrike(state, h)
          resolveStrike(state, h)
        }
      }
    } else {
      resolveStrike(state, hole)
    }
    state.pikoOk = true
  }
}

function endRound(state: GameState): void {
  for (const h of HOLES) {
    if (state.holes[h].phase !== 'off') {
      retireHole(state, h, false)
    }
  }
  clearLevel(state)
}

/** up_boad "up": stopAllSounds, stats panel, then the shop or the next level's panel. */
function clearLevel(state: GameState): void {
  const s = state.levelStats
  state.lastClear = {
    level: state.level,
    hitRate: statPercent(s.swings, s.misses),
    beatRate: statPercent(s.monsters, s.lost),
    scoreGained: state.score - s.scoreStart,
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

function afterLevelClear(state: GameState): void {
  if ((SHOP_LEVELS as readonly number[]).includes(state.level)) {
    state.phase = 'shop'
    state.shopResume = false
    emit(state, { kind: 'shop', sfx: 'shop_in' })
    return
  }
  nextLevel(state)
}

function nextLevel(state: GameState): void {
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
  return buyShopOffer(state, state.hammerLv - 1)
}

export function buyShopIndex(state: GameState, index: number): boolean {
  if (state.phase !== 'shop') {
    return false
  }
  const ok = buyShopOffer(state, index)
  if (ok) {
    syncPlayerAttack(state)
  }
  emit(
    state,
    ok
      ? { kind: 'buy', sfx: 'buy', offer: index }
      : { kind: 'noBuy', sfx: 'no_buy', offer: index },
  )
  return ok
}

export function tick(state: GameState, random: () => number): GameState {
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
  if (state.roundFramesLeft === HURRY_FRAMES && isBossLevel(state.level)) {
    emit(state, { kind: 'hurry', sfx: 'hurry' })
  }

  trySpawn(state, random)
  for (const h of HOLES) {
    tickHole(state, h)
  }

  if (state.hp <= 0) {
    state.continues -= 1
    if (state.continues <= 0) {
      state.phase = 'gameOver'
      emit(state, { kind: 'gameOver', music: 'gameover' })
    } else {
      state.hp = state.hpMax
    }
  }

  if (state.roundFramesLeft <= 0) {
    endRound(state)
  }

  return state
}

export function numpadToHole(key: string): HoleIndex | null {
  const n = Number(key)
  if (n >= 1 && n <= 9) {
    return n as HoleIndex
  }
  return null
}

export function hammerDamageExport(hammerLv: number): number {
  return hammerDamage(hammerLv)
}
