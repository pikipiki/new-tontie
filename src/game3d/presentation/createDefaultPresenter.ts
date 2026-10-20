import type { GameFx } from '@game3d/fxState'
import { AudioGameEventPresenter } from '@game3d/presentation/audioPresenter'
import { CompositeGameEventPresenter } from '@game3d/presentation/compositePresenter'
import { FxGameEventPresenter } from '@game3d/presentation/fxPresenter'
import type { GameEventPresenter } from '@game3d/presentation/types'

export interface DefaultPresenterTarget {
  readonly gameFx: GameFx
}

export function createDefaultGameEventPresenter(
  target: DefaultPresenterTarget,
): GameEventPresenter {
  return new CompositeGameEventPresenter([
    new AudioGameEventPresenter(),
    new FxGameEventPresenter(target),
  ])
}
