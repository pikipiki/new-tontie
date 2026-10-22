import { publicUrl } from '@constants/publicUrl'
import type { MusicLabel, SoundLabel } from '@game/types'

/** DefineSprite_65 frame labels (`_root.sound(label)`) → DefineSound ids. */
export const SOUND_BANK: Record<SoundLabel, readonly number[]> = {
  push: [33],
  over: [34],
  key_push: [35],
  karaburi: [36],
  bun: [37],
  hit: [35],
  todome: [38],
  no_damege: [39],
  kan: [40],
  damage: [41],
  damage_coin: [40],
  bokan: [42],
  gun: [43],
  chakudan: [44],
  gun_get: [45],
  gun_end: [36],
  item_on: [46],
  life_get: [47],
  coin_get: [48],
  shop_in: [49],
  buy: [50],
  no_buy: [51],
  level_up: [52],
  crystal_get: [55],
  takara_open: [58],
  allcoin_get: [38],
  alllife_get: [38],
  sp_get: [59],
  sekiban: [60, 61],
  hammer_down: [62],
  pause: [39],
  pause_kaijo: [39],
  last: [64],
  /** DefineSprite_71 "hurry" is a one-shot over the boss loop (no syncStop). */
  hurry: [68],
  /** up_boad frames 2 / 11: the level panel slides in. */
  panel: [53],
  data_panel: [54],
}

/** DefineSprite_71 frame labels (`_root.sound2(label)`); loops follow StartSound loopCount=99. */
export const MUSIC_BANK: Record<
  MusicLabel,
  { ids: readonly number[]; loop: boolean; gapSeconds?: number }
> = {
  game: { ids: [66], loop: true },
  boss: { ids: [67], loop: true },
  /** frame 26 → 42 at 17 fps */
  gameover: { ids: [69, 70], loop: false, gapSeconds: 16 / 17 },
}

export const MUTE_KEY = 'tontie.muted'

export function readMutedPreference(): boolean {
  try {
    return (
      typeof localStorage !== 'undefined' &&
      localStorage.getItem(MUTE_KEY) === '1'
    )
  } catch {
    return false
  }
}

export function soundUrl(soundId: number): string {
  return publicUrl(`game/sounds/${String(soundId)}.mp3`)
}
