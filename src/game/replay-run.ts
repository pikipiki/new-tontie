import { createInitialState, queueHit, startLevel, tick } from './engine'
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

/** Plays a script, pressing START on every level panel as soon as it opens. */
export function runReplayState(script: ReplayScript): GameState {
  const state = createInitialState()
  const random = createSeededRandom(script.seed)
  const max = script.maxFrames ?? 60 * 17 * 25
  const inputs = [...script.inputs].sort(
    (left, right) => left.frame - right.frame,
  )
  let inputIdx = 0

  for (let frame = 0; frame < max; frame++) {
    startLevel(state)
    for (
      let input = inputs[inputIdx];
      input?.frame === frame;
      input = inputs[inputIdx]
    ) {
      queueHit(state, input.hole)
      inputIdx++
    }
    tick(state, random)
    if (state.phase === 'gameOver' || state.phase === 'win') {
      break
    }
  }
  return state
}

export function runReplay(script: ReplayScript): string {
  return stateFingerprint(runReplayState(script))
}

export function installReplayDevTools(enabled = import.meta.env.DEV): void {
  if (enabled) {
    ;(
      window as unknown as { tontieReplay: typeof runReplayState }
    ).tontieReplay = runReplayState
  }
}
