import { describe, expect, it } from 'vitest'
import gameSpec from '../../reference/game-spec.json'
import catalog from '../../reference/enemy-catalog.json'
import { bossForLevel, isBossLevel } from './enemies'
import { createInitialState, numpadToHole, queueHit, tick } from './engine'
import { FPS, INIT, ROUND_SECONDS, hammerDamage } from './spec'

describe('game engine', () => {
  it('initializes from game-spec constants', () => {
    const s = createInitialState()
    expect(s.level).toBe(1)
    expect(s.roundFramesLeft).toBe(ROUND_SECONDS * FPS)
    expect(s.kakurituOrg).toBe(gameSpec.timingFrames.kakuritu_org === 'fps * 2' ? FPS * 2 : INIT.kakurituOrg)
    expect(s.hp).toBe(INIT.heartMax)
    expect(s.lvUpSikakuK).toBe(FPS * ROUND_SECONDS)
  })

  it('maps numpad holes 1-9', () => {
    expect(numpadToHole('5')).toBe(5)
    expect(numpadToHole('a')).toBeNull()
  })

  it('hammer damage matches ffdec DefineSprite_208', () => {
    expect(hammerDamage(1)).toBe(1)
    expect(hammerDamage(4)).toBe(7)
  })

  it('boss levels match spec and catalog frames', () => {
    expect(isBossLevel(10)).toBe(true)
    expect(isBossLevel(9)).toBe(false)
    expect(bossForLevel(10).score).toBe(500)
    expect(bossForLevel(20).score).toBe(1000)
    const lv10 = catalog.entries.find((e) => e.frame === 14)
    expect(lv10?.enemyI).toBe('boss')
  })

  it('accepts hammer input on active mole', () => {
    const s = createInitialState()
    s.holes[5] = {
      phase: 'top',
      phaseTicks: 0,
      enemy: { kind: 'mob', hp: 1, maxHp: 1, attack: 30, score: 10 },
      nikaiRemaining: 0,
    }
    s.moguraOn = 1
    queueHit(s, 5)
    const random = () => 0.99
    tick(s, random)
    expect(s.holes[5].phase).toBe('off')
    expect(s.score).toBeGreaterThan(0)
  })
})
