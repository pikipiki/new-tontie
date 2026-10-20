import { getShopOffers, type ShopOfferFeature } from './features'
import type { GameState } from './types'

export type ShopOffer = ShopOfferFeature

/** Live shop catalog (built-ins + {@link registerShopOffer} extensions). */
export const SHOP_OFFERS: ShopOffer[] = getShopOffers()

/** Hammer tier an offer sells (hammer2 → 2), or null for consumables. */
export function offerHammerLv(offer: ShopOffer): number | null {
  const match = /^hammer(\d)$/.exec(offer.id)
  return match ? Number(match[1]) : null
}

/** Hammers at or below the current tier and an already-earned wing can't be bought again. */
export function offerOwned(state: GameState, offer: ShopOffer): boolean {
  const hammerLevel = offerHammerLv(offer)
  if (hammerLevel !== null) return state.hammerLv >= hammerLevel
  return offer.id === 'wing' && state.wing
}

export function buyShopOffer(state: GameState, index: number): boolean {
  const offer = SHOP_OFFERS[index]
  if (!offer || state.money < offer.price) {
    return false
  }
  if (!offer.apply(state)) {
    return false
  }
  state.money -= offer.price
  return true
}

export { registerShopOffer } from './features'
