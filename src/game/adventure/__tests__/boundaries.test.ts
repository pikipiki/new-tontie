import { describe, expect, it } from 'vitest'
import { createInitialState, numpadToHole } from '@game/engine'
import { announce } from '@game/engine/shared'
import { treasureEnemy } from '@game/combat'
import { rollEnemyForHole } from '@game/enemies'
import { applyShopEffect } from '@game/features/shopOfferEffects'
import {
  prepareAdventure,
  finishAdventureStage,
  chooseUpgrade,
  failAdventure,
  clearBoard,
} from '../state'
import { spawnAdventure, removeActor } from '../spawn'
import { tickAdventure } from '../simulation'
import { tickDonut } from '../donut'
import { tickActors, escapeActor } from '../interactions'
import { resolveAdventureHits } from '../combat'
import { spawnConductor, strikeConductor, tickConductor } from '../boss'
import { moveWeaponWithSwap, stealWeapon } from '../weapons'
import { adventureGame, addActor } from './helpers'
import { FPS } from '../../spec'
import { HOLES } from '../../engine/shared'
import { UPGRADES } from '../content'
import type { UpgradeId } from '../types'

describe('mode boundaries', () => {
  it('adventure commands leave a classic session in its original mode', () => {
    const state = createInitialState()
    prepareAdventure(state)
    finishAdventureStage(state, () => 0)
    chooseUpgrade(state, 'laser')
    failAdventure(state, 'test')
    spawnAdventure(state, () => 0)
    tickAdventure(state, () => 0)
    tickDonut(state)
    tickActors(state)
    escapeActor(state, 4)
    resolveAdventureHits(state)
    spawnConductor(state)
    strikeConductor(state, 8)
    tickConductor(state)
    moveWeaponWithSwap(state, 4, 5)
    stealWeapon(state, 4)
    removeActor(state, 4)
    announce(state, 'test')
    clearBoard(state)
    expect(state.adventure).toBeUndefined()
    expect(state.phase).toBe('levelIntro')
    expect(state.events).toEqual([])
  })

  it('uses the original treasure roll and handles invalid shop effects safely', () => {
    const state = createInitialState()
    state.shopL = 1
    expect(rollEnemyForHole(state, () => 0).kind).toBe('treasure')
    expect(treasureEnemy(() => 0).item).toBeDefined()
    expect(applyShopEffect(state, { kind: 'continue' })).toBe(true)
    expect(applyShopEffect(state, { kind: 'unknown' } as never)).toBe(false)
    expect(numpadToHole('1.5')).toBeNull()
  })
})

describe('adventure boundary conditions', () => {
  it('keeps a stolen weapon attached across either side of a swap', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 4, 'prankster')
    stealWeapon(state, 4)
    moveWeaponWithSwap(state, 5, 4)
    expect(adventure.stolenWeapon?.holder).toBe(5)
    moveWeaponWithSwap(state, 1, 2)
    expect(adventure.stolenWeapon?.holder).toBe(5)
    if (!adventure.stolenWeapon) throw new Error('Weapon missing')
    adventure.stolenWeapon.holder = null
    moveWeaponWithSwap(state, 1, 2)
    expect(adventure.stolenWeapon.dropHole).toBe(5)
  })

  it('extends the final boss window correctly and freezes it only after the warning', () => {
    const { state, adventure } = adventureGame(6)
    spawnConductor(state)
    if (!adventure.boss) throw new Error('Boss missing')
    adventure.boss.frames = 1
    tickConductor(state)
    expect(adventure.boss.frames).toBe(FPS * 2)
    adventure.frenzyFrames = 10
    tickConductor(state)
    expect(adventure.boss.frames).toBe(FPS * 2)
  })

  it('reserves a dropped weapon hole instead of spawning on top of it', () => {
    const { state, adventure } = adventureGame()
    addActor(state, 1, 'prankster')
    stealWeapon(state, 1)
    removeActor(state, 1)
    adventure.spawnIn = 0
    spawnAdventure(state, () => 0)
    expect(state.holes[1].phase).toBe('off')
    expect(state.moguraOn).toBe(1)
    for (const hole of HOLES) state.holes[hole].phase = 'top'
    adventure.spawnIn = 0
    spawnAdventure(state, () => 0)
    expect(state.moguraOn).toBe(1)
  })

  it.each([1, 2, 3, 4, 5, 6])('cycles roles throughout stage %i', (stage) => {
    const roles = new Set<string>()
    for (let spawned = -3; spawned < 12; spawned += 1) {
      const { state, adventure } = adventureGame(stage)
      adventure.spawnIn = 0
      adventure.spawned = spawned
      spawnAdventure(state, () => 0)
      const role = adventure.actors[1]?.role
      expect(role).toBeDefined()
      if (role) roles.add(role)
    }
    expect(roles.size).toBeGreaterThan(0)
  })

  it('continues with no upgrade offers if all powers are already owned', () => {
    const { state, adventure } = adventureGame()
    adventure.upgrades = Object.keys(UPGRADES) as UpgradeId[]
    finishAdventureStage(state, () => 0)
    expect(state.phase).toBe('levelIntro')
    expect(adventure.stage).toBe(2)
    expect(adventure.offers).toEqual([])
  })

  it('distinguishes a completed donut after a thief has stolen sugar', () => {
    const { state, adventure } = adventureGame()
    adventure.snackSeconds = 8.44
    adventure.biteCount = 3
    adventure.charge = 0
    tickDonut(state)
    expect(adventure.donuts).toBe(1)
    expect(adventure.notice).toContain('Keep eating')
  })
})

describe('laser safety', () => {
  it('spends ammunition without hurting the player on an empty hole', () => {
    const { state } = adventureGame()
    state.gun = 1
    state.gunAmmo = 2
    state.pendingHits.push(5)
    const health = state.hp
    resolveAdventureHits(state)
    expect(state.hp).toBe(health)
    expect(state.gunAmmo).toBe(1)
    expect(state.levelStats.misses).toBe(1)
  })
})
