/**
 * Public 3D presentation API. Simulation rules stay in `@game`.
 */

export * from '@game3d/layout3d'
export * from '@game3d/fx'
export {
  themeColors,
  INK,
  SKY,
  WHITE,
  YELLOW,
  PURPLE,
  RED,
  GREEN,
} from '@game3d/theme'

export type { GameEventPresenter } from '@game3d/presentation'
export {
  AudioGameEventPresenter,
  CompositeGameEventPresenter,
  createDefaultGameEventPresenter,
  FxGameEventPresenter,
} from '@game3d/presentation'
