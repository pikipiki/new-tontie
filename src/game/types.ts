export type HoleIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type MolePhase = 'off' | 'rising' | 'top' | 'falling'

export type EnemyKind =
  'none' | 'mob' | 'twoHit' | 'item' | 'boss' | 'shop' | 'treasure'

export type ItemId =
  | 'life'
  | 'coin'
  | 'stone'
  | 'gun'
  | 'allcoin'
  | 'alllife'
  | 'wing'
  | 'utsuwa'
  | 'hammer1'
  | 'hammer2'
  | 'hammer3'
  | 'hammer4'
  | 'sekiban1'
  | 'sekiban2'
  | 'sekiban3'

export interface EnemySpawn {
  kind: EnemyKind
  hp: number
  maxHp: number
  attack: number
  score: number
  catalogFrame?: number
  item?: ItemId
  nikai?: boolean
  counterDamage?: number
  coinSteal?: number
}

export interface HoleState {
  phase: MolePhase
  phaseTicks: number
  enemy: EnemySpawn
  nikaiRemaining: number
}

/** Per-hole hammer strike overlay (DefineSprite_562 → d{n}.hammer "on"). */
export interface HammerStrike {
  hole: HoleIndex
  frame: number
}

/** DefineSprite_65 labels played through `_root.sound()`. */
export type SoundLabel =
  | 'push'
  | 'over'
  | 'key_push'
  | 'karaburi'
  | 'bun'
  | 'hit'
  | 'todome'
  | 'no_damege'
  | 'kan'
  | 'damage'
  | 'damage_coin'
  | 'bokan'
  | 'gun'
  | 'chakudan'
  | 'gun_get'
  | 'gun_end'
  | 'item_on'
  | 'life_get'
  | 'coin_get'
  | 'shop_in'
  | 'buy'
  | 'no_buy'
  | 'level_up'
  | 'crystal_get'
  | 'takara_open'
  | 'allcoin_get'
  | 'alllife_get'
  | 'sp_get'
  | 'sekiban'
  | 'hammer_down'
  | 'pause'
  | 'pause_kaijo'
  | 'last'
  | 'hurry'
  | 'panel'
  | 'data_panel'

/** DefineSprite_71 labels played through `_root.sound2()`. */
export type MusicLabel = 'game' | 'boss' | 'gameover'

export type GameEventKind =
  | 'hit'
  | 'kill'
  | 'miss'
  | 'guard'
  | 'damage'
  | 'pickup'
  | 'shop'
  | 'buy'
  | 'noBuy'
  | 'boss'
  | 'hurry'
  | 'intro'
  | 'roundStart'
  | 'levelUp'
  | 'pause'
  | 'resume'
  | 'gameOver'
  | 'win'

/** Side effects of a tick (sound, music, animation cues) drained by the UI after each tick. */
export interface GameEvent {
  kind: GameEventKind
  hole?: HoleIndex
  sfx?: SoundLabel
  music?: MusicLabel | 'stop'
  /** Catalog frame of the enemy involved, for per-mob reactions. */
  frame?: number
  /** Shop offer index for buy / noBuy. */
  offer?: number
  /** Score awarded by a kill. */
  points?: number
}

export type GamePhase =
  | 'levelIntro'
  | 'playing'
  | 'paused'
  | 'shop'
  | 'levelClear'
  | 'gameOver'
  | 'win'

/** Per-level counters behind the "LEVEL CLEAR!!" panel (AS hit_l / miss_l / monster_l / lost_l). */
export interface LevelStats {
  swings: number
  misses: number
  monsters: number
  lost: number
  scoreStart: number
}

export interface LevelClearSummary {
  level: number
  /** Percent of swings that touched something, one decimal (AS hit_l). */
  hitRate: number
  /** Percent of monsters that did not escape, one decimal (AS beat_l). */
  beatRate: number
  scoreGained: number
}

export interface GameState {
  phase: GamePhase
  level: number
  score: number
  money: number
  hp: number
  hpMax: number
  hammerLv: number
  continues: number
  roundFramesLeft: number
  roundFrameCounter: number
  kakurituOrg: number
  koma: number
  topStay: number
  kakurituCounter: number
  moguraOn: number
  pikoOk: boolean
  pendingHits: HoleIndex[]
  hammerStrikes: HammerStrike[]
  holes: Record<HoleIndex, HoleState>
  bossSpawned: boolean
  /** Blocks random spawn during boss level-up (AS _root.lvup). */
  lvup: number
  /** DefineSprite_459 — one shop mole per round segment when roll hits. */
  shopL: number
  /** Mirrors _root.lv_up.sikaku.k (frames); shop spawn uses k / fps. */
  lvUpSikakuK: number
  wing: boolean
  stone: boolean
  gun: number
  gunAmmo: number
  bronze: boolean
  silver: boolean
  gold: boolean
  monsterL: number
  monsterLs: number
  monsterLsNext: number
  lvSilver: number
  chousei: number
  sekiban1: boolean
  sekiban2: boolean
  sekiban3: boolean
  playerAttack: number
  levelStats: LevelStats
  lastClear: LevelClearSummary | null
  /** Frames left on the "LEVEL CLEAR!!" panel (up_boad frames 26 → 71). */
  clearFramesLeft: number
  /** The open shop came from a merchant mole: leaving it resumes the round. */
  shopResume: boolean
  events: GameEvent[]
}
