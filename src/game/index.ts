/**
 * Public simulation API (UI-agnostic). Import from `@game` for engine types and commands.
 */

export type {
  EnemyKind,
  EnemySpawn,
  GameEvent,
  GameEventKind,
  GamePhase,
  GameState,
  HoleIndex,
  HoleState,
  HammerStrike,
  ItemId,
  MolePhase,
  MusicLabel,
  SoundLabel,
} from './types'

export type { RandomSource, Clock } from './clock'

export {
  beginRound,
  BOMB_FRAMES,
  buyHammerUpgrade,
  buyShopIndex,
  closeShop,
  createInitialState,
  drainEvents,
  HURRY_FRAMES,
  introCatalogFrame,
  LEVEL_CLEAR_FRAMES,
  numpadToHole,
  queueHit,
  startLevel,
  statPercent,
  tick,
  togglePause,
} from './engine'

export { HOLE_ORDER, HOLE_POS } from './layout'
export { createSeededRandom } from './rng'
export { runReplay, type ReplayInput, type ReplayScript } from './replay-run'
export { stateFingerprint } from './replay'

export {
  getItemEffects,
  getShopOffers,
  registerItemEffect,
  registerShopOffer,
  resetFeatureRegistry,
  type ItemEffect,
  type ItemEffectFeature,
  type ShopOfferFeature,
} from './features'

export { heal } from './stats'
