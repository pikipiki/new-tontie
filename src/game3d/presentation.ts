import type { GameEvent, GameState } from '@game/types'
import { playMusic, playSfx, setMusicPaused, stopMusic } from '@/audio'
import { recordEvent, syncStrikes, type GameFx } from '@game3d/fxState'

/** Side-effect sink for engine events (audio, particles, UI cues). Extend via composition. */
export interface GameEventPresenter {
  present(events: readonly GameEvent[], state: GameState, now: number): void
}

/** Maps {@link GameEvent} music/sfx fields to the Web Audio layer. */
export class AudioGameEventPresenter implements GameEventPresenter {
  present(events: readonly GameEvent[]): void {
    for (const event of events) {
      if (event.sfx) {
        playSfx(event.sfx)
      }
      if (event.music === 'stop') {
        stopMusic()
      } else if (event.music) {
        playMusic(event.music)
      }
      if (event.kind === 'pause') {
        setMusicPaused(true)
      }
      if (event.kind === 'resume') {
        setMusicPaused(false)
      }
    }
  }
}

/** Fan-out presenter (Open/Closed: add sinks without editing callers). */
export class CompositeGameEventPresenter implements GameEventPresenter {
  constructor(private readonly sinks: readonly GameEventPresenter[]) {}

  present(events: readonly GameEvent[], state: GameState, now: number): void {
    for (const sink of this.sinks) {
      sink.present(events, state, now)
    }
  }
}

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

export type DefaultPresenterTarget = FxPresenterTarget

export function createDefaultGameEventPresenter(
  target: DefaultPresenterTarget,
): GameEventPresenter {
  return new CompositeGameEventPresenter([
    new AudioGameEventPresenter(),
    new FxGameEventPresenter(target),
  ])
}
