import { createContext, useContext } from 'react'
import { createFx, type GameFx } from '@game3d/fxState'

export const GameFxContext = createContext<GameFx>(createFx())

export function useGameFx(): GameFx {
  return useContext(GameFxContext)
}
