import { describe, expect, it } from 'vitest'
import {
  continueGame,
  createInitialState,
  drainEvents,
  queueHit,
  startLevel,
  tick,
} from '@game/engine'
import { fresh, neverSpawn } from './helpers/events.helpers'
import { FPS } from '@game/spec'

function knockOut(continues = 10) {
  const state = fresh()
  state.continues = continues
  state.hp = -5
  tick(state, neverSpawn)
  return state
}

describe('finite player health', () => {
  it('ends at zero even with all ten continue credits still available', () => {
    const state = knockOut()
    expect(state.hp).toBe(0)
    expect(state.phase).toBe('gameOver')
    expect(state.continues).toBe(10)
    expect(state.pikoOk).toBe(false)
    expect(drainEvents(state)).toContainEqual({
      kind: 'gameOver',
      music: 'gameover',
    })
    for (let frame = 0; frame < FPS * 5; frame++) tick(state, neverSpawn)
    expect(state.hp).toBe(0)
    queueHit(state, 1)
    expect(state.pendingHits).toEqual([])
    expect(drainEvents(state)).toEqual([])
  })

  it('keeps the lethal hit as game over when time also expires', () => {
    const state = fresh()
    state.hp = 1
    state.roundFramesLeft = 1
    queueHit(state, 1)
    tick(state, neverSpawn)
    expect(state.phase).toBe('gameOver')
    expect(state.hp).toBe(0)
    expect(state.lastClear).toBeNull()
  })

  it('loses health on empty taps until the game ends, without automatic refills', () => {
    const state = fresh()
    state.kakurituCounter = 1000
    for (let strike = 0; strike < 6; strike++) {
      queueHit(state, 1)
      tick(state, neverSpawn)
    }
    expect(state.phase).toBe('gameOver')
    expect(state.hp).toBe(0)
    expect(state.continues).toBe(10)
  })

  it('spends exactly one credit only when the player explicitly continues', () => {
    const state = knockOut(2)
    state.score = 350
    state.money = 101
    state.hammerLv = 3
    expect(continueGame(state)).toBe(true)
    expect(state.phase).toBe('levelIntro')
    expect(state.hp).toBe(state.hpMax)
    expect(state.continues).toBe(1)
    expect(state.score).toBe(0)
    expect(state.money).toBe(51)
    expect(state.hammerLv).toBe(3)
    expect(continueGame(state)).toBe(false)
    expect(state.continues).toBe(1)
    startLevel(state)
    state.hp = 0
    tick(state, neverSpawn)
    expect(continueGame(state)).toBe(true)
    startLevel(state)
    state.hp = 0
    tick(state, neverSpawn)
    expect(continueGame(state)).toBe(false)
    expect(state.phase).toBe('gameOver')
    expect(state.hp).toBe(0)
  })

  it('cannot use a continue during play or when no credits remain', () => {
    const state = createInitialState()
    expect(continueGame(state)).toBe(false)
    expect(continueGame(knockOut(0))).toBe(false)
  })
})
