import type { MusicLabel, SoundLabel } from './types'

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

const MUTE_KEY = 'tontie.muted'

export function soundUrl(id: number): string {
  return `/game/sounds/${String(id)}.mp3`
}

interface AudioEngine {
  ctx: AudioContext
  sfx: GainNode
  music: GainNode
}

let engine: AudioEngine | null = null
let muted = readMuted()
let musicPaused = false
let currentMusic: MusicLabel | null = null
let musicSources: AudioBufferSourceNode[] = []
const buffers = new Map<number, AudioBuffer>()
const loading = new Map<number, Promise<AudioBuffer | null>>()

function readMuted(): boolean {
  try {
    return (
      typeof localStorage !== 'undefined' &&
      localStorage.getItem(MUTE_KEY) === '1'
    )
  } catch {
    return false
  }
}

function audioContextCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }
  const w = window as unknown as {
    AudioContext?: typeof AudioContext
    webkitAudioContext?: typeof AudioContext
  }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

function allSoundIds(): number[] {
  const ids = new Set<number>()
  for (const list of Object.values(SOUND_BANK))
    list.forEach((id) => ids.add(id))
  for (const m of Object.values(MUSIC_BANK)) m.ids.forEach((id) => ids.add(id))
  return [...ids]
}

function load(id: number): Promise<AudioBuffer | null> {
  const cached = buffers.get(id)
  if (cached) {
    return Promise.resolve(cached)
  }
  const pending = loading.get(id)
  if (pending) {
    return pending
  }
  if (!engine) {
    return Promise.resolve(null)
  }
  const { ctx } = engine
  const p = fetch(soundUrl(id))
    .then((r) => r.arrayBuffer())
    .then((data) => ctx.decodeAudioData(data))
    .then((buf) => {
      buffers.set(id, buf)
      return buf
    })
    .catch(() => null)
  loading.set(id, p)
  return p
}

function applyGains(): void {
  if (!engine) {
    return
  }
  const t = engine.ctx.currentTime
  engine.sfx.gain.setTargetAtTime(muted ? 0 : 0.9, t, 0.01)
  engine.music.gain.setTargetAtTime(muted || musicPaused ? 0 : 0.55, t, 0.05)
}

/**
 * Must run inside a user gesture (pointerdown / keydown): iOS Safari and Android Chrome
 * keep the AudioContext suspended until then.
 */
export function unlockAudio(): void {
  if (!engine) {
    const Ctor = audioContextCtor()
    if (!Ctor) {
      return
    }
    const ctx = new Ctor()
    const sfx = ctx.createGain()
    const music = ctx.createGain()
    sfx.connect(ctx.destination)
    music.connect(ctx.destination)
    engine = { ctx, sfx, music }
    applyGains()
    for (const id of allSoundIds()) void load(id)
  }
  const { ctx } = engine
  if (ctx.state !== 'running') {
    void ctx.resume().catch(() => {})
  }
  const silent = ctx.createBufferSource()
  silent.buffer = ctx.createBuffer(1, 1, 22050)
  silent.connect(ctx.destination)
  silent.start(0)
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(on: boolean): void {
  muted = on
  try {
    localStorage.setItem(MUTE_KEY, on ? '1' : '0')
  } catch {
    /* private mode */
  }
  applyGains()
}

function startBuffer(
  id: number,
  out: GainNode,
  when: number,
  loop = false,
): AudioBufferSourceNode | null {
  const buf = buffers.get(id)
  if (!engine || !buf) {
    return null
  }
  const src = engine.ctx.createBufferSource()
  src.buffer = buf
  src.loop = loop
  src.connect(out)
  src.start(when)
  return src
}

export function playSfx(label: SoundLabel): void {
  if (!engine) {
    return
  }
  const { ctx, sfx } = engine
  const ids = SOUND_BANK[label]
  void Promise.all(ids.map((id) => load(id))).then(() => {
    let when = ctx.currentTime
    for (const id of ids) {
      startBuffer(id, sfx, when)
      when += buffers.get(id)?.duration ?? 0
    }
  })
}

export function stopMusic(): void {
  for (const src of musicSources) {
    try {
      src.stop()
    } catch {
      /* already stopped */
    }
  }
  musicSources = []
  currentMusic = null
}

export function playMusic(label: MusicLabel): void {
  if (!engine) {
    return
  }
  const def = MUSIC_BANK[label]
  if (currentMusic === label && def.loop) {
    return
  }
  stopMusic()
  currentMusic = label
  const { ctx, music } = engine
  void Promise.all(def.ids.map((id) => load(id))).then(() => {
    if (currentMusic !== label) {
      return
    }
    let when = ctx.currentTime
    def.ids.forEach((id, i) => {
      const last = i === def.ids.length - 1
      const src = startBuffer(id, music, when, def.loop && last)
      if (src) musicSources.push(src)
      when += def.gapSeconds ?? buffers.get(id)?.duration ?? 0
    })
  })
}

/** Pause ducks the music instead of stopping it, like the SWF pause overlay. */
export function setMusicPaused(paused: boolean): void {
  musicPaused = paused
  applyGains()
}

export function currentMusicLabel(): MusicLabel | null {
  return currentMusic
}
