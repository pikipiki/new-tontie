import { stealWeapon, moveWeaponWithSwap } from './weapons'
import { STEAL_END } from './stealTiming'
import type { GameState, HoleIndex } from '../types'
import { FPS } from '../spec'
import { emit, HOLES, hurt } from '../engine/shared'
import { missionFor } from './content'
import { swapReserved, SWAP_WARNING_FRAMES } from './swaps'
import { announce } from './state'
import { removeActor } from './spawn'

function playTrick(state: GameState, hole: HoleIndex): void {
  const adventure = state.adventure
  const actor = adventure?.actors[hole]
  if (!adventure || !actor) return
  if (actor.role === 'thief') {
    adventure.charge = Math.max(0, adventure.charge - 1)
    state.money = Math.max(0, state.money - 5)
    announce(state, 'Sugar thief stole a charge!')
  } else if (actor.role === 'tinkerer') {
    const target = HOLES.find(
      (other) =>
        other !== hole &&
        adventure.actors[other] &&
        adventure.actors[other].role !== 'innocent' &&
        adventure.actors[other].role !== 'boss' &&
        state.holes[other].nikaiRemaining === 0 &&
        !state.holes[other].enemy.nikai,
    )
    if (target) {
      const slot = state.holes[target]
      slot.enemy.nikai = true
      slot.enemy.catalogFrame = 6
      slot.nikaiRemaining = 1
      announce(state, 'Helmet maker protected a friend!')
      emit(state, { kind: 'guard', hole: target, sfx: 'kan' })
    }
  } else if (actor.role === 'prankster') {
    if (swapReserved(adventure, hole)) return
    actor.swapWith =
      HOLES.find(
        (other) =>
          other !== hole &&
          adventure.actors[other] &&
          adventure.actors[other].role !== 'boss' &&
          !swapReserved(adventure, other),
      ) ?? null
    if (actor.swapWith)
      announce(
        state,
        'Bananas! Stop either partner before they swap and steal your weapon',
      )
  }
}
function finishSwap(state: GameState, hole: HoleIndex): void {
  const adventure = state.adventure
  const actor = adventure?.actors[hole]
  const other = actor?.swapWith
  if (!adventure || !actor || !other) return
  actor.swapWith = null
  const friend = adventure.actors[other]
  if (!friend || state.holes[other].phase === 'off') return
  actor.swappedFrom = hole
  actor.swapAge = actor.age
  friend.swappedFrom = other
  friend.swapAge = friend.age
  const slot = state.holes[hole]
  state.holes[hole] = state.holes[other]
  state.holes[other] = slot
  adventure.actors[hole] = friend
  adventure.actors[other] = actor
  moveWeaponWithSwap(state, hole, other)
  stealWeapon(state, other)
}
export function escapeActor(state: GameState, hole: HoleIndex): void {
  const adventure = state.adventure
  const actor = adventure?.actors[hole]
  if (!adventure || !actor) return
  if (swapReserved(adventure, hole)) return
  if (actor.role !== 'innocent') {
    state.levelStats.lost += 1
    hurt(state, adventure.upgrades.includes('cakeShield') ? 2 : 4, hole)
    if (missionFor(adventure.stage).kind === 'cake') adventure.cake -= 1
    if (actor.role === 'singer') adventure.noise += 1
  }
  removeActor(state, hole)
}
export function tickActors(state: GameState): void {
  const adventure = state.adventure
  if (!adventure || adventure.frenzyFrames > 0) return
  const processed = new Set<object>()
  for (const hole of HOLES) {
    const actor = adventure.actors[hole]
    if (!actor || actor.role === 'boss' || processed.has(actor)) continue
    processed.add(actor)
    actor.age += 1
    const slot = state.holes[hole]
    if (slot.phase === 'rising' && ++slot.phaseTicks >= state.koma) {
      slot.phase = 'top'
      slot.phaseTicks = 0
    }
    if (actor.age === FPS * 2 && !actor.acted) {
      actor.acted = true
      playTrick(state, hole)
    }
    if (actor.swapWith && actor.age >= FPS * 2 + SWAP_WARNING_FRAMES)
      finishSwap(state, hole)
    if (shouldEscape(state, hole, actor.age)) escapeActor(state, hole)
  }
}
function shouldEscape(state: GameState, hole: HoleIndex, age: number) {
  const extra =
    state.adventure?.stolenWeapon?.holder === hole ? STEAL_END * FPS : 0
  return age > FPS * 5 + extra
}
