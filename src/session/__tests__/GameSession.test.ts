import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialState, queueHit, startLevel, tick } from '@game/engine'
import { HOLES } from '@game/engine/shared'
import { chooseUpgrade } from '@game/adventure/state'
import { GameSession, playEvents } from '@/session/GameSession'
import { createFx } from '@game3d/fxState'
import { playMusic, playSfx, setMusicPaused, stopMusic } from '@/audio'

function autoStrike(state: ReturnType<typeof createInitialState>) {
  const adventure = state.adventure
  if (!adventure || state.phase !== 'playing') return
  if (adventure.stolenWeapon) {
    queueHit(
      state,
      adventure.stolenWeapon.holder ?? adventure.stolenWeapon.dropHole,
    )
    return
  }
  if (adventure.boss) {
    if (!adventure.boss.warning) queueHit(state, adventure.boss.weak)
  }
  for (const hole of HOLES) {
    const actor = adventure.actors[hole]
    if (actor && actor.role !== 'innocent' && actor.role !== 'boss')
      queueHit(state, hole)
  }
}

vi.mock('@/audio', () => ({
  playSfx: vi.fn(),
  playMusic: vi.fn(),
  stopMusic: vi.fn(),
  setMusicPaused: vi.fn(),
}))

describe('GameSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores an injectable random source', () => {
    const session = new GameSession({ random: () => 0.25 })
    expect(session.random()).toBe(0.25)
  })

  it('reset replaces state and fx', () => {
    const session = new GameSession()
    session.gameFx.holes[5].hitAt = 99
    session.state.level = 9
    session.reset()
    expect(session.state.level).toBe(1)
    expect(session.gameFx.holes[5].hitAt).toBeLessThan(0)
  })

  it('flush drains engine events into fx and clock', () => {
    const session = new GameSession()
    const clock = vi.fn()
    session.state.events.push({ kind: 'intro' })
    vi.spyOn(performance, 'now').mockReturnValue(42_000)
    session.flush(clock)
    expect(session.gameFx.introAt).toBe(42_000)
    expect(clock).toHaveBeenCalledWith(42_000)
    expect(session.state.events).toHaveLength(0)
  })

  it('runs a complete 6-mission campaign through GameSession with event flushing and achieves victory', () => {
    let entropy = 4431
    const random = () => {
      entropy = (entropy * 1664525 + 1013904223) >>> 0
      return entropy / 4294967296
    }
    let clockTime = 1000
    const session = new GameSession({
      adventure: true,
      random,
      clock: () => clockTime,
    })
    const setClock = (timestamp: number) => {
      clockTime = timestamp
    }

    for (
      let frame = 0;
      frame < 6000 &&
      session.state.phase !== 'win' &&
      session.state.phase !== 'gameOver';
      frame++
    ) {
      clockTime += 58.8
      if (session.state.phase === 'levelIntro') startLevel(session.state)
      if (session.state.phase === 'levelClear') {
        const offer = session.state.adventure?.offers[0]
        if (offer) chooseUpgrade(session.state, offer)
      }
      autoStrike(session.state)
      tick(session.state, random)
      session.flush(setClock)
    }

    expect(session.state.phase).toBe('win')
    expect(session.state.adventure?.stage).toBe(6)
    expect(session.state.adventure?.upgrades).toHaveLength(5)
    expect(session.state.hp).toBeGreaterThan(0)
  })
})

describe('playEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('routes audio side effects and fx timestamps', () => {
    const state = createInitialState()
    const gameFx = createFx()
    vi.spyOn(performance, 'now').mockReturnValue(1_000)
    playEvents(
      [
        { kind: 'hit', hole: 3, sfx: 'hit' },
        { kind: 'pause' },
        { kind: 'resume' },
        { kind: 'pickup', hole: 1, music: 'game' },
        { kind: 'gameOver', music: 'stop' },
      ],
      state,
      gameFx,
    )
    expect(playSfx).toHaveBeenCalledWith('hit')
    expect(setMusicPaused).toHaveBeenCalledWith(true)
    expect(setMusicPaused).toHaveBeenCalledWith(false)
    expect(playMusic).toHaveBeenCalledWith('game')
    expect(stopMusic).toHaveBeenCalled()
    expect(gameFx.holes[3].hitAt).toBe(1_000)
    expect(gameFx.holes[1].pickupAt).toBe(1_000)
  })
})
