import { beginRound, createInitialState, drainEvents } from '@/game/engine'
import type { GameEvent, GameState } from '@/game/types'
import { playMusic, playSfx, setMusicPaused, stopMusic } from '@/game/audio'
import { createFx, recordEvent, syncStrikes, type GameFx } from '@game3d/fx'

export function playEvents(
  events: GameEvent[],
  state: GameState,
  gameFx: GameFx,
): void {
  const now = performance.now()
  for (const event of events) {
    if (event.sfx) playSfx(event.sfx)
    if (event.music === 'stop') stopMusic()
    else if (event.music) playMusic(event.music)
    if (event.kind === 'pause') setMusicPaused(true)
    if (event.kind === 'resume') setMusicPaused(false)
    recordEvent(gameFx, event, state, now)
  }
  syncStrikes(gameFx, state, now)
}

/** Mutable simulation owned by one hook instance; the engine mutates `state` in place. */
export class GameSession {
  state: GameState = createInitialState()
  gameFx: GameFx = createFx()
  readonly random = () => Math.random()

  /** A new run reopens the level 1 panel with its slide-in sound. */
  reset(): void {
    this.state = createInitialState()
    beginRound(this.state)
    this.gameFx = createFx()
  }

  flush(setClock: (now: number) => void): void {
    playEvents(drainEvents(this.state), this.state, this.gameFx)
    setClock(performance.now())
  }
}
