import type { GameState, HoleIndex } from '../types'
import type { StolenWeapon } from './types'
import { FPS } from '../spec'
import { emit } from '../engine/shared'
import { announce } from '../engine/shared'
import { STEAL_END } from './stealTiming'

export function stealBusy(stolen: Pick<StolenWeapon, 'age' | 'holder'>) {
  return stolen.holder !== null && stolen.age < STEAL_END * FPS
}

export function stealWeapon(state: GameState, holder: HoleIndex): void {
  const adventure = state.adventure
  if (!adventure || adventure.stolenWeapon || !adventure.actors[holder]) return
  adventure.stolenWeapon = {
    wing: state.wing,
    holder,
    dropHole: holder,
    hammerLv: state.hammerLv,
    gun: state.gun,
    ammo: state.gunAmmo,
    age: 0,
  }
  state.gun = 0
  state.gunAmmo = 0
  state.pendingHits = []
  state.hammerStrikes = []
  adventure.flightFrames = 0
  announce(state, 'WEAPON STOLEN! Tap the Goonk carrying it to take it back')
  emit(state, { kind: 'pickup', sfx: 'damage_coin' })
}
export function restoreWeapon(state: GameState): boolean {
  const adventure = state.adventure,
    stolen = adventure?.stolenWeapon
  if (!adventure || !stolen) return false
  state.hammerLv = stolen.hammerLv
  state.gun = stolen.gun
  state.gunAmmo = stolen.ammo
  adventure.stolenWeapon = null
  return true
}
export function recoverWeapon(state: GameState, hole: HoleIndex): boolean {
  const stolen = state.adventure?.stolenWeapon
  if (!stolen || (stolen.holder ?? stolen.dropHole) !== hole) return false
  const slap = stolen.holder !== null
  restoreWeapon(state)
  announce(
    state,
    slap
      ? 'Weapon recovered! Pink slapped the thief'
      : 'Weapon recovered! You can strike again',
  )
  emit(state, { kind: 'pickup', hole, sfx: 'sp_get', slap })
  return true
}
export function dropWeapon(state: GameState, hole: HoleIndex): void {
  const stolen = state.adventure?.stolenWeapon
  if (!stolen || stolen.holder !== hole) return
  stolen.holder = null
  stolen.dropHole = hole
  stolen.age = Math.ceil(STEAL_END * FPS)
  announce(state, 'Your weapon was dropped! Tap it to pick it up')
}
export function moveWeaponWithSwap(
  state: GameState,
  source: HoleIndex,
  target: HoleIndex,
): void {
  const stolen = state.adventure?.stolenWeapon
  if (!stolen) return
  if (stolen.holder === source) stolen.holder = target
  else if (stolen.holder === target) stolen.holder = source
  if (stolen.holder) stolen.dropHole = stolen.holder
}
