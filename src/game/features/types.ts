import type { EnemySpawn, GameState, ItemId } from '../types'
import type { RandomSource } from '../clock'

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

/** Levels that open the merchant after the clear panel (not mid-round shop holes). */
export interface ShopLevelFeature {
  level: number
}

/** Boss encounter keyed by campaign level → catalog frame. */
export interface BossLevelFeature {
  level: number
  catalogFrame: number
}

/** Override or extend catalog-frame → {@link EnemySpawn} resolution. */
export interface EnemyBuilderFeature {
  id: string
  match: (catalogFrame: number) => boolean
  build: (catalogFrame: number) => EnemySpawn
}

export type RoundTickPhase = 'after-clock' | 'after-spawn'

/** Hook on each playing tick; order matches registration within the same phase. */
export interface RoundRuleFeature {
  id: string
  phase: RoundTickPhase
  tick: (state: GameState, random: RandomSource) => void
}
