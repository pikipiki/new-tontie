import { describe, expect, it } from 'vitest'
import {
  flushHits,
  tickHammerStrikes,
  triggerHammerStrike,
} from '@game/engine/strike'
import {
  createInitialState,
  drainEvents,
  queueHit,
  startLevel,
} from '@game/engine'
import { fresh, place } from '@game/__tests__/helpers/events.helpers'
import { HAMMER_STRIKE_FRAMES } from '@game/spec'

describe('hammer strike queue', () => {
  it('flushes gun hits across the board', () => {
    const state = fresh()
    state.gun = 1
    place(state, 1, { kind: 'mob', hp: 1, attack: 0 })
    place(state, 2, { kind: 'mob', hp: 1, attack: 0 })
    state.pendingHits.push(1)
    flushHits(state)
    expect(state.holes[1].phase).toBe('off')
    expect(state.holes[2].phase).toBe('off')
    expect(drainEvents(state).some((event) => event.sfx === 'gun')).toBe(true)
  })

  it('animates hammer strikes and coalesces duplicate holes', () => {
    const state = createInitialState()
    triggerHammerStrike(state, 5)
    triggerHammerStrike(state, 5)
    expect(state.hammerStrikes).toHaveLength(1)
    for (let frame = 0; frame < HAMMER_STRIKE_FRAMES; frame++) {
      tickHammerStrikes(state)
    }
    expect(state.hammerStrikes).toHaveLength(0)
  })

  it('aborts flush when the queue yields an empty slot', () => {
    const state = fresh()
    state.pendingHits.push(
      undefined as unknown as (typeof state.pendingHits)[0],
    )
    flushHits(state)
    expect(state.pendingHits).toHaveLength(0)
  })

  it('queues hits only while playing', () => {
    const state = createInitialState()
    queueHit(state, 5)
    expect(state.pendingHits).toHaveLength(0)
    startLevel(state)
    queueHit(state, 5)
    expect(state.pendingHits).toHaveLength(1)
  })
})
