import { catalogForFrame, mapCatalogItem, rollTreasureItem } from './catalog'
import { getItemEffects } from './features'
import { addCoin } from './money'
import { hammerDamage } from './spec'
import type { EnemySpawn, GameState, ItemId } from './types'

export { heal } from './stats'

export function syncPlayerAttack(state: GameState): void {
  state.playerAttack = hammerDamage(state.hammerLv)
}

/**
 * frame_20 damage() — stone blocks positive damage once per hit animation (simplified).
 * Returns false when the stone absorbed the hit.
 */
export function applyDamage(state: GameState, amount: number): boolean {
  if (amount <= 0) {
    state.hp = Math.min(state.hpMax, state.hp - amount)
    return true
  }
  if (state.stone) {
    state.stone = false
    return false
  }
  state.hp -= amount
  return true
}

export function applyCoinDamage(state: GameState, amount: number): void {
  state.money = Math.max(0, state.money - amount)
}

export function enemyFromCatalogFrame(frame: number): EnemySpawn {
  const row = catalogForFrame(frame)
  const hitPoints = row.hp ?? 1
  const attack = row.attack ?? 0
  const score = row.score ?? 0
  const item = mapCatalogItem(row.item)

  if (row.enemyI === 'boss') {
    return {
      kind: 'boss',
      hp: hitPoints,
      maxHp: hitPoints,
      attack,
      score,
      catalogFrame: frame,
    }
  }

  if (row.nikai || row.enemyI === 2) {
    return {
      kind: 'twoHit',
      hp: hitPoints,
      maxHp: hitPoints,
      attack,
      score,
      catalogFrame: frame,
      item,
      nikai: true,
      counterDamage: row.counterDamage,
    }
  }

  if (item === 'life' || item === 'coin') {
    return {
      kind: 'item',
      hp: 1,
      maxHp: 1,
      attack,
      score,
      catalogFrame: frame,
      item,
    }
  }

  if (attack < 0) {
    return {
      kind: 'item',
      hp: 1,
      maxHp: 1,
      attack: 0,
      score,
      catalogFrame: frame,
      item: 'coin',
      coinSteal: Math.abs(attack),
    }
  }

  return {
    kind: 'mob',
    hp: hitPoints,
    maxHp: hitPoints,
    attack,
    score,
    catalogFrame: frame,
    item,
  }
}

export function treasureEnemy(random: () => number): EnemySpawn {
  const item = rollTreasureItem(random)
  return {
    kind: 'treasure',
    hp: 1,
    maxHp: 1,
    attack: 0,
    score: 0,
    item,
  }
}

export function shopEnemy(): EnemySpawn {
  return { kind: 'shop', hp: 1, maxHp: 1, attack: 0, score: 0 }
}

/** DefineSprite_669 takara() + item() — dispatches registered item features. */
export function applyItem(
  state: GameState,
  item: ItemId,
  healAmount = 8,
): void {
  const effect = getItemEffects().get(item)
  if (effect) {
    effect(state, healAmount)
  }
  syncPlayerAttack(state)
}

/**
 * DefineSprite_669 todome(). The kill-count speed ramp (DefineSprite_670 lv_set) only exists in
 * Silver mode (frame 141), so normal mode just counts kills.
 */
export function onEnemyKilled(state: GameState, enemy: EnemySpawn): void {
  state.score += enemy.score
  const coin = Math.min(30, Math.floor(enemy.score / 5))
  if (coin > 0) {
    addCoin(state, coin)
  }
  state.monsterL += 1
  state.monsterLs += 1
}
