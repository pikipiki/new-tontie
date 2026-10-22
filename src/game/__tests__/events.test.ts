import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MUSIC_BANK, SOUND_BANK, soundUrl } from '@/audio'
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
} from '@game/engine'
import {
  fresh,
  neverSpawn,
  place,
} from '@game/__tests__/helpers/events.helpers'
import { ROUND_SECONDS, FPS } from '@game/spec'

describe('game events round flow', () => {
  it('opens on the level panel; START begins the round and the game BGM', () => {
    const state = createInitialState()
    expect(state.phase).toBe('levelIntro')
    tick(state, () => 0)
    expect(state.roundFramesLeft).toBe(ROUND_SECONDS * FPS)
    queueHit(state, 5)
    expect(state.pendingHits).toEqual([])
    startLevel(state)
    expect(state.phase).toBe('playing')
    expect(drainEvents(state)).toEqual([{ kind: 'roundStart', music: 'game' }])
    expect(drainEvents(state)).toEqual([])
    startLevel(state)
    expect(drainEvents(state)).toEqual([])
  })

  it('introduces DefineSprite_458 frame lv + 4 on each panel', () => {
    expect(introCatalogFrame(1)).toBe(5)
    expect(introCatalogFrame(10)).toBe(14)
    expect(introCatalogFrame(20)).toBe(24)
  })

  it('round end shows LEVEL CLEAR with stats, then the next level panel', () => {
    const state = fresh()
    place(state, 4, {})
    queueHit(state, 4)
    tick(state, neverSpawn)
    queueHit(state, 1)
    tick(state, neverSpawn)
    place(state, 2, { attack: 0 }, 'falling')
    state.levelStats.monsters += 2
    state.holes[2].phaseTicks = state.koma - 1
    tick(state, neverSpawn)
    drainEvents(state)
    state.roundFramesLeft = 1
    tick(state, neverSpawn)
    expect(state.phase).toBe('levelClear')
    expect(drainEvents(state)).toEqual([
      { kind: 'levelUp', sfx: 'level_up', music: 'stop' },
    ])
    expect(state.lastClear).toEqual({
      level: 1,
      hitRate: 50,
      beatRate: 50,
      scoreGained: 10,
    })
    for (let frame = 0; frame < LEVEL_CLEAR_FRAMES; frame++)
      tick(state, neverSpawn)
    expect(state.phase).toBe('levelIntro')
    expect(state.level).toBe(2)
    expect(drainEvents(state)).toEqual([
      { kind: 'intro', sfx: 'panel', frame: 6 },
    ])
    expect(state.levelStats).toEqual({
      swings: 0,
      misses: 0,
      monsters: 0,
      lost: 0,
      scoreStart: state.score,
    })
  })

  it('stat percentages round to one decimal like up_boad frame 67', () => {
    expect(statPercent(0, 0)).toBe(100)
    expect(statPercent(3, 1)).toBe(66.7)
    expect(statPercent(8, 0)).toBe(100)
  })
})

describe('game events shop and win', () => {
  it('shop levels open the shop after LEVEL CLEAR; level 20 wins', () => {
    const state = fresh()
    state.level = 10
    state.roundFramesLeft = 1
    tick(state, neverSpawn)
    for (let frame = 0; frame < LEVEL_CLEAR_FRAMES; frame++)
      tick(state, neverSpawn)
    expect(state.phase).toBe('shop')
    expect(drainEvents(state).at(-1)).toEqual({
      kind: 'shop',
      sfx: 'shop_in',
    })

    const winState = fresh()
    winState.level = 20
    winState.roundFramesLeft = 1
    tick(winState, neverSpawn)
    expect(winState.phase).toBe('win')
    expect(drainEvents(winState)).toContainEqual({
      kind: 'win',
      sfx: 'last',
      music: 'stop',
    })
  })

  it('a merchant shop resumes the same round with its remaining time', () => {
    const state = fresh()
    place(state, 5, { kind: 'shop', attack: 0 })
    state.roundFramesLeft = 300
    queueHit(state, 5)
    tick(state, neverSpawn)
    expect(state.phase).toBe('shop')
    expect(state.holes[5].phase).toBe('off')
    const left = state.roundFramesLeft
    tick(state, neverSpawn)
    expect(state.roundFramesLeft).toBe(left)
    closeShop(state)
    expect(state.phase).toBe('playing')
    expect(state.level).toBe(1)
    expect(state.roundFramesLeft).toBe(left)
    expect(drainEvents(state).at(-1)).toEqual({ kind: 'resume' })
  })

  it('shop purchases play buy or no_buy, leaving the shop opens the next panel', () => {
    const state = fresh()
    expect(buyShopIndex(state, 0)).toBe(false)
    state.phase = 'shop'
    state.money = 0
    buyShopIndex(state, 0)
    state.money = 999
    buyShopIndex(state, 0)
    closeShop(state)
    expect(drainEvents(state)).toEqual([
      { kind: 'noBuy', sfx: 'no_buy', offer: 0 },
      { kind: 'buy', sfx: 'buy', offer: 0 },
      { kind: 'intro', sfx: 'panel', frame: 6 },
    ])
    expect(state.phase).toBe('levelIntro')
  })
})

