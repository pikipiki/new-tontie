import { describe, expect, it } from 'vitest'
import { applyLevelUpRamp } from './difficulty'
import {
  closeShop,
  createInitialState,
  queueHit,
  startLevel,
  tick,
} from './engine'
import { FPS, INIT } from './spec'

describe('normal mode difficulty (DefineSprite_590 frame 3)', () => {
  it('starts at the frame_25 timings', () => {
    const s = createInitialState()
    expect(s.koma).toBe(FPS)
    expect(s.topStay).toBe(FPS * 4)
    expect(s.kakurituOrg).toBe(FPS * 2)
  })

  it('ramps one step per level and never goes below the _mx floors', () => {
    const s = createInitialState()
    for (let i = 0; i < 100; i++) applyLevelUpRamp(s)
    expect(s.koma).toBe(INIT.upCharMx)
    expect(s.topStay).toBeGreaterThanOrEqual(INIT.upTopMx)
    expect(s.kakurituOrg).toBe(INIT.upKakurituMx)
  })

  it('level 3 still rises over koma ≥ 15 frames, even after many kills', () => {
    const s = createInitialState()
    for (let level = 1; level < 3; level++) {
      startLevel(s)
      for (let k = 0; k < 30; k++) {
        s.holes[5] = {
          phase: 'top',
          phaseTicks: 0,
          enemy: {
            kind: 'mob',
            hp: 1,
            maxHp: 1,
            attack: 0,
            score: 5,
            catalogFrame: 5,
          },
          nikaiRemaining: 0,
        }
        s.moguraOn = 1
        queueHit(s, 5)
        tick(s, () => 0.99)
      }
      s.phase = 'shop'
      closeShop(s)
    }
    expect(s.level).toBe(3)
    expect(s.koma).toBe(FPS - 2)
    expect(s.topStay).toBe(FPS * 4 - 2 * INIT.upTop)
  })
})
