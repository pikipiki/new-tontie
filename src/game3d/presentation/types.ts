import type { GameEvent, GameState } from '@game/types'

/** Side-effect sink for engine events (audio, particles, UI cues). Extend via composition. */
export interface GameEventPresenter {
  present(events: readonly GameEvent[], state: GameState, now: number): void
}
