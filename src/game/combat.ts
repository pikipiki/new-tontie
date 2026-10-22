import { rollTreasureItem } from './catalog'
import { ensureGameFeaturesLoaded, getItemEffects } from './features/registry'
import { resolveEnemyFromCatalogFrame } from './features/enemyBuilders'
import { addCoin } from './money'
import { syncPlayerAttack } from './stats'
export { applyDamage, applyCoinDamage, syncPlayerAttack } from './stats'
import type { EnemySpawn, GameState, ItemId } from './types'

export { heal } from './stats'

/**
 * frame_20 damage() — stone blocks positive damage once per hit animation (simplified).
 * Returns false when the stone absorbed the hit.
 */
export function enemyFromCatalogFrame(frame: number): EnemySpawn {
  ensureGameFeaturesLoaded()
  return resolveEnemyFromCatalogFrame(frame)
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
