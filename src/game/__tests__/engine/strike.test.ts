import { describe, expect, it } from 'vitest'
import { resolveStrike } from '@game/engine/strike'
import { fresh, place } from '@game/__tests__/helpers/events.helpers'

describe('hammer strikes', () => {
  it('resolves treasure and shop hits', () => {
    const state = fresh()
    place(state, 1, { kind: 'treasure', attack: 0, item: 'life' })
    resolveStrike(state, 1)
    expect(state.holes[1].phase).toBe('off')

    place(state, 2, { kind: 'shop', attack: 0 })
    resolveStrike(state, 2)
    expect(state.phase).toBe('shop')
  })

  it('restores hp on nikai mobs and picks up coin items', () => {
    const state = fresh()
    place(state, 3, {
      kind: 'twoHit',
      hp: 1,
      maxHp: 4,
      nikai: true,
      catalogFrame: 20,
    })
    state.holes[3].nikaiRemaining = 1
    state.playerAttack = 1
    resolveStrike(state, 3)
    expect(state.holes[3].enemy.hp).toBe(4)

    place(state, 4, { kind: 'item', item: 'coin', coinSteal: 5, attack: 0 })
    resolveStrike(state, 4)
  })

  it('clears the level when the boss is defeated', () => {
    const state = fresh()
    place(state, 9, {
      kind: 'boss',
      hp: 1,
      maxHp: 1,
      attack: 0,
      score: 100,
      catalogFrame: 14,
    })
    state.playerAttack = 99
    resolveStrike(state, 9)
    expect(state.phase).toBe('levelClear')
  })

  it('misses on empty holes and wingless falling targets', () => {
    const state = fresh()
    resolveStrike(state, 9)
    place(state, 8, { kind: 'mob', hp: 1 }, 'falling')
    resolveStrike(state, 8)
    expect(state.levelStats.misses).toBe(2)
  })
})
