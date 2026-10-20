import type { GameEvent, GameState, HoleIndex } from '@game/types'
import { HOLE_ORDER } from '@game/layout'
import { HAMMER_STRIKE_FRAMES, FPS } from '@game/spec'

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
  laser: { at: number; hole: HoleIndex } | null
  damageAt: number
  guardAt: number
  banner: { kind: BannerKind; level: number; at: number } | null
  introAt: number
  startAt: number
  clearAt: number
  shop: { offer: number; ok: boolean; at: number } | null
  slap: { at: number; hole: HoleIndex } | null
}

const NEVER = -1e9

export function createFx(): GameFx {
  const holes = {} as Record<HoleIndex, HoleFx>
  for (const holeIndex of HOLE_ORDER) {
    holes[holeIndex] = {
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
    laser: null,
    damageAt: NEVER,
    guardAt: NEVER,
    banner: null,
    introAt: NEVER,
    startAt: NEVER,
    clearAt: NEVER,
    shop: null,
    slap: null,
  }
}

/** 0..1 while the effect started at `at` is running, otherwise null. */
export function fxProgress(
  startedAt: number,
  now: number,
  durationMs: number,
): number | null {
  const progress = (now - startedAt) / durationMs
  return progress >= 0 && progress < 1 ? progress : null
}

export function recordEvent(
  gameFx: GameFx,
  event: GameEvent,
  state: GameState,
  now: number,
): void {
  const slot = event.hole === undefined ? null : gameFx.holes[event.hole]
  switch (event.kind) {
    case 'hit':
      if (event.sfx === 'gun') {
        const hole = event.hole ?? 5
        gameFx.laser = {
          at: now,
          hole,
        }
        break
      }
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
      if (event.slap && event.hole !== undefined)
        gameFx.slap = { at: now, hole: event.hole }
      break
    case 'damage':
      gameFx.damageAt = now
      break
    case 'guard':
      gameFx.guardAt = now
      break
    case 'intro':
      gameFx.introAt = now
      break
    case 'roundStart':
      gameFx.startAt = now
      break
    case 'levelUp':
      gameFx.clearAt = now
      break
    case 'buy':
    case 'noBuy':
      gameFx.shop = {
        offer: event.offer ?? -1,
        ok: event.kind === 'buy',
        at: now,
      }
      break
    case 'boss':
      gameFx.banner = { kind: 'boss', level: state.level, at: now }
      break
    case 'hurry':
      gameFx.banner = { kind: 'hurry', level: state.level, at: now }
      break
    default:
      break
  }
}

/** Mirror engine hammer strikes (tap or ray gun) into wall-clock timestamps for smooth swings. */
export function syncStrikes(
  gameFx: GameFx,
  state: GameState,
  now: number,
): void {
  for (const strike of state.hammerStrikes) {
    const slot = gameFx.holes[strike.hole]
    if (strike.frame <= 1 && now - slot.strikeAt > STRIKE_MS * 0.5) {
      slot.strikeAt = now
    }
  }
}

/** Interactive welcome cast uses the same single flying player as the live game. */
export function previewStrike(
  gameFx: GameFx,
  hole: HoleIndex,
  now: number,
): void {
  gameFx.holes[hole].strikeAt = now
  gameFx.holes[hole].hitAt = now
}
