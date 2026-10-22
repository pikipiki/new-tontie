import gameSpec from '../../../reference/game-spec.json'
import { ensureGameFeaturesLoaded } from './featureBoot'

const shopLevels = new Set<number>()

export function registerShopLevel(level: number): void {
  ensureGameFeaturesLoaded()
  if (shopLevels.has(level)) {
    throw new Error(`shop level already registered: ${String(level)}`)
  }
  shopLevels.add(level)
}

export function levelOpensShop(level: number): boolean {
  ensureGameFeaturesLoaded()
  return shopLevels.has(level)
}

export function listShopLevels(): readonly number[] {
  ensureGameFeaturesLoaded()
  return [...shopLevels].sort((left, right) => left - right)
}

function builtinShopLevels(): readonly number[] {
  return gameSpec.shop.levels
}

export function loadBuiltinShopLevels(): void {
  for (const level of builtinShopLevels()) {
    registerShopLevel(level)
  }
}

export function resetShopLevels(): void {
  shopLevels.clear()
}
