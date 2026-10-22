import { describe, expect, it } from 'vitest'
import { pendingSwapCue, visibleSwapPairs, SWAP_WARNING_FRAMES } from '../swaps'
import { tickActors, escapeActor } from '../interactions'
import { tickAdventure } from '../simulation'
import { stealWeapon } from '../weapons'
import { FPS } from '../../spec'
import { adventureGame, addActor } from './helpers'

function pair() {
  const game = adventureGame()
  addActor(game.state, 4, 'prankster')
  addActor(game.state, 5, 'singer')
  const actor = game.adventure.actors[4]
  if (!actor) throw new Error('Actor missing')
  actor.swapWith = 5
  actor.age = FPS * 2
  return { ...game, actor }
}

describe('swap cue lifecycle', () => {
  it('draws the warning from either partner and clamps its progress', () => {
    const { adventure, actor } = pair()
    expect(pendingSwapCue(adventure, 4)).toMatchObject({
      partner: 5,
      reverse: false,
      progress: 0,
    })
    actor.age += SWAP_WARNING_FRAMES * 2
    expect(pendingSwapCue(adventure, 5)).toMatchObject({
      partner: 4,
      reverse: true,
      progress: 1,
    })
    expect(pendingSwapCue(adventure, 6)).toBeUndefined()
  })

  it('hides warnings for missing partners and unmatched jump arcs', () => {
    const { adventure, actor } = pair()
    Reflect.deleteProperty(adventure.actors, 5)
    expect(pendingSwapCue(adventure, 4)).toBeUndefined()
    expect(visibleSwapPairs(adventure)).toEqual([])
    actor.swapWith = null
    actor.swappedFrom = 5
    actor.swapAge = actor.age
    adventure.actors[5] = {
      role: 'singer',
      age: 0,
      acted: false,
      swapWith: null,
    }
    expect(visibleSwapPairs(adventure)).toEqual([])
  })

  it('cancels stale swaps when a partner has gone or has already retracted', () => {
    for (const missing of [true, false]) {
      const { state, adventure, actor } = pair()
      actor.age += SWAP_WARNING_FRAMES
      if (missing) Reflect.deleteProperty(adventure.actors, 5)
      else state.holes[5].phase = 'off'
      tickActors(state)
      expect(actor.swapWith).toBeNull()
      expect(adventure.stolenWeapon).toBeNull()
    }
  })

  it('reserves an announced pair against another trick and escape', () => {
    const { state, adventure, actor } = pair()
    actor.age = FPS * 2 - 1
    tickActors(state)
    expect(actor.swapWith).toBe(5)
    escapeActor(state, 4)
    expect(adventure.actors[4]).toBe(actor)
  })

  it('does not helmet an innocent guest or an already protected friend', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 4, 'tinkerer')
    addActor(state, 5, 'innocent')
    addActor(state, 6, 'helmet')
    state.holes[6].nikaiRemaining = 0
    for (let frame = 0; frame < FPS * 2; frame++) tickActors(state)
    expect(state.holes[5].nikaiRemaining).toBe(0)
    expect(state.holes[6].nikaiRemaining).toBe(0)
    escapeActor(state, 5)
    expect(adventure.actors[5]).toBeUndefined()
  })

  it('applies cake insurance on escape and advances the stolen-weapon clock', () => {
    const { state, adventure } = adventureGame()
    adventure.upgrades = ['cakeShield']
    addActor(state, 4, 'prankster')
    stealWeapon(state, 4)
    tickAdventure(state, () => 0.5)
    expect(adventure.stolenWeapon?.age).toBe(1)
    const health = state.hp
    escapeActor(state, 4)
    expect(state.hp).toBe(health - 2)
    escapeActor(state, 4)
    expect(state.hp).toBe(health - 2)
  })
})
