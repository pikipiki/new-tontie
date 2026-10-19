import { describe, expect, it } from 'vitest'
import { createInitialState, queueHit, startLevel, tick } from './engine'
import { createSeededRandom } from './rng'
import { stateFingerprint } from './replay'
import { FPS } from './spec'

describe('seeded replay', () => {
  it('deterministic simulation fingerprint after fixed ticks', () => {
    const random = createSeededRandom(0x7a3b_91c2)
    const state = createInitialState()
    startLevel(state)
    const frames = FPS * 8
    for (let i = 0; i < frames; i++) {
      tick(state, random)
    }
    expect(stateFingerprint(state)).toBe(
      'playing|1|0|0|42|1|3|0|0|tm1on0on0tm1on0rm1on0on0on0',
    )
  })

  it('hammer input changes fingerprint predictably with same seed', () => {
    const run = (withHit: boolean) => {
      const random = createSeededRandom(42)
      const state = createInitialState()
      startLevel(state)
      for (let i = 0; i < 120; i++) {
        if (withHit && i === 40) {
          const hole = [1, 2, 3, 4, 5, 6, 7, 8, 9].find(
            (h) => state.holes[h as 1].phase !== 'off',
          )
          if (hole) {
            queueHit(state, hole as 1)
          }
        }
        tick(state, random)
      }
      return stateFingerprint(state)
    }
    const a = run(false)
    const b = run(true)
    expect(a).not.toBe(b)
    expect(run(false)).toBe(a)
  })
})
