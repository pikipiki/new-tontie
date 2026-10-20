import { describe, expect, it, vi } from 'vitest'
import type { GameEvent } from '@game/types'
import { createInitialState } from '@game/engine'
import {
  CompositeGameEventPresenter,
  FxGameEventPresenter,
  type GameEventPresenter,
} from '@game3d/presentation'
import { createFx } from '@game3d/fxState'
import { GameSession } from '@hooks/useTontieGameSession'

describe('GameEventPresenter', () => {
  it('composes sinks in order', () => {
    const calls: string[] = []
    const first: GameEventPresenter = {
      present: () => {
        calls.push('first')
      },
    }
    const second: GameEventPresenter = {
      present: () => {
        calls.push('second')
      },
    }
    const composite = new CompositeGameEventPresenter([first, second])
    composite.present([], createInitialState(), 0)
    expect(calls).toEqual(['first', 'second'])
  })

  it('GameSession accepts a custom presenter', () => {
    const present = vi.fn()
    const session = new GameSession({
      clock: () => 100,
      presenter: { present },
    })
    session.state.events.push({ kind: 'intro' })
    session.flush(() => undefined)
    expect(present).toHaveBeenCalledWith(
      [{ kind: 'intro' }],
      session.state,
      100,
    )
  })
})

describe('FxGameEventPresenter', () => {
  it('records events on the target fx bag', () => {
    const gameFx = createFx()
    const presenter = new FxGameEventPresenter({ gameFx })
    const state = createInitialState()
    const events: GameEvent[] = [{ kind: 'hit', hole: 4 }]
    presenter.present(events, state, 500)
    expect(gameFx.holes[4].hitAt).toBe(500)
  })
})
