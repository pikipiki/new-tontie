import { describe, expect, it } from 'vitest'
import { HOLE_ORDER } from '@game/layout'
import { createInitialState } from '@game/engine'
import {
  createFx,
  fxProgress,
  previewStrike,
  recordEvent,
  STRIKE_MS,
  syncStrikes,
} from '@game3d/fxState'

describe('createFx', () => {
  it('initializes every board hole with idle timestamps', () => {
    const gameFx = createFx()
    for (const hole of HOLE_ORDER) {
      expect(gameFx.holes[hole].killFrame).toBeNull()
      expect(gameFx.holes[hole].strikeAt).toBeLessThan(0)
    }
    expect(gameFx.banner).toBeNull()
    expect(gameFx.shop).toBeNull()
  })
})

describe('fxProgress', () => {
  it('returns normalized progress while the window is open', () => {
    expect(fxProgress(100, 150, 100)).toBe(0.5)
  })

  it('returns null before start and after duration', () => {
    expect(fxProgress(100, 50, 100)).toBeNull()
    expect(fxProgress(100, 200, 100)).toBeNull()
  })
})

describe('recordEvent', () => {
  const state = createInitialState()
  const now = 12_000

  it('writes hole-local and global cues', () => {
    const gameFx = createFx()
    recordEvent(gameFx, { kind: 'hit', hole: 5 }, state, now)
    expect(gameFx.holes[5].hitAt).toBe(now)

    recordEvent(
      gameFx,
      { kind: 'kill', hole: 2, frame: 7, sfx: 'bokan', points: 40 },
      state,
      now + 1,
    )
    expect(gameFx.holes[2].killAt).toBe(now + 1)
    expect(gameFx.holes[2].killFrame).toBe(7)
    expect(gameFx.holes[2].killBomb).toBe(true)
    expect(gameFx.holes[2].killPoints).toBe(40)

    recordEvent(gameFx, { kind: 'damage' }, state, now + 2)
    expect(gameFx.damageAt).toBe(now + 2)

    recordEvent(gameFx, { kind: 'boss' }, { ...state, level: 3 }, now + 3)
    expect(gameFx.banner).toEqual({ kind: 'boss', level: 3, at: now + 3 })

    recordEvent(gameFx, { kind: 'buy', offer: 1 }, state, now + 4)
    expect(gameFx.shop).toEqual({ offer: 1, ok: true, at: now + 4 })

    recordEvent(
      gameFx,
      { kind: 'pickup', hole: 4, sfx: 'sp_get', slap: true },
      state,
      now + 5,
    )
    expect(gameFx.slap).toEqual({ at: now + 5, hole: 4 })
    expect(gameFx.holes[4].pickupAt).toBe(now + 5)
  })
})

describe('syncStrikes', () => {
  it('mirrors fresh hammer swings into strike timestamps', () => {
    const gameFx = createFx()
    const state = createInitialState()
    const now = 20_000
    gameFx.holes[5].strikeAt = now - STRIKE_MS
    state.hammerStrikes = [{ hole: 5, frame: 0 }]
    syncStrikes(gameFx, state, now)
    expect(gameFx.holes[5].strikeAt).toBe(now)
  })
})

describe('previewStrike', () => {
  it('sets strike and hit on the welcome cast hole', () => {
    const gameFx = createFx()
    previewStrike(gameFx, 8, 500)
    expect(gameFx.holes[8].strikeAt).toBe(500)
    expect(gameFx.holes[8].hitAt).toBe(500)
  })
})
