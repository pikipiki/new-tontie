import { createInitialState, drainEvents, startLevel } from '@game/engine'
import type { EnemySpawn, GameState, HoleIndex, MolePhase } from '@game/types'

export const neverSpawn = () => 0.99

export function place(
  state: GameState,
  hole: HoleIndex,
  enemy: Partial<EnemySpawn>,
  phase: MolePhase = 'top',
) {
  state.holes[hole] = {
    phase,
    phaseTicks: 0,
    enemy: {
      kind: 'mob',
      hp: 1,
      maxHp: 1,
      attack: 10,
      score: 10,
      catalogFrame: 5,
      ...enemy,
    },
    nikaiRemaining: 0,
  }
  state.moguraOn += 1
}

export function fresh(): GameState {
  const state = createInitialState()
  startLevel(state)
  drainEvents(state)
  return state
}
