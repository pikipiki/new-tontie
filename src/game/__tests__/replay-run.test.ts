import { installReplayDevTools } from '@/session/replayTools'
import { describe, expect, it } from 'vitest'
import baseline from '@reference/replays/baseline.json'
import { runReplay, runReplayState, type ReplayInput } from '@game/replay-run'

describe('replay scripts', () => {
  it('baseline.json stays stable', () => {
    const fingerprint = runReplay({
      seed: baseline.seed,
      maxFrames: baseline.maxFrames,
      inputs: baseline.inputs as ReplayInput[],
    })
    expect(fingerprint).toBe(baseline.expectedFingerprint)
  })

  it('defers inputs until their frame', () => {
    const state = runReplayState({
      seed: 0,
      maxFrames: 3,
      inputs: [{ frame: 2, hole: 1 }],
    })
    expect(state.roundFrameCounter).toBeLessThanOrEqual(3)
  })

  it('defaults max frames when omitted', () => {
    expect(
      runReplayState({ seed: 0, inputs: [] }).roundFrameCounter,
    ).toBeGreaterThan(0)
  })

  it('stops on game over', () => {
    const state = runReplayState({
      seed: 1,
      maxFrames: 400,
      inputs: Array.from({ length: 400 }, (_, frame) => ({
        frame,
        hole: 5 as const,
      })),
    })
    expect(state.phase === 'gameOver' || state.phase === 'win').toBe(true)
  })

  it('exposes replay helpers with the dev default', () => {
    installReplayDevTools()
    expect(
      (window as unknown as { tontieReplay?: unknown }).tontieReplay,
    ).toBeTypeOf('function')
  })

  it('exposes replay helpers when forced on', () => {
    installReplayDevTools(true)
    expect(
      (window as unknown as { tontieReplay?: unknown }).tontieReplay,
    ).toBeTypeOf('function')
  })

  it('skips replay helpers when disabled', () => {
    Reflect.deleteProperty(window, 'tontieReplay')
    installReplayDevTools(false)
    expect(
      (window as unknown as { tontieReplay?: unknown }).tontieReplay,
    ).toBeUndefined()
  })
})
