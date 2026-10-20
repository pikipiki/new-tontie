import { dropWeapon } from './weapons'
import type { GameState, HoleIndex } from '../types'
import { FPS } from '../spec'
import { HOLES, emptyHole } from '../engine/shared'
import { activateHole } from '../engine/holes'
import { missionFor } from './content'
import type { AdventureRole } from './types'

export function removeActor(state: GameState, hole: HoleIndex): void {
  dropWeapon(state, hole)
  state.holes[hole] = emptyHole()
  state.moguraOn = Math.max(0, state.moguraOn - 1)
  if (state.adventure) {
    Reflect.deleteProperty(state.adventure.actors, hole)
    for (const other of HOLES) {
      const actor = state.adventure.actors[other]
      if (actor?.swapWith === hole) actor.swapWith = null
    }
  }
}
function nextRole(state: GameState): AdventureRole {
  const adventure = state.adventure
  if (!adventure) return 'thief'
  const count = adventure.spawned
  const kind = missionFor(adventure.stage).kind
  if (kind === 'boss') {
    const helpers: AdventureRole[] = [
      'thief',
      'helmet',
      'tinkerer',
      'prankster',
    ]
    return helpers[count % 4] ?? 'thief'
  }
  if (kind === 'helmets' && count % 4 !== 0) return 'helmet'
  if (kind === 'choir' && count % 3 !== 0) return 'singer'
  if (kind === 'impostor') return count % 3 === 0 ? 'innocent' : 'impostor'
  const helpers: AdventureRole[] = ['thief', 'tinkerer', 'prankster']
  return helpers[count % helpers.length] ?? 'thief'
}
export function spawnAdventure(state: GameState, random: () => number): void {
  const adventure = state.adventure
  if (!adventure) return
  adventure.spawnIn -= 1
  const limit = adventure.boss ? 3 + Math.floor(adventure.stage / 2) : 4
  if (adventure.spawnIn > 0 || state.moguraOn >= limit) return
  const available = HOLES.filter(
    (hole) =>
      state.holes[hole].phase === 'off' && !isDroppedWeaponHole(state, hole),
  )
  const hole =
    available[
      Math.min(available.length - 1, Math.floor(random() * available.length))
    ]
  if (!hole) return
  adventure.spawned += 1
  const role = nextRole(state)
  const helmet = role === 'helmet'
  activateHole(state, hole, {
    kind: helmet ? 'twoHit' : 'mob',
    hp: 1,
    maxHp: 1,
    attack: 3,
    score: 25,
    catalogFrame: helmet ? 6 : 5,
    nikai: helmet,
  })
  adventure.actors[hole] = { role, age: 0, acted: false, swapWith: null }
  if (adventure.boss) {
    adventure.spawnIn = Math.round(FPS * 2.8)
    return
  }
  adventure.spawnIn =
    Math.max(10, 22 - adventure.stage * 2) + Math.floor(random() * 6)
}

function isDroppedWeaponHole(state: GameState, hole: HoleIndex): boolean {
  const stolen = state.adventure?.stolenWeapon
  return stolen?.holder === null && stolen.dropHole === hole
}
