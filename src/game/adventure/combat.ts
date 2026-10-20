import type { GameState, HoleIndex } from '../types'
import { FPS } from '../spec'
import { emit, HOLES, hurt } from '../engine/shared'
import { consumeLaserAmmo } from '../engine/strikeResolve'
import { triggerHammerStrike } from '../engine/strike'
import { missionFor } from './content'
import { strikeConductor } from './boss'
import { removeActor } from './spawn'
import { announce } from './state'

function advanceMission(
  state: GameState,
  hole: HoleIndex,
  helmetBroken: boolean,
): void {
  const adventure = state.adventure
  const role = adventure?.actors[hole]?.role
  if (!adventure) return
  const kind = missionFor(adventure.stage).kind
  if (kind === 'helmets' && helmetBroken) adventure.progress += 1
  if (helmetBroken) return
  if (
    kind === 'cake' ||
    (kind === 'choir' && role === 'singer') ||
    (kind === 'impostor' && role === 'impostor')
  )
    adventure.progress += 1
}
function hitActor(state: GameState, hole: HoleIndex, laser: boolean): boolean {
  const adventure = state.adventure
  const actor = adventure?.actors[hole]
  if (!adventure || !actor) return false
  const slot = state.holes[hole]
  if (actor.role === 'innocent') {
    hurt(state, 8, hole)
    announce(state, 'That was a guest! Find the black moustache')
    removeActor(state, hole)
    return false
  }
  if (slot.nikaiRemaining > 0) {
    slot.nikaiRemaining = 0
    advanceMission(state, hole, true)
    emit(state, { kind: 'hit', hole, sfx: 'kan' })
    if (!laser || !adventure.upgrades.includes('laser')) return false
  }
  advanceMission(state, hole, false)
  const multiplier =
    (adventure.frenzyFrames > 0 ? 2 : 1) *
    (adventure.upgrades.includes('bounty') ? 2 : 1)
  const points = 25 * multiplier
  state.score += points
  state.money += 3 * multiplier
  if (adventure.upgrades.includes('bounty'))
    state.hp = Math.min(state.hpMax, state.hp + 2)
  emit(state, { kind: 'kill', hole, sfx: 'todome', points })
  removeActor(state, hole)
  return true
}
export function resolveAdventureHits(state: GameState): void {
  const adventure = state.adventure
  if (!adventure) return
  while (state.pendingHits.length > 0) {
    const hole = state.pendingHits.shift()
    if (!hole) break
    const laser = state.gun > 0
    adventure.flightFrames = FPS
    state.levelStats.swings += 1
    triggerHammerStrike(state, hole)
    if (laser) {
      emit(state, { kind: 'hit', hole, sfx: 'gun' })
      consumeLaserAmmo(state)
    }
    if (adventure.actors[hole]?.role === 'boss') {
      strikeConductor(state, hole, laser)
      continue
    }
    if (!adventure.actors[hole]) {
      state.levelStats.misses += 1
      if (!laser) hurt(state, 3, hole)
      emit(state, { kind: 'miss', hole, sfx: 'karaburi' })
      continue
    }
    const killed = hitActor(state, hole, laser)
    if (!laser) bounceHammer(state, hole, killed)
  }
}

function bounceHammer(
  state: GameState,
  hole: HoleIndex,
  killed: boolean,
): void {
  if (!killed) return
  const adventure = state.adventure
  if (!adventure?.upgrades.includes('ricochet')) return
  const other = HOLES.find(
    (target) =>
      target !== hole &&
      adventure.actors[target] &&
      adventure.actors[target].role !== 'innocent' &&
      adventure.actors[target].role !== 'boss',
  )
  if (other) {
    triggerHammerStrike(state, other)
    hitActor(state, other, false)
  }
}
