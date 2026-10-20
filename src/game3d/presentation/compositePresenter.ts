import type { GameEvent, GameState } from '@game/types'
import type { GameEventPresenter } from '@game3d/presentation/types'

/** Fan-out presenter (Open/Closed: add sinks without editing callers). */
export class CompositeGameEventPresenter implements GameEventPresenter {
  constructor(private readonly sinks: readonly GameEventPresenter[]) {}

  present(events: readonly GameEvent[], state: GameState, now: number): void {
    for (const sink of this.sinks) {
      sink.present(events, state, now)
    }
  }
}
