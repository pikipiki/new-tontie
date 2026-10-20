import type { GameState } from '../types'
import { FPS } from '../spec'
import { emit } from '../engine/shared'
import { announce } from './state'

export const DONUT_SECONDS = 10.8
export function rushDuration(state: GameState, seconds: number): number {
  return (
    (seconds + (state.adventure?.upgrades.includes('longRush') ? 3 : 0)) * FPS
  )
}
export function activateSugarRush(state: GameState): void {
  const adventure = state.adventure
  if (!adventure || state.phase !== 'playing' || adventure.charge < 4) return
  adventure.charge = 0
  adventure.frenzyFrames = Math.max(
    adventure.frenzyFrames,
    rushDuration(state, 6),
  )
  announce(state, 'SUGAR RUSH! Double score • Goonks freeze')
  emit(state, { kind: 'pickup', sfx: 'sp_get' })
}
export function tickDonut(state: GameState): void {
  const adventure = state.adventure
  if (!adventure) return
  adventure.frenzyFrames = Math.max(0, adventure.frenzyFrames - 1)
  if (adventure.flightFrames > 0) {
    adventure.flightFrames -= 1
    return
  }
  const previous = adventure.snackSeconds
  const speed = adventure.upgrades.includes('quickBites') ? 1.5 : 1
  adventure.snackSeconds += speed / FPS
  const biteAt = (seconds: number) =>
    Math.floor(seconds / DONUT_SECONDS) * 4 +
    Math.min(
      4,
      Math.max(0, Math.floor(((seconds % DONUT_SECONDS) - 0.95) / 2.5) + 1),
    )
  const bites = biteAt(adventure.snackSeconds) - biteAt(previous)
  if (bites > 0) {
    adventure.biteCount += bites
    adventure.charge = Math.min(4, adventure.charge + bites)
    emit(state, { kind: 'pickup', sfx: 'coin_get' })
    if (Math.floor(adventure.biteCount / 4) > adventure.donuts) {
      adventure.donuts = Math.floor(adventure.biteCount / 4)
      adventure.frenzyFrames = Math.max(
        adventure.frenzyFrames,
        rushDuration(state, 3),
      )
      announce(
        state,
        adventure.charge === 4
          ? 'Donut finished! Mini frenzy • Sugar Rush ready'
          : 'Donut finished! Mini frenzy • Keep eating to refill sugar',
      )
    }
  }
}
