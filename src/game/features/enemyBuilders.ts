import { defaultEnemyFromCatalogFrame } from './defaultEnemy'
import type { EnemyBuilderFeature } from './types'
import type { EnemySpawn } from '../types'

const enemyBuilders: EnemyBuilderFeature[] = []

export function registerEnemyBuilder(builder: EnemyBuilderFeature): void {
  if (enemyBuilders.some((row) => row.id === builder.id)) {
    throw new Error(`enemy builder already registered: ${builder.id}`)
  }
  enemyBuilders.push(builder)
}

export function resolveEnemyFromCatalogFrame(frame: number): EnemySpawn {
  for (const builder of enemyBuilders) {
    if (builder.match(frame)) {
      return builder.build(frame)
    }
  }
  return defaultEnemyFromCatalogFrame(frame)
}

export function listEnemyBuilders(): readonly EnemyBuilderFeature[] {
  return enemyBuilders
}

export function resetEnemyBuilders(): void {
  enemyBuilders.length = 0
}
