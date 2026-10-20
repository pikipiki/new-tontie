import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialState } from '@game/engine'
import { GameSession, playEvents } from '@hooks/useTontieGameSession'
import { createFx } from '@game3d/fxState'
import { playMusic, playSfx, setMusicPaused, stopMusic } from '@game/audio'

vi.mock('@game/audio', () => ({
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
