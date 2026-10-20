import { describe, expect, it } from 'vitest'
import { FPS } from '../../spec'
import { drainEvents, queueHit } from '../../engine'
import { resolveAdventureHits } from '../combat'
import {
  stealWeapon,
  recoverWeapon,
  moveWeaponWithSwap,
  stealBusy,
} from '../weapons'
import { STEAL_END } from '../stealTiming'
import { tickActors, escapeActor } from '../interactions'
import { prepareAdventure } from '../state'
import { MISSIONS } from '../content'
import { SWAP_WARNING_FRAMES } from '../swaps'
import { adventureGame, addActor } from './helpers'

function completeSwap(state: ReturnType<typeof adventureGame>['state']) {
  for (let frame = 0; frame < FPS * 2 + SWAP_WARNING_FRAMES; frame += 1)
    tickActors(state)
}
describe('swappers steal the equipped weapon', () => {
  it('steals a gold hammer, blocks attacks and lets the player take it back without hurting the carrier', () => {
    const { state, adventure } = adventureGame()
    state.hammerLv = 4
    addActor(state, 5, 'prankster')
    addActor(state, 4, 'singer')
    addActor(state, 6, 'thief')
    completeSwap(state)
    expect(adventure.stolenWeapon?.holder).toBe(4)
    expect(adventure.stolenWeapon?.hammerLv).toBe(4)
    const swings = state.levelStats.swings
    queueHit(state, 6)
    resolveAdventureHits(state)
    expect(state.levelStats.swings).toBe(swings)
    expect(adventure.actors[6]).toBeDefined()
    expect(adventure.progress).toBe(0)
    expect(state.hammerStrikes).toEqual([])
    queueHit(state, 4)
    resolveAdventureHits(state)
    expect(adventure.stolenWeapon).toBeNull()
    expect(adventure.actors[4]).toBeDefined()
    queueHit(state, 6)
    resolveAdventureHits(state)
    expect(adventure.actors[6]).toBeUndefined()
    expect(adventure.progress).toBe(1)
  })
  it('steals the ray and restores its exact remaining ammo instead of granting a refill', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 4, 'prankster')
    state.gun = 1
    state.gunAmmo = 37
    stealWeapon(state, 4)
    expect(state.gun).toBe(0)
    expect(state.gunAmmo).toBe(0)
    expect(adventure.stolenWeapon?.ammo).toBe(37)
    expect(recoverWeapon(state, 5)).toBe(false)
    expect(recoverWeapon(state, 4)).toBe(true)
    expect(state.gun).toBe(1)
    expect(state.gunAmmo).toBe(37)
  })
  it('leaves an escaped carrier’s weapon on its hole so the player can always recover it', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 4, 'prankster')
    stealWeapon(state, 4)
    escapeActor(state, 4)
    expect(adventure.stolenWeapon?.holder).toBeNull()
    expect(adventure.stolenWeapon?.dropHole).toBe(4)
    queueHit(state, 4)
    resolveAdventureHits(state)
    expect(adventure.stolenWeapon).toBeNull()
    expect(state.hammerStrikes).toEqual([])
  })
  it('keeps the stolen weapon with the same carrier through later swaps', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 4, 'prankster')
    stealWeapon(state, 4)
    moveWeaponWithSwap(state, 4, 6)
    expect(adventure.stolenWeapon?.holder).toBe(6)
    expect(adventure.stolenWeapon?.dropHole).toBe(6)
  })
  it('restores the weapon when resetting a mission and does not steal a second weapon while disarmed', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 4, 'prankster')
    addActor(state, 6, 'thief')
    state.gun = 1
    state.gunAmmo = 28
    stealWeapon(state, 4)
    stealWeapon(state, 6)
    expect(adventure.stolenWeapon?.holder).toBe(4)
    prepareAdventure(state)
    expect(adventure.stolenWeapon).toBeNull()
    expect(state.gun).toBe(1)
    expect(state.gunAmmo).toBe(28)
  })
})
describe('steal sprint and slap recovery', () => {
  it('asks Pink to slap a living thief, but not a dropped weapon', () => {
    const { state } = adventureGame()
    addActor(state, 4, 'prankster')
    stealWeapon(state, 4)
    drainEvents(state)
    recoverWeapon(state, 4)
    expect(drainEvents(state).some((event) => event.slap)).toBe(true)
    addActor(state, 6, 'prankster')
    stealWeapon(state, 6)
    escapeActor(state, 6)
    drainEvents(state)
    recoverWeapon(state, 6)
    expect(drainEvents(state).some((event) => event.slap)).toBe(false)
  })
  it('keeps the thief on the board until the steal sprint has finished', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 4, 'prankster')
    addActor(state, 5, 'singer')
    completeSwap(state)
    expect(adventure.stolenWeapon?.holder).toBe(5)
    expect(adventure.stolenWeapon && stealBusy(adventure.stolenWeapon)).toBe(
      true,
    )
    for (let frame = 0; frame < STEAL_END * FPS - 2; frame += 1)
      tickActors(state)
    expect(adventure.stolenWeapon?.holder).toBe(5)
    expect(adventure.actors[5]).toBeDefined()
  })
})
describe('longer rounds', () => {
  it('requires twice the previous winning hits for every mission including the two bosses', () => {
    expect(MISSIONS.map((mission) => mission.goal)).toEqual([
      16, 16, 12, 12, 16, 24,
    ])
  })
})
