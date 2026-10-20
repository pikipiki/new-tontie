import { createContext, useContext } from 'react'
import type { GameEvent, GameState, HoleIndex } from '@/game/types'
import { HAMMER_STRIKE_FRAMES, FPS } from '@/game/spec'

/** doka clip length (8 frames @ 17 fps). */
export const STRIKE_MS = (HAMMER_STRIKE_FRAMES / FPS) * 1000
export const HIT_MS = 280
export const KILL_MS = 560
export const SCORE_POP_MS = 900
export const MISS_MS = 420
export const PICKUP_MS = 700
export const DAMAGE_MS = 450
export const BANNER_MS = 1400
/** up_boad "go": the hammer slams START and the panel puffs away. */
export const PANEL_OUT_MS = 520
export const SHOP_FLASH_MS = 650

export type BannerKind = 'boss' | 'hurry'

export interface HoleFx {
  strikeAt: number
  hitAt: number
  killAt: number
  /** Catalog frame of the enemy that was just defeated (kept for the pop-out animation). */
  killFrame: number | null
  killBomb: boolean
  /** Score of the last kill, for the floating "+points" popup. */
  killPoints: number
  missAt: number
  pickupAt: number
}

export interface GameFx {
  holes: Record<HoleIndex, HoleFx>
  damageAt: number
  guardAt: number
  banner: { kind: BannerKind; level: number; at: number } | null
  introAt: number
  startAt: number
  clearAt: number
  shop: { offer: number; ok: boolean; at: number } | null
}

const HOLES: HoleIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const NEVER = -1e9

export function createFx(): GameFx {
  const holes = {} as Record<HoleIndex, HoleFx>
  for (const h of HOLES) {
    holes[h] = {
      strikeAt: NEVER,
      hitAt: NEVER,
      killAt: NEVER,
      killFrame: null,
      killBomb: false,
      killPoints: 0,
      missAt: NEVER,
      pickupAt: NEVER,
    }
  }
  return {
    holes,
    damageAt: NEVER,
    guardAt: NEVER,
    banner: null,
    introAt: NEVER,
    startAt: NEVER,
    clearAt: NEVER,
    shop: null,
  }
}

/** 0..1 while the effect started at `at` is running, otherwise null. */
export function fxProgress(
  at: number,
  now: number,
  durationMs: number,
): number | null {
  const t = (now - at) / durationMs
  return t >= 0 && t < 1 ? t : null
}

export function recordEvent(
  fx: GameFx,
  event: GameEvent,
  state: GameState,
  now: number,
): void {
  const slot = event.hole === undefined ? null : fx.holes[event.hole]
  switch (event.kind) {
    case 'hit':
      if (slot) slot.hitAt = now
      break
    case 'kill':
      if (slot) {
        slot.killAt = now
        slot.killFrame = event.frame ?? null
        slot.killBomb = event.sfx === 'bokan'
        slot.killPoints = event.points ?? 0
      }
      break
    case 'miss':
      if (slot) slot.missAt = now
      break
    case 'pickup':
      if (slot) slot.pickupAt = now
      break
    case 'damage':
      fx.damageAt = now
      break
    case 'guard':
      fx.guardAt = now
      break
    case 'intro':
      fx.introAt = now
      break
    case 'roundStart':
      fx.startAt = now
      break
    case 'levelUp':
      fx.clearAt = now
      break
    case 'buy':
    case 'noBuy':
      fx.shop = { offer: event.offer ?? -1, ok: event.kind === 'buy', at: now }
      break
    case 'boss':
      fx.banner = { kind: 'boss', level: state.level, at: now }
      break
    case 'hurry':
      fx.banner = { kind: 'hurry', level: state.level, at: now }
      break
    default:
      break
  }
}

/** Mirror engine hammer strikes (tap or ray gun) into wall-clock timestamps for smooth swings. */
export function syncStrikes(fx: GameFx, state: GameState, now: number): void {
  for (const strike of state.hammerStrikes) {
    const slot = fx.holes[strike.hole]
    if (strike.frame <= 1 && now - slot.strikeAt > STRIKE_MS * 0.5) {
      slot.strikeAt = now
    }
  }
}

/** Interactive welcome cast uses the same single flying player as the live game. */
export function previewStrike(fx: GameFx, hole: HoleIndex, now: number): void {
  fx.holes[hole].strikeAt = now
  fx.holes[hole].hitAt = now
}

export const GameFxContext = createContext<GameFx>(createFx())

export function useGameFx(): GameFx {
  return useContext(GameFxContext)
}
