import { describe, expect, it } from 'vitest'
import { createInitialState } from '@game/engine'
import { countsAsMonster, drainEvents, emit, hurt } from '@game/engine/shared'

describe('shared engine helpers', () => {
  it('trims the event queue past 64 entries', () => {
    const state = createInitialState()
    for (let index = 0; index < 70; index++) {
      emit(state, { kind: 'miss', hole: 1, sfx: 'karaburi' })
    }
    expect(state.events).toHaveLength(64)
    const drained = drainEvents(state)
    expect(drained).toHaveLength(64)
    expect(state.events).toHaveLength(0)
  })

  it('classifies monsters and guards with stone', () => {
    expect(
      countsAsMonster({ kind: 'shop', hp: 1, maxHp: 1, attack: 0, score: 0 }),
    ).toBe(false)
    const state = createInitialState()
    state.stone = true
    hurt(state, 5)
    expect(drainEvents(state).at(-1)?.sfx).toBe('no_damege')
  })
})
