import { createBuiltinItemEffects } from './itemEffects'
import { createBuiltinShopOffers } from './shopOffers'
import type { ItemEffectFeature, ShopOfferFeature } from './types'

const shopOffers: ShopOfferFeature[] = []
const itemEffects = new Map<
  ItemEffectFeature['id'],
  ItemEffectFeature['apply']
>()

let builtinsLoaded = false

function loadBuiltins(): void {
  if (builtinsLoaded) {
    return
  }
  builtinsLoaded = true
  for (const offer of createBuiltinShopOffers()) {
    registerShopOffer(offer)
  }
  for (const effect of createBuiltinItemEffects()) {
    registerItemEffect(effect)
  }
}

/** Stable list reference — grows when offers are registered. */
export function getShopOffers(): ShopOfferFeature[] {
  loadBuiltins()
  return shopOffers
}

export function registerShopOffer(offer: ShopOfferFeature): void {
  loadBuiltins()
  if (shopOffers.some((row) => row.id === offer.id)) {
    throw new Error(`shop offer already registered: ${offer.id}`)
  }
  shopOffers.push(offer)
}

export function registerItemEffect(effect: ItemEffectFeature): void {
  loadBuiltins()
  if (itemEffects.has(effect.id)) {
    throw new Error(`item effect already registered: ${effect.id}`)
  }
  itemEffects.set(effect.id, effect.apply)
}

export function getItemEffects(): ReadonlyMap<
  ItemEffectFeature['id'],
  ItemEffectFeature['apply']
> {
  loadBuiltins()
  return itemEffects
}

/** Test hook: restore catalog to built-in rows only. */
export function resetFeatureRegistry(): void {
  shopOffers.length = 0
  itemEffects.clear()
  builtinsLoaded = false
  loadBuiltins()
}
