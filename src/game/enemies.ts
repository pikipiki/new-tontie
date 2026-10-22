import { isBossLevel } from './features/bossLevels'
import { rollSpawnDecision } from './spawn'
import { BOSS_HOLE } from './spec'
import { enemyFromCatalogFrame, shopEnemy, treasureEnemy } from './combat'
import type { EnemySpawn, GameState, HoleIndex } from './types'

export { bossForLevel, isBossLevel } from './features/bossLevels'

export function rollEnemyForHole(
  state: GameState,
  random: () => number,
): EnemySpawn {
  const decision = rollSpawnDecision(state, random)
  if (decision.type === 'shop') {
    return shopEnemy()
  }
  if (decision.type === 'treasure') {
    return treasureEnemy(random)
  }
  return enemyFromCatalogFrame(decision.catalogFrame)
}

export function holeBlockedForRandomSpawn(
  level: number,
  hole: HoleIndex,
): boolean {
  return isBossLevel(level) && hole === BOSS_HOLE
}
