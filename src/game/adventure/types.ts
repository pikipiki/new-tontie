import type { HoleIndex } from '../types'

export type AdventureRole =
  | 'thief'
  | 'tinkerer'
  | 'prankster'
  | 'singer'
  | 'impostor'
  | 'innocent'
  | 'helmet'
  | 'boss'
export type MissionKind = 'cake' | 'choir' | 'impostor' | 'helmets' | 'boss'
export type UpgradeId =
  | 'quickBites'
  | 'ricochet'
  | 'laser'
  | 'comfort'
  | 'longRush'
  | 'hammer'
  | 'extraTime'
  | 'cakeShield'
  | 'bounty'
export interface AdventureActor {
  role: AdventureRole
  age: number
  acted: boolean
  swapWith: HoleIndex | null
  swappedFrom?: HoleIndex
  swapAge?: number
}
export interface StolenWeapon {
  wing: boolean
  holder: HoleIndex | null
  dropHole: HoleIndex
  hammerLv: number
  gun: number
  ammo: number
  age: number
}
export interface AdventureState {
  stolenWeapon: StolenWeapon | null
  stage: number
  progress: number
  cake: number
  noise: number
  spawnIn: number
  spawned: number
  snackSeconds: number
  charge: number
  biteCount: number
  donuts: number
  flightFrames: number
  frenzyFrames: number
  upgrades: UpgradeId[]
  offers: UpgradeId[]
  actors: Partial<Record<HoleIndex, AdventureActor>>
  boss: {
    hp: number
    maxHp: number
    weak: HoleIndex
    frames: number
    warning: boolean
    wave: number
  } | null
  notice: string
  noticeFrames: number
  failure: string
}
