import { afterEach, describe, expect, it } from 'vitest'
import type { ItemId } from '@game/types'
import { createInitialState, tick } from '@game/engine'
import { applyItem, enemyFromCatalogFrame } from '@game/combat'
import {
  bossCatalogFrame,
  getShopOffers,
  levelOpensShop,
  listBossLevels,
  listEnemyBuilders,
  listShopLevels,
  registerBossLevel,
  registerEnemyBuilder,
  registerItemEffect,
  registerRoundRule,
  registerShopLevel,
  registerShopOffer,
  resetFeatureRegistry,
} from '@game/features'
import { buyShopOffer, SHOP_OFFERS } from '@game/shop'

afterEach(() => {
  resetFeatureRegistry()
})

describe('shop feature registry', () => {
  it('loads built-in shop rows', () => {
    expect(SHOP_OFFERS.length).toBeGreaterThanOrEqual(8)
    expect(getShopOffers()).toBe(SHOP_OFFERS)
  })

  it('registers extra shop offers without editing core shop code', () => {
    registerShopOffer({
      id: 'mod-coins',
      label: 'Bonus coins',
      price: 1,
      apply: (state) => {
        state.money += 50
        return true
      },
    })
    const state = createInitialState()
    state.money = 1
    const index = SHOP_OFFERS.findIndex((row) => row.id === 'mod-coins')
    expect(buyShopOffer(state, index)).toBe(true)
    expect(state.money).toBe(50)
  })

  it('registers mod item effects with new ids', () => {
    const pluginId = 'plugin_test' as ItemId
    registerItemEffect({
      id: pluginId,
      apply: (state) => {
        state.money += 7
      },
    })
    const state = createInitialState()
    applyItem(state, pluginId)
    expect(state.money).toBe(7)
  })

  it('rejects duplicate shop or item registration', () => {
    expect(() => {
      registerShopOffer({
        id: 'hammer2',
        label: 'dup',
        price: 1,
        apply: () => {
          return true
        },
      })
    }).toThrow(/already registered/)
    expect(() => {
      registerItemEffect({
        id: 'stone',
        apply: () => {
          /* duplicate */
        },
      })
    }).toThrow(/already registered/)
  })
})

describe('level and enemy feature registry', () => {
  it('registers shop levels and boss levels', () => {
    expect(listBossLevels().length).toBeGreaterThan(0)
    expect(listShopLevels().length).toBeGreaterThan(0)
    expect(bossCatalogFrame(10)).toBe(14)
    expect(bossCatalogFrame(3)).toBeUndefined()
    expect(listEnemyBuilders().length).toBeGreaterThanOrEqual(0)
    registerShopLevel(99)
    expect(levelOpensShop(99)).toBe(true)
    expect(() => {
      registerShopLevel(99)
    }).toThrow(/already registered/)
    expect(() => {
      registerBossLevel(10, 14)
    }).toThrow(/already registered/)
    expect(() => {
      registerEnemyBuilder({
        id: 'dup',
        match: () => false,
        build: () => ({
          kind: 'mob',
          hp: 1,
          maxHp: 1,
          attack: 0,
          score: 0,
        }),
      })
      registerEnemyBuilder({
        id: 'dup',
        match: () => false,
        build: () => ({
          kind: 'mob',
          hp: 1,
          maxHp: 1,
          attack: 0,
          score: 0,
        }),
      })
    }).toThrow(/already registered/)
  })

  it('registers custom enemy builders ahead of the default catalog mapping', () => {
    registerEnemyBuilder({
      id: 'test-mob',
      match: (frame) => frame === 99,
      build: () => ({
        kind: 'mob',
        hp: 9,
        maxHp: 9,
        attack: 1,
        score: 99,
        catalogFrame: 99,
      }),
    })
    const enemy = enemyFromCatalogFrame(99)
    expect(enemy.hp).toBe(9)
    expect(enemy.score).toBe(99)
  })
})

describe('round feature registry', () => {
  it('rejects duplicate round rules', () => {
    expect(() => {
      registerRoundRule({
        id: 'boss-hurry',
        phase: 'after-clock',
        tick: () => undefined,
      })
    }).toThrow(/already registered/)
  })

  it('runs custom round rules on playing ticks', () => {
    let ticks = 0
    registerRoundRule({
      id: 'count-ticks',
      phase: 'after-spawn',
      tick: () => {
        ticks += 1
      },
    })
    const state = createInitialState()
    state.phase = 'playing'
    tick(state, () => 0)
    expect(ticks).toBe(1)
  })
})