describe('game events combat cues', () => {
  it('a kill plays todome on the right hole', () => {
    const state = fresh()
    place(state, 4, { catalogFrame: 6 })
    queueHit(state, 4)
    tick(state, neverSpawn)
    expect(drainEvents(state)).toContainEqual(
      expect.objectContaining({
        kind: 'kill',
        hole: 4,
        frame: 6,
        sfx: 'todome',
      }),
    )
  })

  it('bombs explode with bokan', () => {
    for (const frame of BOMB_FRAMES) {
      const state = fresh()
      place(state, 2, { catalogFrame: frame, attack: 0 })
      queueHit(state, 2)
      tick(state, neverSpawn)
      expect(
        drainEvents(state).find((event) => event.kind === 'kill')?.sfx,
      ).toBe('bokan')
    }
  })

  it('a surviving enemy plays hit, and a miss plays karaburi then damage', () => {
    const state = fresh()
    place(state, 5, { hp: 5, maxHp: 5 })
    queueHit(state, 5)
    tick(state, neverSpawn)
    expect(drainEvents(state)).toContainEqual({
      kind: 'hit',
      hole: 5,
      frame: 5,
      sfx: 'hit',
    })

    queueHit(state, 1)
    tick(state, neverSpawn)
    const sfx = drainEvents(state).map((event) => event.sfx)
    expect(sfx).toEqual(['karaburi', 'damage'])
  })

  it('stone guard absorbs damage with no_damege', () => {
    const state = fresh()
    state.stone = true
    queueHit(state, 1)
    tick(state, neverSpawn)
    expect(drainEvents(state).map((event) => event.kind)).toEqual([
      'miss',
      'guard',
    ])
    expect(state.hp).toBe(state.hpMax)
  })

  it('an escaping enemy hurts the player with the damage sound', () => {
    const state = fresh()
    place(state, 3, { attack: 15 }, 'falling')
    state.holes[3].phaseTicks = state.koma - 1
    tick(state, neverSpawn)
    expect(drainEvents(state)).toContainEqual({
      kind: 'damage',
      hole: 3,
      sfx: 'damage',
    })
    expect(state.hp).toBe(state.hpMax - 15)
  })
})

describe('game events pause boss and game over', () => {
  it('pause / resume use the SWF pause labels', () => {
    const state = fresh()
    togglePause(state)
    togglePause(state)
    expect(drainEvents(state).map((event) => event.sfx)).toEqual([
      'pause',
      'pause_kaijo',
    ])
  })

  it('boss levels switch to the boss loop and warn with hurry', () => {
    const state = fresh()
    state.phase = 'shop'
    state.level = 9
    closeShop(state)
    expect(drainEvents(state).at(-1)).toEqual({
      kind: 'intro',
      sfx: 'panel',
      frame: 14,
    })
    startLevel(state)
    expect(drainEvents(state).at(-1)).toEqual({
      kind: 'roundStart',
      music: 'boss',
    })
    state.roundFramesLeft = HURRY_FRAMES + 1
    tick(state, neverSpawn)
    expect(drainEvents(state).map((event) => event.kind)).toContain('hurry')
  })

  it('game over plays the gameover jingle', () => {
    const state = fresh()
    state.continues = 1
    state.hp = 0
    tick(state, neverSpawn)
    expect(drainEvents(state)).toContainEqual({
      kind: 'gameOver',
      music: 'gameover',
    })
  })
})

describe('sound banks', () => {
  const root = resolve(import.meta.dirname, '../../../public')

  it('every SFX and BGM id has an exported mp3', () => {
    const ids = [
      ...Object.values(SOUND_BANK).flat(),
      ...Object.values(MUSIC_BANK).flatMap((music) => music.ids),
    ]
    for (const soundId of ids) {
      expect(
        existsSync(resolve(root, `.${soundUrl(soundId)}`)),
        soundUrl(soundId),
      ).toBe(true)
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
