import config from '@/config/runtime.json'
import { SoundBufferCache } from './buffers'
import type { MusicLabel, SoundLabel } from '@game/types'
import { MUTE_KEY, MUSIC_BANK, readMutedPreference, SOUND_BANK } from './banks'

interface AudioEngine {
  ctx: AudioContext
  sfx: GainNode
  music: GainNode
}

let engine: AudioEngine | null = null
let muted = readMutedPreference()
let musicPaused = false
let currentMusic: MusicLabel | null = null
let musicSources: AudioBufferSourceNode[] = []
let musicGeneration = 0
let musicLoading = false
let resuming: Promise<void> | null = null
const bufferCache = new SoundBufferCache()
const buffers = bufferCache.buffers

function load(soundId: number): Promise<AudioBuffer | null> {
  return bufferCache.load(soundId, engine?.ctx ?? null)
}

function audioContextCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }
  const globalWindow = window as unknown as {
    AudioContext?: typeof AudioContext
    webkitAudioContext?: typeof AudioContext
  }
  return globalWindow.AudioContext ?? globalWindow.webkitAudioContext ?? null
}

function allSoundIds(): number[] {
  const soundIds = new Set<number>()
  for (const list of Object.values(SOUND_BANK))
    list.forEach((soundId) => soundIds.add(soundId))
  for (const track of Object.values(MUSIC_BANK))
    track.ids.forEach((soundId) => soundIds.add(soundId))
  return [...soundIds]
}

function applyGains(): void {
  if (!engine) {
    return
  }
  const audioTime = engine.ctx.currentTime
  engine.sfx.gain.setTargetAtTime(
    muted ? 0 : config.audio.effectsGain,
    audioTime,
    config.audio.effectsRampSeconds,
  )
  engine.music.gain.setTargetAtTime(
    muted || musicPaused ? 0 : config.audio.musicGain,
    audioTime,
    config.audio.musicRampSeconds,
  )
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
    bufferCache.clear()
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
      for (const soundId of [...MUSIC_BANK.game.ids, ...allSoundIds()])
        void load(soundId)
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

export function setMuted(muteOn: boolean): void {
  muted = muteOn
  if (!muteOn) unlockAudio()
  try {
    localStorage.setItem(MUTE_KEY, muteOn ? '1' : '0')
  } catch {
    /* private mode */
  }
  applyGains()
}

function startBuffer(
  soundId: number,
  out: GainNode,
  when: number,
  loop = false,
): AudioBufferSourceNode | null {
  const buf = buffers.get(soundId)
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
  const clipIds = SOUND_BANK[label]
  void Promise.all(clipIds.map((soundId) => load(soundId))).then(() => {
    if (engine?.ctx !== ctx) return
    let when = ctx.currentTime
    for (const soundId of clipIds) {
      startBuffer(soundId, sfx, when)
      when += buffers.get(soundId)?.duration ?? 0
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

function applyLoadedMusic(
  generation: number,
  label: MusicLabel,
  ctx: AudioContext,
): void {
  if (generation !== musicGeneration) {
    return
  }
  musicLoading = false
  if (currentMusic !== label || !engine || engine.ctx !== ctx) {
    return
  }
  const def = MUSIC_BANK[label]
  const music = engine.music
  let when = ctx.currentTime
  def.ids.forEach((soundId, trackIndex) => {
    const last = trackIndex === def.ids.length - 1
    const source = startBuffer(soundId, music, when, def.loop && last)
    if (source) musicSources.push(source)
    when += def.gapSeconds ?? buffers.get(soundId)?.duration ?? 0
  })
}

function startCurrentMusic(): void {
  if (!engine || !currentMusic || musicSources.length > 0 || musicLoading)
    return
  const label = currentMusic
  const generation = musicGeneration
  const { ctx } = engine
  musicLoading = true
  void Promise.all(MUSIC_BANK[label].ids.map((soundId) => load(soundId))).then(
    () => {
      applyLoadedMusic(generation, label, ctx)
    },
  )
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

export function __testLoadSound(soundId: number): Promise<AudioBuffer | null> {
  return load(soundId)
}
export function __testClearAudioEngine(): void {
  engine = null
  bufferCache.clear()
}
export function __testFireSfxEnd(soundId: number): void {
  if (!engine) return
  const source = startBuffer(soundId, engine.sfx, engine.ctx.currentTime)
  source?.onended?.(new Event('ended'))
}
export function __testApplyLoadedMusic(
  generation: number,
  label: MusicLabel,
  ctx: AudioContext,
): void {
  applyLoadedMusic(generation, label, ctx)
}
export function __testMusicGeneration(): number {
  return musicGeneration
}
