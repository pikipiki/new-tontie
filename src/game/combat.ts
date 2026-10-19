import { catalogForFrame, mapCatalogItem, rollTreasureItem } from './catalog'
import { addCoin } from './money'
import { hammerDamage } from './spec'
import type { EnemySpawn, GameState, HoleIndex, ItemId } from './types'

const HOLES: HoleIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

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

export function heal(state: GameState, amount: number): void {
  state.hp = Math.min(state.hpMax, state.hp + amount)
}

export function enemyFromCatalogFrame(frame: number): EnemySpawn {
  const row = catalogForFrame(frame)
  const hp = row.hp ?? 1
  const attack = row.attack ?? 0
  const score = row.score ?? 0
  const item = mapCatalogItem(row.item)

  if (row.enemyI === 'boss') {
    return { kind: 'boss', hp, maxHp: hp, attack, score, catalogFrame: frame }
  }

  if (row.nikai || row.enemyI === 2) {
    return {
      kind: 'twoHit',
      hp,
      maxHp: hp,
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
    hp,
    maxHp: hp,
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

/** DefineSprite_669 takara() + item() */
export function applyItem(
  state: GameState,
  item: ItemId,
  healAmount = 8,
): void {
  switch (item) {
    case 'life':
    case 'utsuwa':
      heal(state, healAmount)
      break
    case 'coin':
      addCoin(state, healAmount)
      break
    case 'stone':
      state.stone = true
      break
    case 'gun':
      state.gun = 1
      state.gunAmmo = 8
      break
    case 'wing':
      state.wing = true
      break
    case 'allcoin':
      for (const h of HOLES) {
        const slot = state.holes[h]
        if (
          slot.phase !== 'off' &&
          slot.enemy.kind !== 'none' &&
          slot.enemy.kind !== 'boss'
        ) {
          addCoin(state, Math.min(30, Math.floor(slot.enemy.score / 5)))
          slot.enemy.attack = 0
        }
      }
      break
    case 'alllife':
      for (const h of HOLES) {
        const slot = state.holes[h]
        if (
          slot.phase !== 'off' &&
          slot.enemy.kind !== 'none' &&
          slot.enemy.kind !== 'boss'
        ) {
          slot.enemy.attack = 0
        }
      }
      heal(state, 12)
      break
    case 'hammer1':
      state.hammerLv = 1
      state.bronze = false
      state.silver = false
      state.gold = false
      break
    case 'hammer2':
      state.hammerLv = 2
      state.bronze = true
      break
    case 'hammer3':
      state.hammerLv = 3
      state.silver = true
      break
    case 'hammer4':
      state.hammerLv = 4
      state.gold = true
      break
    case 'sekiban1':
      state.sekiban1 = true
      break
    case 'sekiban2':
      state.sekiban2 = true
      break
    case 'sekiban3':
      state.sekiban3 = true
      break
    default:
      break
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
