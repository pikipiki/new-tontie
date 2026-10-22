import gameSpec from '@reference/game-spec.json'
import type { ShopOfferFeature } from './types'
import { applyShopEffect, type ShopEffectSpec } from './shopOfferEffects'

type ShopOfferRow = {
  id: string
  label?: string
  price: number
  effect: ShopEffectSpec
}

/** Flash-faithful defaults if `shop.offers` is missing from the spec. */
const FALLBACK_OFFERS: ShopOfferRow[] = [
  { id: 'hammer2', price: 10, effect: { kind: 'hammer', level: 2 } },
  { id: 'hammer3', price: 50, effect: { kind: 'hammer', level: 3 } },
  { id: 'hammer4', price: 80, effect: { kind: 'hammer', level: 4 } },
  { id: 'heart1', price: 90, effect: { kind: 'heal', amount: 8 } },
  { id: 'wing', price: 120, effect: { kind: 'wing' } },
  { id: 'heart2', price: 150, effect: { kind: 'heal', amount: 16 } },
  {
    id: 'continue',
    price: 200,
    effect: { kind: 'continue', amount: 1 },
  },
  { id: 'heart3', price: 300, effect: { kind: 'fullHeal' } },
]

function shopOfferRows(): ShopOfferRow[] {
  const rows = gameSpec.shop.offers
  if (Array.isArray(rows) && rows.length > 0) {
    return rows as ShopOfferRow[]
  }
  return FALLBACK_OFFERS
}

function rowToFeature(row: ShopOfferRow): ShopOfferFeature {
  const effect = row.effect
  return {
    id: row.id,
    label: row.label ?? row.id,
    price: row.price,
    apply: (state) => applyShopEffect(state, effect),
  }
}

/** Default shop rows (from `reference/game-spec.json` → `shop.offers`). */
export function createBuiltinShopOffers(): ShopOfferFeature[] {
  return shopOfferRows().map(rowToFeature)
}
