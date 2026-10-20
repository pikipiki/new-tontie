import { createAdventure, prepareAdventure } from '@game/adventure/state'
import { beginRound, createInitialState, drainEvents } from '@game/engine'
import type { Clock, RandomSource } from '@game/clock'
import type { GameEvent, GameState } from '@game/types'
import { createFx, type GameFx } from '@game3d/fx'
import {
  createDefaultGameEventPresenter,
  type GameEventPresenter,
} from '@game3d/presentation'

export interface GameSessionOptions {
  adventure?: boolean
  random?: RandomSource
  clock?: Clock
  presenter?: GameEventPresenter
}

/** Back-compat helper used in tests; prefers injecting a {@link GameEventPresenter}. */
export function playEvents(
  events: GameEvent[],
  state: GameState,
  gameFx: GameFx,
): void {
  const now = performance.now()
  createDefaultGameEventPresenter({ gameFx }).present(events, state, now)
}

/** Mutable simulation owned by one hook instance; the engine mutates `state` in place. */
export class GameSession {
  state: GameState = createInitialState()
  gameFx: GameFx = createFx()
  readonly random: RandomSource
  readonly clock: Clock
  private readonly presenter: GameEventPresenter

  constructor(options: GameSessionOptions = {}) {
    if (options.adventure) this.setMode(true)
    this.random = options.random ?? Math.random
    this.clock = options.clock ?? (() => performance.now())
    this.presenter = options.presenter ?? createDefaultGameEventPresenter(this)
  }

  setMode(adventure: boolean): void {
    this.state = createInitialState()
    if (adventure) {
      this.state.adventure = createAdventure()
      prepareAdventure(this.state)
    }
    this.gameFx = createFx()
  }

  /** A new run reopens the level 1 panel with its slide-in sound. */
  reset(): void {
    const adventure = Boolean(this.state.adventure)
    this.setMode(adventure)
    if (!adventure) beginRound(this.state)
    this.gameFx = createFx()
  }

  flush(setClock: (now: number) => void): void {
    const now = this.clock()
    this.presenter.present(drainEvents(this.state), this.state, now)
    setClock(now)
  }
}
