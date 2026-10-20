import { describe, expect, it } from 'vitest'
import { FPS } from '../../spec'
import { queueHit, tick } from '../../engine'
import { tickActors } from '../interactions'
import { resolveAdventureHits } from '../combat'
import { adventureGame, addActor } from './helpers'

function actFor(
  state: ReturnType<typeof adventureGame>['state'],
  frames: number,
) {
  for (let frame = 0; frame < frames; frame += 1) tickActors(state)
}
describe('Goonks cooperate', () => {
  it('a thief steals one charge and five coins once, with zero as the lower bound', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 5, 'thief')
    adventure.charge = 2
    state.money = 12
    actFor(state, FPS * 3)
    expect(adventure.charge).toBe(1)
    expect(state.money).toBe(7)
    expect(adventure.actors[5]?.acted).toBe(true)
  })
  it('a tinkerer protects a friend; the first hit breaks the helmet without killing', () => {
    const { state } = adventureGame(5)
    addActor(state, 5, 'tinkerer')
    addActor(state, 4, 'thief')
    actFor(state, FPS * 2)
    expect(state.holes[4].nikaiRemaining).toBe(1)
    queueHit(state, 4)
    resolveAdventureHits(state)
    expect(state.holes[4].enemy.hp).toBe(1)
    expect(state.holes[4].nikaiRemaining).toBe(0)
    expect(state.holes[4].enemy.nikai).toBe(true)
    expect(state.adventure?.progress).toBe(1)
    queueHit(state, 4)
    resolveAdventureHits(state)
    expect(state.holes[4].phase).toBe('off')
    expect(Object.keys(state.adventure?.actors ?? {})).not.toContain('4')
    expect(state.adventure?.progress).toBe(1)
  })
  it('a jester announces the pair before swapping their places', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 5, 'prankster')
    addActor(state, 4, 'singer')
    actFor(state, FPS * 2)
    expect(adventure.actors[5]?.swapWith).toBe(4)
    expect(adventure.actors[5]?.role).toBe('prankster')
    actFor(state, FPS)
    expect(adventure.actors[4]?.role).toBe('prankster')
    expect(adventure.actors[5]?.role).toBe('singer')
  })
  it('stopping a jester cancels its pending swap', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 5, 'prankster')
    addActor(state, 4, 'singer')
    actFor(state, FPS * 2)
    queueHit(state, 5)
    resolveAdventureHits(state)
    actFor(state, FPS)
    expect(adventure.actors[4]?.role).toBe('singer')
  })
})
describe('mission-specific decisions', () => {
  it('only singers advance the choir, and escaping singers raise the noise', () => {
    const { state, adventure } = adventureGame(2)
    addActor(state, 5, 'thief')
    queueHit(state, 5)
    resolveAdventureHits(state)
    expect(adventure.progress).toBe(0)
    addActor(state, 4, 'singer')
    actFor(state, FPS * 5 + 1)
    expect(adventure.noise).toBe(1)
  })
  it('an innocent guest costs health and never advances the impostor objective', () => {
    const { state, adventure } = adventureGame(4)
    addActor(state, 5, 'innocent')
    const health = state.hp
    queueHit(state, 5)
    resolveAdventureHits(state)
    expect(state.hp).toBe(health - 8)
    expect(adventure.progress).toBe(0)
    addActor(state, 4, 'impostor')
    queueHit(state, 4)
    tick(state, () => 0.3)
    expect(adventure.progress).toBe(1)
  })
})
