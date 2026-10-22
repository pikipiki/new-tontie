import type { AdventureActor, AdventureRole, AdventureState } from './types'
import { recoverWeapon } from './weapons'
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
  adventure: AdventureState,
  role: AdventureRole,
  helmetBroken: boolean,
): void {
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
function hitActor(
  state: GameState,
  adventure: AdventureState,
  actor: AdventureActor,
  hole: HoleIndex,
  laser: boolean,
): boolean {
  const slot = state.holes[hole]
  if (actor.role === 'innocent') {
    hurt(state, 8, hole)
    announce(state, 'That was a guest! Find the black moustache')
    removeActor(state, hole)
    return false
  }
  if (slot.nikaiRemaining > 0) {
    slot.nikaiRemaining = 0
    advanceMission(adventure, actor.role, true)
    emit(state, { kind: 'hit', hole, sfx: 'kan' })
    if (!laser || !adventure.upgrades.includes('laser')) return false
  }
  advanceMission(adventure, actor.role, false)
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
    const hole = state.pendingHits[0] as HoleIndex
    state.pendingHits.shift()
    resolveAdventureHit(state, adventure, hole)
  }
}

function resolveAdventureHit(
  state: GameState,
  adventure: AdventureState,
  hole: HoleIndex,
): void {
  if (adventure.stolenWeapon) {
    recoverWeapon(state, hole)
    return
  }
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
    return
  }
  const actor = adventure.actors[hole]
  if (!actor) {
    state.levelStats.misses += 1
    if (!laser) hurt(state, 3, hole)
    emit(state, { kind: 'miss', hole, sfx: 'karaburi' })
    return
  }
  const killed = hitActor(state, adventure, actor, hole, laser)
  if (!laser) bounceHammer(state, adventure, hole, killed)
}

function bounceHammer(
  state: GameState,
  adventure: AdventureState,
  hole: HoleIndex,
  killed: boolean,
): void {
  if (!killed) return
  if (!adventure.upgrades.includes('ricochet')) return
  for (const target of HOLES) {
    const actor = adventure.actors[target]
    if (
      target === hole ||
      !actor ||
      actor.role === 'innocent' ||
      actor.role === 'boss'
    )
      continue
    triggerHammerStrike(state, target)
    hitActor(state, adventure, actor, target, false)
    return
  }
}
