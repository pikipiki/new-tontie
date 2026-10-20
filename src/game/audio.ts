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
let musicGeneration = 0
let musicLoading = false
let resuming: Promise<void> | null = null
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
    .then((r) => {
      if (!r.ok) throw new Error(`Audio request failed: ${String(r.status)}`)
      return r.arrayBuffer()
    })
    .then((data) => ctx.decodeAudioData(data))
    .then((buf) => {
      buffers.set(id, buf)
      return buf
    })
    .catch(() => null)
    .finally(() => {
      loading.delete(id)
    })
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

/** iPhone Web Audio otherwise follows the hardware silent switch on supported WebKit versions. */
function requestPlaybackSession(): void {
  if (muted || typeof navigator === 'undefined') return
  const nav = navigator as Navigator & { audioSession?: { type: string } }
  try {
    if (nav.audioSession && nav.audioSession.type !== 'playback')
      nav.audioSession.type = 'playback'
  } catch {
    // AudioSession is optional; gesture-based Web Audio remains available.
  }
}

function resumeContext(ctx: AudioContext, gesture = false): void {
  if (ctx.state === 'running') {
    startCurrentMusic()
    return
  }
  if ((resuming && !gesture) || ctx.state === 'closed') return
  const attempt = ctx
    .resume()
    .then(() => {
      if (resuming === attempt) resuming = null
      if (engine?.ctx !== ctx) return
      applyGains()
      startCurrentMusic()
    })
    .catch(() => {
      if (resuming === attempt) resuming = null
    })
  resuming = attempt
}

/** Run synchronously during both pointerdown and touchend: iOS may only authorise the latter. */
export function unlockAudio(): void {
  requestPlaybackSession()
  if (engine?.ctx.state === 'closed') {
    engine = null
    musicSources = []
    musicGeneration += 1
    musicLoading = false
    resuming = null
  }
  if (!engine) {
    const Ctor = audioContextCtor()
    if (!Ctor) return
    try {
      const ctx = new Ctor({ latencyHint: 'interactive' })
      const sfx = ctx.createGain()
      const music = ctx.createGain()
      sfx.connect(ctx.destination)
      music.connect(ctx.destination)
      engine = { ctx, sfx, music }
      ctx.addEventListener('statechange', () => {
        if (engine?.ctx === ctx && !document.hidden && !muted)
          resumeContext(ctx)
      })
      applyGains()
      // Load the soundtrack before the rest of the effects on mobile connections.
      for (const id of [...MUSIC_BANK.game.ids, ...allSoundIds()]) void load(id)
    } catch {
      return
    }
  }
  const { ctx } = engine
  resumeContext(ctx, true)
  const silent = ctx.createBufferSource()
  silent.buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
  silent.connect(ctx.destination)
  silent.onended = () => {
    silent.disconnect()
  }
  silent.start(0)
}

/** Re-arm the existing audio after an iPhone interruption, without autoplaying before the first tap. */
export function installAudioLifecycle(): () => void {
  const gesture = () => {
    unlockAudio()
  }
  const restore = () => {
    if (engine && !document.hidden) unlockAudio()
  }
  const options = { capture: true, passive: true }
  window.addEventListener('pointerdown', gesture, options)
  window.addEventListener('touchend', gesture, options)
  window.addEventListener('keydown', gesture, options)
  window.addEventListener('pageshow', restore)
  window.addEventListener('focus', restore)
  document.addEventListener('visibilitychange', restore)
  return () => {
    window.removeEventListener('pointerdown', gesture, true)
    window.removeEventListener('touchend', gesture, true)
    window.removeEventListener('keydown', gesture, true)
    window.removeEventListener('pageshow', restore)
    window.removeEventListener('focus', restore)
    document.removeEventListener('visibilitychange', restore)
  }
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(on: boolean): void {
  muted = on
  if (!on) unlockAudio()
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
  src.onended = () => {
    src.disconnect()
  }
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
  musicGeneration += 1
  musicLoading = false
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

function startCurrentMusic(): void {
  if (!engine || !currentMusic || musicSources.length > 0 || musicLoading)
    return
  const label = currentMusic
  const def = MUSIC_BANK[label]
  const generation = musicGeneration
  const { ctx, music } = engine
  musicLoading = true
  void Promise.all(def.ids.map((id) => load(id))).then(() => {
    if (generation !== musicGeneration) return
    musicLoading = false
    if (currentMusic !== label || engine?.ctx !== ctx) return
    let when = ctx.currentTime
    def.ids.forEach((id, i) => {
      const last = i === def.ids.length - 1
      const source = startBuffer(id, music, when, def.loop && last)
      if (source) musicSources.push(source)
      when += def.gapSeconds ?? buffers.get(id)?.duration ?? 0
    })
  })
}

export function playMusic(label: MusicLabel): void {
  if (!engine) return
  if (currentMusic !== label || !MUSIC_BANK[label].loop) {
    stopMusic()
    currentMusic = label
  }
  startCurrentMusic()
}

/** Pause ducks the music instead of stopping it, like the SWF pause overlay. */
export function setMusicPaused(paused: boolean): void {
  musicPaused = paused
  applyGains()
}

export function currentMusicLabel(): MusicLabel | null {
  return currentMusic
}
