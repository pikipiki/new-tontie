import { describe, expect, it } from 'vitest'
import baseline from '@reference/replays/baseline.json'
import { createInitialState, queueHit, startLevel, tick } from '@game/engine'
import { runReplay, type ReplayInput } from '@game/replay-run'
import { createSeededRandom } from '@game/rng'
import { stateFingerprint } from '@game/replay'
import { FPS } from '@game/spec'

/** Cross-module simulation checks (no browser); run via npm run test:e2e. */
describe('e2e smoke', () => {
  it('replay baseline matches reference fingerprint', () => {
    const fingerprint = runReplay({
      seed: baseline.seed,
      maxFrames: baseline.maxFrames,
      inputs: baseline.inputs as ReplayInput[],
    })
    expect(fingerprint).toBe(baseline.expectedFingerprint)
  })

  it('seeded session survives an eight-second round slice', () => {
    const random = createSeededRandom(0x7a3b_91c2)
    const state = createInitialState()
    startLevel(state)
    const frames = FPS * 8
    for (let frameIndex = 0; frameIndex < frames; frameIndex++) {
      tick(state, random)
    }
    expect(state.phase).toBe('playing')
    expect(stateFingerprint(state)).toBe(
      'playing|1|0|0|42|1|3|0|0|tm1on0on0tm1on0rm1on0on0on0',
    )
  })

  it('hammer input changes fingerprint with the same seed', () => {
    const run = (withHit: boolean) => {
      const random = createSeededRandom(42)
      const state = createInitialState()
      startLevel(state)
      for (let frameIndex = 0; frameIndex < 120; frameIndex++) {
        if (withHit && frameIndex === 40) {
          const hole = [1, 2, 3, 4, 5, 6, 7, 8, 9].find(
            (holeIndex) => state.holes[holeIndex as 1].phase !== 'off',
          )
          if (hole) {
            queueHit(state, hole as 1)
          }
        }
        tick(state, random)
      }
      return stateFingerprint(state)
    }
    expect(run(false)).not.toBe(run(true))
  })
})
