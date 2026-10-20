import { describe, expect, it } from 'vitest'
import { createInitialState, drainEvents, startLevel } from '@game/engine'
import {
  strikeBossKill,
  strikeItemPickup,
  strikeMiss,
  strikeMobKill,
  strikeShop,
  strikeTreasure,
  consumeLaserAmmo,
} from '@game/engine/strikeResolve'
import { fresh, place } from '@game/__tests__/helpers/events.helpers'
import type { HoleIndex } from '@game/types'

function hole(state: ReturnType<typeof fresh>, index: HoleIndex) {
  return state.holes[index]
}

describe('strikeResolve helpers', () => {
  it('counts misses and treasure pickups', () => {
    const state = fresh()
    strikeMiss(state, 1)
    expect(state.levelStats.misses).toBe(1)
    expect(drainEvents(state).map((event) => event.sfx)).toContain('karaburi')

    place(state, 3, { kind: 'treasure', attack: 0, item: 'coin' })
    strikeTreasure(state, 3)

    place(state, 6, { kind: 'treasure', attack: 0 })
    strikeTreasure(state, 6)
    expect(hole(state, 3).phase).toBe('off')
    expect(drainEvents(state).map((event) => event.sfx)).toContain('coin_get')
  })

  it('opens the shop and handles item pickups', () => {
    const state = fresh()
    place(state, 5, { kind: 'shop', attack: 0 })
    strikeShop(state, 5)
    expect(state.phase).toBe('shop')
    expect(state.shopResume).toBe(true)

    state.hp = 10
    place(state, 2, { kind: 'item', item: 'life', attack: 0 })
    strikeItemPickup(state, 2)
    expect(state.hp).toBe(18)
    expect(hole(state, 2).phase).toBe('off')

    place(state, 4, { kind: 'item', item: 'coin', coinSteal: 12, attack: 0 })
    strikeItemPickup(state, 4)
    expect(state.money).toBeGreaterThan(0)

    place(state, 8, { kind: 'item', item: 'coin', attack: 0 })
    strikeItemPickup(state, 8)
    expect(state.money).toBeGreaterThan(0)

    place(state, 9, { kind: 'item', item: 'wing', attack: 0 })
    strikeItemPickup(state, 9)
    expect(hole(state, 9).phase).toBe('off')
  })

  it('clears the board on boss kill and consumes ammo for a shot', () => {
    const state = fresh()
    state.gun = 1
    state.gunAmmo = 1
    place(state, 5, { kind: 'boss', catalogFrame: 14, attack: 0, score: 100 })
    strikeMobKill(state, 5, 14)
    strikeBossKill(state, 5)
    expect(state.lvup).toBe(1)
    expect(state.phase).toBe('levelClear')

    const gunState = fresh()
    gunState.gun = 1
    gunState.gunAmmo = 1
    consumeLaserAmmo(gunState)
    expect(gunState.gun).toBe(0)
    expect(drainEvents(gunState).at(-1)?.sfx).toBe('gun_end')

    const idle = createInitialState()
    startLevel(idle)
    consumeLaserAmmo(idle)
    expect(idle.gun).toBe(0)

    const armed = fresh()
    armed.gun = 1
    armed.gunAmmo = 3
    consumeLaserAmmo(armed)
    expect(armed.gun).toBe(1)
    expect(armed.gunAmmo).toBe(2)
  })
})
