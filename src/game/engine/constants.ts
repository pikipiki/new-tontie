import type { ItemId, SoundLabel } from '../types'
import { FPS } from '../spec'

/** Catalog frames drawn as bombs; their se is "bokan" (DefineSprite_458 frames 12/23). */
export const BOMB_FRAMES: readonly number[] = [12, 21, 23]

/** DefineSprite_590 turns the boss timer red, then DefineSprite_589 frame 12 plays "hurry". */
export const HURRY_FRAMES = FPS * 5

/** up_boad "up" (frame 26) → frame 71 where `_root.lv += 1` and the next panel opens. */
export const LEVEL_CLEAR_FRAMES = 45

/** Each level opens with up_boad "on": the monster it introduces is DefineSprite_458 frame lv + 4. */
export function introCatalogFrame(level: number): number {
  return level + 4
}

/** up_boad frame 67: Math.round((total - bad) / total * 1000) / 10. */
export function statPercent(total: number, bad: number): number {
  if (total <= 0) return 100
  return Math.round(((total - bad) / total) * 1000) / 10
}

/** DefineSprite_669 `se` per item. */
export const ITEM_SFX: Record<ItemId, SoundLabel> = {
  life: 'life_get',
  utsuwa: 'sp_get',
  coin: 'coin_get',
  stone: 'crystal_get',
  gun: 'gun_get',
  wing: 'sp_get',
  allcoin: 'allcoin_get',
  alllife: 'alllife_get',
  hammer1: 'item_on',
  hammer2: 'item_on',
  hammer3: 'item_on',
  hammer4: 'item_on',
  sekiban1: 'sekiban',
  sekiban2: 'sekiban',
  sekiban3: 'sekiban',
}
