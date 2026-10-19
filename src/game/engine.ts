import { applyDamage, applyItem, heal, onEnemyKilled, syncPlayerAttack } from './combat'
import { applyLvSetBurst } from './difficulty'
import { bossForLevel, holeBlockedForRandomSpawn, isBossLevel, rollEnemyForHole } from './enemies'
import { addCoin } from './money'
import { buyShopOffer } from './shop'
import { playSfx } from './audio'
import {
  BOSS_HOLE,
  FPS,
  INIT,
  ROUND_SECONDS,
  SHOP_LEVELS,
  hammerDamage,
  HAMMER_STRIKE_FRAMES,
} from './spec'
import type { EnemySpawn, GameState, HoleIndex, HoleState } from './types'

const HOLES: HoleIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

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
    phase: 'playing',
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
  }
  return state
}

export { addCoin } from './money'

function activateHole(state: GameState, hole: HoleIndex, enemy: EnemySpawn): void {
  const slot = state.holes[hole]
  if (slot.phase !== 'off') {
    return
  }
  slot.enemy = { ...enemy }
  slot.nikaiRemaining = enemy.nikai ? 1 : enemy.kind === 'twoHit' ? 1 : 0
  slot.phase = 'rising'
  slot.phaseTicks = 0
  state.moguraOn += 1
  if (enemy.kind === 'boss') {
    playSfx('boss')
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

  const hole = candidates[Math.floor(random() * candidates.length)]!
  const enemy = rollEnemyForHole(state, random)
  activateHole(state, hole, enemy)
}

function retireHole(state: GameState, hole: HoleIndex, escaped: boolean): void {
  const slot = state.holes[hole]
  if (slot.phase === 'off') {
    return
  }
  if (escaped && slot.enemy.attack > 0) {
    applyDamage(state, slot.enemy.attack)
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

  if (slot.phase === 'falling') {
    if (slot.phaseTicks >= state.koma) {
      retireHole(state, hole, true)
    }
  }
}

function resolveStrike(state: GameState, hole: HoleIndex): void {
  const slot = state.holes[hole]
  const dmg = state.playerAttack

  if (slot.phase === 'off' || slot.enemy.kind === 'none') {
    applyDamage(state, INIT.karaburi)
    playSfx('karaburi')
    return
  }

  if (slot.phase === 'falling' && !state.wing) {
    applyDamage(state, INIT.karaburi)
    playSfx('karaburi')
    return
  }

  if (slot.enemy.kind === 'treasure') {
    if (slot.enemy.item) {
      applyItem(state, slot.enemy.item)
      playSfx('life_get')
    }
    retireHole(state, hole, false)
    return
  }

  if (slot.enemy.kind === 'shop') {
    state.phase = 'shop'
    state.pikoOk = false
    playSfx('shop_in')
    return
  }

  if (slot.enemy.kind === 'item') {
    if (slot.enemy.item === 'life') {
      heal(state, 8)
      playSfx('life_get')
    } else if (slot.enemy.item === 'coin') {
      addCoin(state, slot.enemy.coinSteal ?? 10)
      playSfx('coin_get')
    }
    onEnemyKilled(state, slot.enemy)
    retireHole(state, hole, false)
    return
  }

  slot.enemy.hp -= dmg
  if (slot.enemy.hp > 0) {
    if (slot.enemy.counterDamage && slot.phase === 'falling') {
      applyDamage(state, slot.enemy.counterDamage)
    }
    playSfx('hit')
    return
  }

  if (slot.nikaiRemaining > 0) {
    slot.nikaiRemaining -= 1
    slot.enemy.hp = slot.enemy.maxHp
    playSfx('hit')
    return
  }

  playSfx('todome')
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
    if ((SHOP_LEVELS as readonly number[]).includes(state.level)) {
      state.phase = 'shop'
      playSfx('shop_in')
    } else {
      state.level += 1
      applyLvSetBurst(state, 4)
      beginRound(state)
    }
    retireHole(state, hole, false)
    return
  }

  retireHole(state, hole, false)

  if (state.gun > 0) {
    state.gunAmmo -= 1
    if (state.gunAmmo <= 0) {
      state.gun = 0
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
    if (state.gun > 0) {
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

  if ((SHOP_LEVELS as readonly number[]).includes(state.level)) {
    state.phase = 'shop'
    state.pikoOk = false
    playSfx('shop_in')
    return
  }

  state.level += 1
  if (state.level > 20) {
    state.phase = 'win'
    return
  }
  applyLvSetBurst(state, 4)
  beginRound(state)
}

export function beginRound(state: GameState): void {
  state.roundFramesLeft = ROUND_SECONDS * FPS
  state.roundFrameCounter = 0
  state.bossSpawned = false
  state.lvup = 0
  state.shopL = 0
  state.kakurituCounter = state.kakurituOrg
  state.lvUpSikakuK = FPS * ROUND_SECONDS
  state.phase = 'playing'
  state.pikoOk = true
  state.pendingHits = []
  state.hammerStrikes = []
  syncPlayerAttack(state)
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
  } else if (state.phase === 'paused') {
    state.phase = 'playing'
  }
}

export function closeShop(state: GameState): void {
  if (state.phase !== 'shop') {
    return
  }
  state.level += 1
  if (state.level > 20) {
    state.phase = 'win'
    return
  }
  applyLvSetBurst(state, 4)
  beginRound(state)
}

export function buyHammerUpgrade(state: GameState): boolean {
  return buyShopOffer(state, state.hammerLv - 1)
}

export function buyShopIndex(state: GameState, index: number): boolean {
  const ok = buyShopOffer(state, index)
  if (ok) {
    syncPlayerAttack(state)
  }
  return ok
}

export function tick(state: GameState, random: () => number): GameState {
  if (state.phase === 'paused' || state.phase === 'shop' || state.phase === 'gameOver' || state.phase === 'win') {
    return state
  }

  flushHits(state)
  tickHammerStrikes(state)

  state.roundFramesLeft -= 1
  state.roundFrameCounter += 1

  trySpawn(state, random)
  for (const h of HOLES) {
    tickHole(state, h)
  }

  if (state.hp <= 0) {
    state.continues -= 1
    if (state.continues <= 0) {
      state.phase = 'gameOver'
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
