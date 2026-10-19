import {
  enemyFromCatalogFrame,
  shopEnemy,
  treasureEnemy,
} from './combat'
import { rollSpawnDecision } from './spawn'
import { BOSS_HOLE, BOSS_LEVELS } from './spec'
import type { EnemySpawn, GameState, HoleIndex } from './types'

export function rollEnemyForHole(state: GameState, random: () => number): EnemySpawn {
  const decision = rollSpawnDecision(state, random)
  if (decision.type === 'shop') {
    return shopEnemy()
  }
  if (decision.type === 'treasure') {
    return treasureEnemy(random)
  }
  return enemyFromCatalogFrame(decision.catalogFrame)
}

export function bossForLevel(level: number): EnemySpawn {
  if (level === BOSS_LEVELS[0]) {
    return enemyFromCatalogFrame(14)
  }
  if (level === BOSS_LEVELS[1]) {
    return enemyFromCatalogFrame(24)
  }
  return enemyFromCatalogFrame(14)
}

export function isBossLevel(level: number): boolean {
  return (BOSS_LEVELS as readonly number[]).includes(level)
}

export function holeBlockedForRandomSpawn(level: number, hole: HoleIndex): boolean {
  return isBossLevel(level) && hole === BOSS_HOLE
}
