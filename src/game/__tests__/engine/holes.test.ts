import { describe, expect, it } from 'vitest'
import {
  activateHole,
  retireHole,
  tickHole,
  trySpawn,
} from '@game/engine/holes'
import { emptyHole } from '@game/engine/shared'
import { createInitialState, startLevel } from '@game/engine'
import { fresh, place } from '@game/__tests__/helpers/events.helpers'
import { BOSS_HOLE } from '@game/spec'

describe('hole lifecycle', () => {
  it('sets nikai counters from spawn metadata', () => {
    const state = fresh()
    state.holes[1] = emptyHole()
    activateHole(state, 1, {
      kind: 'mob',
      hp: 1,
      maxHp: 1,
      attack: 0,
      score: 0,
    })
    expect(state.holes[1].nikaiRemaining).toBe(0)

    state.holes[2] = emptyHole()
    activateHole(state, 2, {
      kind: 'twoHit',
      hp: 2,
      maxHp: 2,
      attack: 0,
      score: 0,
      nikai: true,
    })
    expect(state.holes[2].nikaiRemaining).toBe(1)

    state.holes[3] = emptyHole()
    activateHole(state, 3, {
      kind: 'twoHit',
      hp: 2,
      maxHp: 2,
      attack: 0,
      score: 0,
    })
    expect(state.holes[3].nikaiRemaining).toBe(1)
  })

  it('ignores duplicate activation and spawns bosses on boss levels', () => {
    const state = createInitialState()
    startLevel(state)
    state.level = 10
    trySpawn(state, () => 0)
    expect(state.holes[BOSS_HOLE].enemy.kind).toBe('boss')
    const before = state.moguraOn
    activateHole(state, BOSS_HOLE, state.holes[BOSS_HOLE].enemy)
    expect(state.moguraOn).toBe(before)
  })

  it('retires escaping mobs and advances phases', () => {
    const state = fresh()
    place(state, 4, { kind: 'mob', attack: 5, score: 10 }, 'rising')
    state.koma = 2
    state.topStay = 2
    tickHole(state, 4)
    expect(state.holes[4].phase).toBe('rising')
    tickHole(state, 4)
    expect(state.holes[4].phase).toBe('top')
    tickHole(state, 4)
    expect(state.holes[4].phase).toBe('top')
    tickHole(state, 4)
    expect(state.holes[4].phase).toBe('falling')
    tickHole(state, 4)
    tickHole(state, 4)
    expect(state.holes[4].phase).toBe('off')

    place(state, 6, { kind: 'mob', attack: 0 })
    retireHole(state, 6, true)
    expect(state.holes[6].phase).toBe('off')
    retireHole(state, 6, true)
  })
})
