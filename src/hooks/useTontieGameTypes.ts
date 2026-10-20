import type { GameState, HoleIndex } from '@game/types'
import type { GameFx } from '@game3d/fx'

export interface TontieGame {
  state: GameState
  gameFx: GameFx
  clock: number
  /** Audio unlocked and the simulation loop running (first START tap). */
  started: boolean
  shopIndex: number
  /** START on the level panel. */
  start: () => void
  hit: (hole: HoleIndex) => void
  pause: () => void
  buy: (index: number) => void
  selectShop: (index: number) => void
  leaveShop: () => void
  continueGame: () => void
  restart: () => void
}
