import { describe, expect, it, vi } from 'vitest'
import { trySpawn } from '@game/engine/holes'
import { drainEvents, tick } from '@game/engine'
import { fresh, place } from '@game/__tests__/helpers/events.helpers'

describe('hole spawn rules', () => {
  it('skips spawn when the board is full or random picks a hole', () => {
    const full = fresh()
    for (const hole of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      place(full, hole, { kind: 'mob', hp: 1, attack: 0 })
    }
    full.kakurituCounter = 1
    trySpawn(full, () => 0)
    expect(full.moguraOn).toBe(9)

    const odd = fresh()
    odd.kakurituCounter = 1
    odd.moguraOn = 0
    vi.spyOn(Math, 'floor').mockReturnValueOnce(99)
    trySpawn(odd, () => 0.5)
    vi.restoreAllMocks()
  })

  it('filters the boss hole on boss levels and skips full boards', () => {
    const state = fresh()
    state.level = 10
    state.bossSpawned = true
    state.kakurituCounter = 1
    trySpawn(state, () => 0)

    const packed = fresh()
    for (const hole of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      place(packed, hole, { kind: 'mob', hp: 1, attack: 0 })
    }
    packed.kakurituCounter = 1
    packed.bossSpawned = true
    packed.level = 3
    packed.moguraOn = 0
    trySpawn(packed, () => 0)
    expect(packed.moguraOn).toBe(0)
  })

  it('spawns random enemies when the counter elapses', () => {
    const state = fresh()
    state.kakurituCounter = 1
    state.moguraOn = 0
    tick(state, () => 0)
    expect(state.moguraOn).toBeGreaterThan(0)
    expect(drainEvents(state).some((event) => event.kind === 'boss')).toBe(
      false,
    )
  })
})
