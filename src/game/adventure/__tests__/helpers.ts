import { createInitialState, startLevel, tick } from '../../engine'
import { activateHole } from '../../engine/holes'
import type { GameState, HoleIndex } from '../../types'
import { createAdventure, prepareAdventure } from '../state'
import type { AdventureRole } from '../types'
export function adventureGame(stage = 1) {
  const state = createInitialState()
  const adventure = createAdventure()
  state.adventure = adventure
  adventure.stage = stage
  prepareAdventure(state)
  startLevel(state)
  return { state, adventure }
}
export function addActor(
  state: GameState,
  hole: HoleIndex,
  role: AdventureRole,
) {
  const helmet = role === 'helmet'
  activateHole(state, hole, {
    kind: helmet ? 'twoHit' : 'mob',
    hp: 1,
    maxHp: 1,
    attack: 4,
    score: 25,
    catalogFrame: helmet ? 6 : 5,
    nikai: helmet,
  })
  if (state.adventure)
    state.adventure.actors[hole] = {
      role,
      age: 0,
      acted: false,
      swapWith: null,
    }
}
export function advance(state: GameState, frames: number) {
  for (let frame = 0; frame < frames; frame += 1) tick(state, () => 0.23)
}
