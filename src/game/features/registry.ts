import { loadBuiltinBossLevels, resetBossLevels } from './bossLevels'
import { resetEnemyBuilders } from './enemyBuilders'
import { createBuiltinItemEffects } from './itemEffects'
import { loadBuiltinRoundRules, resetRoundRules } from './roundRules'
import { createBuiltinShopOffers } from './shopOffers'
import { loadBuiltinShopLevels, resetShopLevels } from './shopLevels'
import {
  ensureGameFeaturesLoaded,
  resetFeatureBoot,
  setFeatureLoader,
} from './featureBoot'
import type { ItemEffectFeature, ShopOfferFeature } from './types'

const shopOffers: ShopOfferFeature[] = []
const itemEffects = new Map<
  ItemEffectFeature['id'],
  ItemEffectFeature['apply']
>()

function loadBuiltins(): void {
  loadBuiltinShopLevels()
  loadBuiltinBossLevels()
  loadBuiltinRoundRules()
  for (const offer of createBuiltinShopOffers()) {
    shopOffers.push(offer)
  }
  for (const effect of createBuiltinItemEffects()) {
    commitItemEffect(effect)
  }
}

setFeatureLoader(loadBuiltins)

export { ensureGameFeaturesLoaded } from './featureBoot'

/** Stable list reference — grows when offers are registered. */
export function getShopOffers(): ShopOfferFeature[] {
  ensureGameFeaturesLoaded()
  return shopOffers
}

export function registerShopOffer(offer: ShopOfferFeature): void {
  ensureGameFeaturesLoaded()
  if (shopOffers.some((row) => row.id === offer.id)) {
    throw new Error(`shop offer already registered: ${offer.id}`)
  }
  shopOffers.push(offer)
}

function commitItemEffect(effect: ItemEffectFeature): void {
  itemEffects.set(effect.id, effect.apply)
}

export function registerItemEffect(effect: ItemEffectFeature): void {
  ensureGameFeaturesLoaded()
  if (itemEffects.has(effect.id)) {
    throw new Error(`item effect already registered: ${effect.id}`)
  }
  commitItemEffect(effect)
}

export function getItemEffects(): ReadonlyMap<
  ItemEffectFeature['id'],
  ItemEffectFeature['apply']
> {
  ensureGameFeaturesLoaded()
  return itemEffects
}

/** Test hook: restore catalog to built-in rows only. */
export function resetFeatureRegistry(): void {
  shopOffers.length = 0
  itemEffects.clear()
  resetShopLevels()
  resetBossLevels()
  resetRoundRules()
  resetEnemyBuilders()
  resetFeatureBoot()
  ensureGameFeaturesLoaded()
}
