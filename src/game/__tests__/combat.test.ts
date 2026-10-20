import { describe, expect, it, vi } from 'vitest'
import * as catalog from '@game/catalog'
import {
  applyCoinDamage,
  applyDamage,
  applyItem,
  enemyFromCatalogFrame,
  onEnemyKilled,
  syncPlayerAttack,
} from '@game/combat'
import { createInitialState } from '@game/engine'
import { fresh, place } from '@game/__tests__/helpers/events.helpers'
describe('combat helpers', () => {
  it('applies healing damage and stone guard', () => {
    const state = createInitialState()
    state.hp = 5
    expect(applyDamage(state, -3)).toBe(true)
    expect(state.hp).toBe(8)

    state.stone = true
    expect(applyDamage(state, 5)).toBe(false)
    expect(state.stone).toBe(false)
    expect(state.hp).toBe(8)
  })

  it('steals coins without going negative', () => {
    const state = createInitialState()
    state.money = 3
    applyCoinDamage(state, 10)
    expect(state.money).toBe(0)
  })

  it('covers treasure items and hammer tiers', () => {
    const state = createInitialState()
    applyItem(state, 'allcoin')
    place(state, 3, { kind: 'mob', attack: 40, score: 50 })
    state.moguraOn = 1
    applyItem(state, 'alllife')
    applyItem(state, 'sekiban1')
    applyItem(state, 'sekiban2')
    applyItem(state, 'sekiban3')
    applyItem(state, 'hammer1')
    syncPlayerAttack(state)
    expect(state.playerAttack).toBeGreaterThan(0)
  })

  it('builds spawns from catalog rows', () => {
    const twoHit = enemyFromCatalogFrame(20)
    expect(twoHit.kind).toBe('twoHit')
    expect(enemyFromCatalogFrame(19).item).toBe('coin')
    vi.spyOn(catalog, 'catalogForFrame').mockReturnValue({
      frame: 98,
      enemyI: 1,
    })
    expect(enemyFromCatalogFrame(98).hp).toBe(1)
    vi.spyOn(catalog, 'catalogForFrame').mockReturnValue({
      frame: 99,
      hp: 1,
      attack: -12,
      score: 0,
    })
    const coinThief = enemyFromCatalogFrame(99)
    expect(coinThief.kind).toBe('item')
    expect(coinThief.coinSteal).toBe(12)
    vi.restoreAllMocks()
    const state = fresh()
    place(state, 1, { kind: 'boss', catalogFrame: 14, attack: 0 })
    place(state, 2, { kind: 'mob', catalogFrame: 5 })
    state.money = 0
    applyItem(state, 'allcoin')
    onEnemyKilled(state, state.holes[2].enemy)
    expect(state.score).toBeGreaterThan(0)

    const noCoin = createInitialState()
    onEnemyKilled(noCoin, {
      kind: 'mob',
      hp: 0,
      maxHp: 1,
      attack: 0,
      score: 0,
    })
    expect(noCoin.money).toBe(0)
  })

  it('ignores unknown treasure ids', () => {
    const state = createInitialState()
    applyItem(state, 'crystal' as never)
    expect(state.playerAttack).toBeGreaterThan(0)
  })
})
