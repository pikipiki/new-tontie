export type HoleIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type MolePhase = 'off' | 'rising' | 'top' | 'falling'

export type EnemyKind = 'none' | 'mob' | 'twoHit' | 'item' | 'boss' | 'shop' | 'treasure'

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

export type GamePhase = 'playing' | 'paused' | 'shop' | 'levelClear' | 'gameOver' | 'win'

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
}
