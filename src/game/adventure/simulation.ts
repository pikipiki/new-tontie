import type { GameState } from '../types'
import { tickHammerStrikes } from '../engine/strike'
import { missionFor } from './content'
import { tickDonut } from './donut'
import { resolveAdventureHits } from './combat'
import { spawnAdventure } from './spawn'
import { tickActors } from './interactions'
import { spawnConductor, tickConductor } from './boss'
import { failAdventure, finishAdventureStage } from './state'

/** Adventure owns its clock and progression; Classic retains its original rules. */
export function tickAdventure(state: GameState, random: () => number): void {
  const adventure = state.adventure
  if (!adventure || state.phase !== 'playing') return
  resolveAdventureHits(state)
  tickHammerStrikes(state)
  state.roundFramesLeft -= 1
  state.roundFrameCounter += 1
  adventure.noticeFrames = Math.max(0, adventure.noticeFrames - 1)
  tickDonut(state)
  spawnConductor(state)
  spawnAdventure(state, random)
  tickActors(state)
  tickConductor(state)
  if (state.hp <= 0) {
    state.hp = 0
    failAdventure(
      state,
      'Your crystal hearts are empty. Try another upgrade combination!',
    )
  } else if (adventure.cake <= 0)
    failAdventure(
      state,
      'The Goonks ate the birthday cake! Stop escapes to protect it.',
    )
  else if (adventure.noise >= 5)
    failAdventure(
      state,
      'The choir woke the whole arcade! Prioritize the golden bells.',
    )
  else if (adventure.progress >= missionFor(adventure.stage).goal)
    finishAdventureStage(state, random)
  else if (state.roundFramesLeft <= 0)
    failAdventure(
      state,
      'Time is up! Use your sugar charge and prioritize the mission targets.',
    )
}
