import { createInitialState, queueHit, tick } from './engine'
import { createSeededRandom } from './rng'
import { stateFingerprint } from './replay'
import type { GameState, HoleIndex } from './types'

export interface ReplayInput {
  frame: number
  hole: HoleIndex
}

export interface ReplayScript {
  seed: number
  inputs: ReplayInput[]
  maxFrames?: number
}

export function runReplay(script: ReplayScript): string {
  const state = createInitialState()
  const random = createSeededRandom(script.seed)
  const max = script.maxFrames ?? 60 * 17 * 25
  const inputs = [...script.inputs].sort((a, b) => a.frame - b.frame)
  let inputIdx = 0

  for (let frame = 0; frame < max; frame++) {
    while (inputIdx < inputs.length && inputs[inputIdx]!.frame === frame) {
      queueHit(state, inputs[inputIdx]!.hole)
      inputIdx++
    }
    tick(state, random)
    if (state.phase === 'gameOver' || state.phase === 'win') {
      break
    }
  }
  return stateFingerprint(state)
}

export function runReplayState(script: ReplayScript): GameState {
  const state = createInitialState()
  const random = createSeededRandom(script.seed)
  const max = script.maxFrames ?? 60 * 17 * 25
  const inputs = [...script.inputs].sort((a, b) => a.frame - b.frame)
  let inputIdx = 0

  for (let frame = 0; frame < max; frame++) {
    while (inputIdx < inputs.length && inputs[inputIdx]!.frame === frame) {
      queueHit(state, inputs[inputIdx]!.hole)
      inputIdx++
    }
    tick(state, random)
    if (state.phase === 'gameOver' || state.phase === 'win') {
      break
    }
  }
  return state
}

export function installReplayDevTools(): void {
  if (import.meta.env.DEV) {
    ;(window as unknown as { tontieReplay: typeof runReplayState }).tontieReplay = runReplayState
  }
}
