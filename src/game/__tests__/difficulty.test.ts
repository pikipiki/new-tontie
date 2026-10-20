import { describe, expect, it } from 'vitest'
import { applyLevelUpRamp, applyLvSet, applyLvSetBurst } from '@game/difficulty'
import {
  closeShop,
  createInitialState,
  queueHit,
  startLevel,
  tick,
} from '@game/engine'
import { FPS, INIT } from '@game/spec'

describe('normal mode difficulty (DefineSprite_590 frame 3)', () => {
  it('applies silver-mode lv_set ramps', () => {
    const state = createInitialState()
    state.chousei = 2
    state.kakurituOrg = 3
    applyLvSet(state)
    expect(state.kakurituOrg).toBe(2)
    state.kakurituOrg = 2
    applyLvSet(state)
    expect(state.kakurituOrg).toBe(2)
    state.kakurituOrg = 5
    applyLvSet(state)
    expect(state.kakurituOrg).toBe(2.5)
    state.koma = 1
    state.topStay = 1
    applyLvSet(state)
    applyLvSetBurst(state, 2)
    expect(state.koma).toBeLessThan(FPS)
  })

  it('starts at the frame_25 timings', () => {
    const state = createInitialState()
    expect(state.koma).toBe(FPS)
    expect(state.topStay).toBe(FPS * 4)
    expect(state.kakurituOrg).toBe(FPS * 2)
  })

  it('ramps one step per level and never goes below the _mx floors', () => {
    const state = createInitialState()
    for (let index = 0; index < 100; index++) applyLevelUpRamp(state)
    expect(state.koma).toBe(INIT.upCharMx)
    expect(state.topStay).toBeGreaterThanOrEqual(INIT.upTopMx)
    expect(state.kakurituOrg).toBe(INIT.upKakurituMx)
  })

  it('level 3 still rises over koma ≥ 15 frames, even after many kills', () => {
    const state = createInitialState()
    for (let level = 1; level < 3; level++) {
      startLevel(state)
      for (let kill = 0; kill < 30; kill++) {
        state.holes[5] = {
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
        state.moguraOn = 1
        queueHit(state, 5)
        tick(state, () => 0.99)
      }
      state.phase = 'shop'
      closeShop(state)
    }
    expect(state.level).toBe(3)
    expect(state.koma).toBe(FPS - 2)
    expect(state.topStay).toBe(FPS * 4 - 2 * INIT.upTop)
  })
})
