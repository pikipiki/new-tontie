import { describe, expect, it } from 'vitest'
import baseline from '../../reference/replays/baseline.json'
import { runReplay } from './replay-run'

describe('replay scripts', () => {
  it('baseline.json stays stable', () => {
    const fp = runReplay({
      seed: baseline.seed,
      maxFrames: baseline.maxFrames,
      inputs: baseline.inputs as { frame: number; hole: number }[],
    })
    expect(fp).toBe(baseline.expectedFingerprint)
  })
})
