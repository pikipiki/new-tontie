import { describe, expect, it } from 'vitest'
import { FPS } from '../../spec'
import { queueHit, tick, togglePause } from '../../engine'
import { activateSugarRush, tickDonut } from '../donut'
import { tickActors } from '../interactions'
import { adventureGame, addActor, advance } from './helpers'

describe('tactical donut', () => {
  it('charges each of four bites, finishes the entire donut and regenerates another', () => {
    const { state, adventure } = adventureGame()
    for (let frame = 0; frame < FPS * 11; frame += 1) tickDonut(state)
    expect(adventure.biteCount).toBe(4)
    expect(adventure.charge).toBe(4)
    expect(adventure.donuts).toBe(1)
    expect(adventure.snackSeconds).toBeGreaterThan(10.8)
    expect(adventure.frenzyFrames).toBeGreaterThan(0)
    for (let frame = 0; frame < FPS * 11; frame += 1) tickDonut(state)
    expect(adventure.donuts).toBe(2)
    expect(adventure.charge).toBe(4)
  })
  it('interrupts eating during flight without losing a partly eaten donut', () => {
    const { state, adventure } = adventureGame()
    adventure.snackSeconds = 4
    queueHit(state, 5)
    advance(state, FPS)
    expect(adventure.snackSeconds).toBe(4)
    tick(state, () => 0.3)
    expect(adventure.snackSeconds).toBeGreaterThan(4)
  })
  it('freezes simulation during pause', () => {
    const { state, adventure } = adventureGame()
    const time = state.roundFramesLeft
    togglePause(state)
    advance(state, FPS * 12)
    expect(adventure.snackSeconds).toBe(0)
    expect(state.roundFramesLeft).toBe(time)
    expect(state.moguraOn).toBe(0)
  })
  it('spends exactly four charges, freezes Goonks and doubles score', () => {
    const { state, adventure } = adventureGame()
    adventure.charge = 3
    activateSugarRush(state)
    expect(adventure.frenzyFrames).toBe(0)
    adventure.charge = 4
    activateSugarRush(state)
    expect(adventure.charge).toBe(0)
    expect(adventure.frenzyFrames).toBe(6 * FPS)
    addActor(state, 5, 'thief')
    tickActors(state)
    expect(adventure.actors[5]?.age).toBe(0)
    queueHit(state, 5)
    tick(state, () => 0.3)
    expect(state.score).toBe(50)
  })
  it('combines faster eating and a longer frenzy', () => {
    const { state, adventure } = adventureGame()
    adventure.upgrades = ['quickBites', 'longRush']
    for (let frame = 0; frame < FPS * 7; frame += 1) tickDonut(state)
    expect(adventure.donuts).toBe(1)
    expect(adventure.frenzyFrames).toBeGreaterThan(3 * FPS)
  })
})
