import { HAMMER_STRIKE_FRAMES } from '../spec'
import type { GameState, HoleIndex } from '../types'
import { retireHole } from './holes'
import { emit, HOLES, hurt } from './shared'
import {
  strikeBossKill,
  strikeItemPickup,
  strikeMiss,
  strikeMobKill,
  strikeShop,
  strikeTreasure,
  tickGunAfterKill,
} from './strikeResolve'

export function resolveStrike(state: GameState, hole: HoleIndex): void {
  const slot = state.holes[hole]
  const dmg = state.playerAttack
  const frame = slot.enemy.catalogFrame

  if (
    slot.phase === 'off' ||
    slot.enemy.kind === 'none' ||
    (slot.phase === 'falling' && !state.wing)
  ) {
    strikeMiss(state, hole)
    return
  }

  if (slot.enemy.kind === 'treasure') {
    strikeTreasure(state, hole)
    return
  }

  if (slot.enemy.kind === 'shop') {
    strikeShop(state, hole)
    return
  }

  if (slot.enemy.kind === 'item') {
    strikeItemPickup(state, hole)
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

  strikeMobKill(state, hole, frame)

  if (slot.enemy.kind === 'boss') {
    strikeBossKill(state, hole)
    return
  }

  retireHole(state, hole, false)
  tickGunAfterKill(state)
}

export function triggerHammerStrike(state: GameState, hole: HoleIndex): void {
  const existing = state.hammerStrikes.find((strike) => strike.hole === hole)
  if (existing) {
    existing.frame = 0
    return
  }
  state.hammerStrikes.push({ hole, frame: 0 })
}

export function tickHammerStrikes(state: GameState): void {
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

export function flushHits(state: GameState): void {
  while (state.pendingHits.length > 0 && state.pikoOk) {
    const hole = state.pendingHits.shift()
    if (hole === undefined) {
      break
    }
    state.pikoOk = false
    state.levelStats.swings += 1
    if (state.gun > 0) {
      emit(state, { kind: 'hit', sfx: 'gun' })
      for (const holeIndex of HOLES) {
        if (state.holes[holeIndex].phase !== 'off') {
          triggerHammerStrike(state, holeIndex)
          resolveStrike(state, holeIndex)
        }
      }
    } else {
      resolveStrike(state, hole)
    }
    state.pikoOk = true
  }
}
