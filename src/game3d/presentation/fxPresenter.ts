import type { GameEvent, GameState } from '@game/types'
import { recordEvent, syncStrikes, type GameFx } from '@game3d/fxState'
import type { GameEventPresenter } from '@game3d/presentation/types'

export interface FxPresenterTarget {
  readonly gameFx: GameFx
}

/** Mirrors engine events into wall-clock FX state for React Three Fiber. */
export class FxGameEventPresenter implements GameEventPresenter {
  constructor(private readonly target: FxPresenterTarget) {}

  present(events: readonly GameEvent[], state: GameState, now: number): void {
    for (const event of events) {
      recordEvent(this.target.gameFx, event, state, now)
    }
    syncStrikes(this.target.gameFx, state, now)
  }
}
