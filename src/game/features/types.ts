import type { GameState, ItemId } from '../types'

/** Purchasable upgrade or consumable shown in the merchant grid. */
export interface ShopOfferFeature {
  id: string
  label: string
  price: number
  apply: (state: GameState) => boolean
}

export type ItemEffect = (state: GameState, amount: number) => void

export interface ItemEffectFeature {
  id: ItemId
  apply: ItemEffect
}
