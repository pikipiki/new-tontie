import gameSpec from '@reference/game-spec.json'
import { resolveEnemyFromCatalogFrame } from './enemyBuilders'
import { ensureGameFeaturesLoaded } from './featureBoot'
import type { EnemySpawn } from '../types'

const bossByLevel = new Map<number, number>()

export function registerBossLevel(level: number, catalogFrame: number): void {
  ensureGameFeaturesLoaded()
  if (bossByLevel.has(level)) {
    throw new Error(`boss level already registered: ${String(level)}`)
  }
  bossByLevel.set(level, catalogFrame)
}

export function isBossLevel(level: number): boolean {
  ensureGameFeaturesLoaded()
  return bossByLevel.has(level)
}

export function bossCatalogFrame(level: number): number | undefined {
  ensureGameFeaturesLoaded()
  return bossByLevel.get(level)
}

export function bossForLevel(level: number): EnemySpawn {
  ensureGameFeaturesLoaded()
  const frame = bossByLevel.get(level) ?? 14
  return resolveEnemyFromCatalogFrame(frame)
}

export function listBossLevels(): readonly number[] {
  ensureGameFeaturesLoaded()
  return [...bossByLevel.keys()].sort((left, right) => left - right)
}

export function loadBuiltinBossLevels(): void {
  const [first, second] = gameSpec.round.bossLevels
  if (first !== undefined) registerBossLevel(first, 14)
  if (second !== undefined) registerBossLevel(second, 24)
}

export function resetBossLevels(): void {
  bossByLevel.clear()
}
