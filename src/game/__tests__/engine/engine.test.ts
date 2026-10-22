import { describe, expect, it } from 'vitest'
import gameSpec from '@reference/game-spec.json'
import catalog from '@reference/enemy-catalog.json'
import { bossForLevel, isBossLevel } from '@game/enemies'
import {
  createInitialState,
  isIdlePhase,
  numpadToHole,
  queueHit,
  startLevel,
  tick,
  togglePause,
} from '@game/engine'
import { FPS, INIT, ROUND_SECONDS, hammerDamage } from '@game/spec'

describe('game engine', () => {
  it('initializes from game-spec constants', () => {
    const state = createInitialState()
    expect(state.level).toBe(1)
    expect(state.roundFramesLeft).toBe(ROUND_SECONDS * FPS)
    expect(state.kakurituOrg).toBe(
      gameSpec.timingFrames.kakuritu_org === 'fps * 2'
        ? FPS * 2
        : INIT.kakurituOrg,
    )
    expect(state.hp).toBe(INIT.heartMax)
    expect(state.lvUpSikakuK).toBe(FPS * ROUND_SECONDS)
  })

  it('maps numpad holes 1-9', () => {
    expect(numpadToHole('5')).toBe(5)
    expect(numpadToHole('a')).toBeNull()
  })

  it('hammer damage matches ffdec DefineSprite_208', () => {
    expect(hammerDamage(1)).toBe(1)
    expect(hammerDamage(4)).toBe(7)
    expect(hammerDamage(99)).toBe(7)
  })

  it('boss levels match spec and catalog frames', () => {
    expect(isBossLevel(10)).toBe(true)
    expect(isBossLevel(9)).toBe(false)
    expect(bossForLevel(10).score).toBe(500)
    expect(bossForLevel(20).score).toBe(1000)
    expect(bossForLevel(15).catalogFrame).toBe(14)
    const lv10 = catalog.entries.find((entry) => entry.frame === 14)
    expect(lv10?.enemyI).toBe('boss')
  })

  it('queues gun hits without hammer animation', () => {
    const state = createInitialState()
    startLevel(state)
    state.gun = 1
    queueHit(state, 5)
    expect(state.pendingHits).toHaveLength(1)
    expect(state.hammerStrikes).toHaveLength(0)
  })

  it('ignores pause toggles outside play states', () => {
    const state = createInitialState()
    state.phase = 'shop'
    togglePause(state)
    expect(state.phase).toBe('shop')
  })

  it('treats menus and pause as idle, not the live round', () => {
    expect(isIdlePhase('paused')).toBe(true)
    expect(isIdlePhase('shop')).toBe(true)
    expect(isIdlePhase('playing')).toBe(false)
    expect(isIdlePhase('levelClear')).toBe(false)
  })

  it('accepts hammer input on active mole', () => {
    const state = createInitialState()
    startLevel(state)
    state.holes[5] = {
      phase: 'top',
      phaseTicks: 0,
      enemy: { kind: 'mob', hp: 1, maxHp: 1, attack: 30, score: 10 },
      nikaiRemaining: 0,
    }
    state.moguraOn = 1
    queueHit(state, 5)
    const random = () => 0.99
    tick(state, random)
    expect(state.holes[5].phase).toBe('off')
    expect(state.score).toBeGreaterThan(0)
  })
})
