import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MUSIC_BANK, SOUND_BANK, soundUrl } from './audio'
import {
  BOMB_FRAMES,
  buyShopIndex,
  closeShop,
  createInitialState,
  drainEvents,
  HURRY_FRAMES,
  introCatalogFrame,
  LEVEL_CLEAR_FRAMES,
  queueHit,
  startLevel,
  statPercent,
  tick,
  togglePause,
} from './engine'
import { ROUND_SECONDS, FPS } from './spec'
import type { EnemySpawn, GameState, HoleIndex } from './types'

const neverSpawn = () => 0.99

function place(
  state: GameState,
  hole: HoleIndex,
  enemy: Partial<EnemySpawn>,
  phase: 'top' | 'falling' = 'top',
) {
  state.holes[hole] = {
    phase,
    phaseTicks: 0,
    enemy: {
      kind: 'mob',
      hp: 1,
      maxHp: 1,
      attack: 10,
      score: 10,
      catalogFrame: 5,
      ...enemy,
    },
    nikaiRemaining: 0,
  }
  state.moguraOn += 1
}

function fresh(): GameState {
  const s = createInitialState()
  startLevel(s)
  drainEvents(s)
  return s
}

describe('game events (sound / music / animation cues)', () => {
  it('opens on the level panel; START begins the round and the game BGM', () => {
    const s = createInitialState()
    expect(s.phase).toBe('levelIntro')
    tick(s, () => 0)
    expect(s.roundFramesLeft).toBe(ROUND_SECONDS * FPS)
    queueHit(s, 5)
    expect(s.pendingHits).toEqual([])
    startLevel(s)
    expect(s.phase).toBe('playing')
    expect(drainEvents(s)).toEqual([{ kind: 'roundStart', music: 'game' }])
    expect(drainEvents(s)).toEqual([])
    startLevel(s)
    expect(drainEvents(s)).toEqual([])
  })

  it('introduces DefineSprite_458 frame lv + 4 on each panel', () => {
    expect(introCatalogFrame(1)).toBe(5)
    expect(introCatalogFrame(10)).toBe(14)
    expect(introCatalogFrame(20)).toBe(24)
  })

  it('round end shows LEVEL CLEAR with stats, then the next level panel', () => {
    const s = fresh()
    place(s, 4, {})
    queueHit(s, 4)
    tick(s, neverSpawn)
    queueHit(s, 1)
    tick(s, neverSpawn)
    place(s, 2, { attack: 0 }, 'falling')
    s.levelStats.monsters += 2
    s.holes[2].phaseTicks = s.koma - 1
    tick(s, neverSpawn)
    drainEvents(s)
    s.roundFramesLeft = 1
    tick(s, neverSpawn)
    expect(s.phase).toBe('levelClear')
    expect(drainEvents(s)).toEqual([
      { kind: 'levelUp', sfx: 'level_up', music: 'stop' },
    ])
    expect(s.lastClear).toEqual({
      level: 1,
      hitRate: 50,
      beatRate: 50,
      scoreGained: 10,
    })
    for (let i = 0; i < LEVEL_CLEAR_FRAMES; i++) tick(s, neverSpawn)
    expect(s.phase).toBe('levelIntro')
    expect(s.level).toBe(2)
    expect(drainEvents(s)).toEqual([{ kind: 'intro', sfx: 'panel', frame: 6 }])
    expect(s.levelStats).toEqual({
      swings: 0,
      misses: 0,
      monsters: 0,
      lost: 0,
      scoreStart: s.score,
    })
  })

  it('shop levels open the shop after LEVEL CLEAR; level 20 wins', () => {
    const s = fresh()
    s.level = 10
    s.roundFramesLeft = 1
    tick(s, neverSpawn)
    for (let i = 0; i < LEVEL_CLEAR_FRAMES; i++) tick(s, neverSpawn)
    expect(s.phase).toBe('shop')
    expect(drainEvents(s).at(-1)).toEqual({ kind: 'shop', sfx: 'shop_in' })

    const w = fresh()
    w.level = 20
    w.roundFramesLeft = 1
    tick(w, neverSpawn)
    expect(w.phase).toBe('win')
    expect(drainEvents(w)).toContainEqual({
      kind: 'win',
      sfx: 'last',
      music: 'stop',
    })
  })

  it('a merchant shop resumes the same round with its remaining time', () => {
    const s = fresh()
    place(s, 5, { kind: 'shop', attack: 0 })
    s.roundFramesLeft = 300
    queueHit(s, 5)
    tick(s, neverSpawn)
    expect(s.phase).toBe('shop')
    expect(s.holes[5].phase).toBe('off')
    const left = s.roundFramesLeft
    tick(s, neverSpawn)
    expect(s.roundFramesLeft).toBe(left)
    closeShop(s)
    expect(s.phase).toBe('playing')
    expect(s.level).toBe(1)
    expect(s.roundFramesLeft).toBe(left)
    expect(drainEvents(s).at(-1)).toEqual({ kind: 'resume' })
  })

  it('stat percentages round to one decimal like up_boad frame 67', () => {
    expect(statPercent(0, 0)).toBe(100)
    expect(statPercent(3, 1)).toBe(66.7)
    expect(statPercent(8, 0)).toBe(100)
  })

  it('a kill plays todome on the right hole', () => {
    const s = fresh()
    place(s, 4, { catalogFrame: 6 })
    queueHit(s, 4)
    tick(s, neverSpawn)
    expect(drainEvents(s)).toContainEqual({
      kind: 'kill',
      hole: 4,
      frame: 6,
      sfx: 'todome',
    })
  })

  it('bombs explode with bokan', () => {
    for (const frame of BOMB_FRAMES) {
      const s = fresh()
      place(s, 2, { catalogFrame: frame, attack: 0 })
      queueHit(s, 2)
      tick(s, neverSpawn)
      expect(drainEvents(s).find((e) => e.kind === 'kill')?.sfx).toBe('bokan')
    }
  })

  it('a surviving enemy plays hit, and a miss plays karaburi then damage', () => {
    const s = fresh()
    place(s, 5, { hp: 5, maxHp: 5 })
    queueHit(s, 5)
    tick(s, neverSpawn)
    expect(drainEvents(s)).toContainEqual({
      kind: 'hit',
      hole: 5,
      frame: 5,
      sfx: 'hit',
    })

    queueHit(s, 1)
    tick(s, neverSpawn)
    const sfx = drainEvents(s).map((e) => e.sfx)
    expect(sfx).toEqual(['karaburi', 'damage'])
  })

  it('stone guard absorbs damage with no_damege', () => {
    const s = fresh()
    s.stone = true
    queueHit(s, 1)
    tick(s, neverSpawn)
    expect(drainEvents(s).map((e) => e.kind)).toEqual(['miss', 'guard'])
    expect(s.hp).toBe(s.hpMax)
  })

  it('an escaping enemy hurts the player with the damage sound', () => {
    const s = fresh()
    place(s, 3, { attack: 15 }, 'falling')
    s.holes[3].phaseTicks = s.koma - 1
    tick(s, neverSpawn)
    expect(drainEvents(s)).toContainEqual({
      kind: 'damage',
      hole: 3,
      sfx: 'damage',
    })
    expect(s.hp).toBe(s.hpMax - 15)
  })

  it('pause / resume use the SWF pause labels', () => {
    const s = fresh()
    togglePause(s)
    togglePause(s)
    expect(drainEvents(s).map((e) => e.sfx)).toEqual(['pause', 'pause_kaijo'])
  })

  it('shop purchases play buy or no_buy, leaving the shop opens the next panel', () => {
    const s = fresh()
    expect(buyShopIndex(s, 0)).toBe(false)
    s.phase = 'shop'
    s.money = 0
    buyShopIndex(s, 0)
    s.money = 999
    buyShopIndex(s, 0)
    closeShop(s)
    expect(drainEvents(s)).toEqual([
      { kind: 'noBuy', sfx: 'no_buy', offer: 0 },
      { kind: 'buy', sfx: 'buy', offer: 0 },
      { kind: 'intro', sfx: 'panel', frame: 6 },
    ])
    expect(s.phase).toBe('levelIntro')
  })

  it('boss levels switch to the boss loop and warn with hurry', () => {
    const s = fresh()
    s.phase = 'shop'
    s.level = 9
    closeShop(s)
    expect(drainEvents(s).at(-1)).toEqual({
      kind: 'intro',
      sfx: 'panel',
      frame: 14,
    })
    startLevel(s)
    expect(drainEvents(s).at(-1)).toEqual({ kind: 'roundStart', music: 'boss' })
    s.roundFramesLeft = HURRY_FRAMES + 1
    tick(s, neverSpawn)
    expect(drainEvents(s).map((e) => e.kind)).toContain('hurry')
  })

  it('game over plays the gameover jingle', () => {
    const s = fresh()
    s.continues = 1
    s.hp = 0
    tick(s, neverSpawn)
    expect(drainEvents(s)).toContainEqual({
      kind: 'gameOver',
      music: 'gameover',
    })
  })
})

describe('sound banks', () => {
  const root = resolve(import.meta.dirname, '../../public')

  it('every SFX and BGM id has an exported mp3', () => {
    const ids = [
      ...Object.values(SOUND_BANK).flat(),
      ...Object.values(MUSIC_BANK).flatMap((m) => m.ids),
    ]
    for (const id of ids) {
      expect(existsSync(resolve(root, `.${soundUrl(id)}`)), soundUrl(id)).toBe(
        true,
      )
    }
  })

  it('matches the DefineSprite_65 / 71 frame labels', () => {
    expect(SOUND_BANK.hit).toEqual([35])
    expect(SOUND_BANK.todome).toEqual([38])
    expect(SOUND_BANK.bokan).toEqual([42])
    expect(SOUND_BANK.coin_get).toEqual([48])
    expect(MUSIC_BANK.game).toEqual({ ids: [66], loop: true })
    expect(MUSIC_BANK.boss.loop).toBe(true)
    expect(MUSIC_BANK.gameover.ids).toEqual([69, 70])
  })
})
