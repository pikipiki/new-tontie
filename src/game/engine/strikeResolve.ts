import { applyItem, heal, onEnemyKilled } from '../combat'
import { addCoin } from '../money'
import { BOSS_HOLE, INIT } from '../spec'
import type { GameState, HoleIndex } from '../types'
import { BOMB_FRAMES, ITEM_SFX } from './constants'
import { retireHole } from './holes'
import { clearLevel } from './progression'
import { emit, HOLES, hurt } from './shared'

export function strikeMiss(
  state: GameState,
  hole: HoleIndex,
  penalize = true,
): void {
  emit(state, { kind: 'miss', hole, sfx: 'karaburi' })
  state.levelStats.misses += 1
  if (penalize) hurt(state, INIT.karaburi)
}

export function strikeTreasure(state: GameState, hole: HoleIndex): void {
  const slot = state.holes[hole]
  emit(state, { kind: 'pickup', hole, sfx: 'takara_open' })
  if (slot.enemy.item) {
    applyItem(state, slot.enemy.item)
    emit(state, { kind: 'pickup', hole, sfx: ITEM_SFX[slot.enemy.item] })
  }
  retireHole(state, hole, false)
}

export function strikeShop(state: GameState, hole: HoleIndex): void {
  retireHole(state, hole, false)
  state.phase = 'shop'
  state.shopResume = true
  state.pikoOk = false
  emit(state, { kind: 'shop', hole, sfx: 'shop_in' })
}

export function strikeItemPickup(state: GameState, hole: HoleIndex): void {
  const slot = state.holes[hole]
  const frame = slot.enemy.catalogFrame
  if (slot.enemy.item === 'life') {
    heal(state, 8)
    emit(state, { kind: 'pickup', hole, frame, sfx: 'life_get' })
  } else if (slot.enemy.item === 'coin') {
    addCoin(state, slot.enemy.coinSteal ?? 10)
    emit(state, { kind: 'pickup', hole, frame, sfx: 'coin_get' })
  }
  onEnemyKilled(state, slot.enemy)
  retireHole(state, hole, false)
}

export function strikeBossKill(state: GameState, hole: HoleIndex): void {
  state.lvup = 1
  state.pikoOk = false
  for (const holeIndex of HOLES) {
    if (holeIndex !== BOSS_HOLE && state.holes[holeIndex].phase !== 'off') {
      heal(state, 4)
      retireHole(state, holeIndex, false)
    }
  }
  retireHole(state, hole, false)
  clearLevel(state)
}

export function strikeMobKill(
  state: GameState,
  hole: HoleIndex,
  frame: number | undefined,
): void {
  const slot = state.holes[hole]
  const bomb = frame !== undefined && BOMB_FRAMES.includes(frame)
  emit(state, {
    kind: 'kill',
    hole,
    frame,
    sfx: bomb ? 'bokan' : 'todome',
    points: slot.enemy.score,
  })
  onEnemyKilled(state, slot.enemy)
}

export function consumeLaserAmmo(state: GameState): void {
  if (state.gun <= 0) {
    return
  }
  state.gunAmmo = Math.max(0, state.gunAmmo - 1)
  if (state.gunAmmo <= 0) {
    state.gun = 0
    emit(state, { kind: 'pickup', sfx: 'gun_end' })
  }
}
