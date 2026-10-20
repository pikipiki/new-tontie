import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

class FakeSource {
  buffer: { duration: number } | null = null
  loop = false
  onended: (() => void) | null = null
  connect = vi.fn()
  disconnect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}
class FakeContext {
  static instances: FakeContext[] = []
  state = 'suspended'
  sampleRate = 48000
  currentTime = 1
  destination = {}
  sources: FakeSource[] = []
  listeners = new Map<string, () => void>()
  constructor() {
    FakeContext.instances.push(this)
  }
  resume = vi.fn(() => {
    this.state = 'running'
    return Promise.resolve()
  })
  createGain = vi.fn(() => ({
    connect: vi.fn(),
    gain: { setTargetAtTime: vi.fn() },
  }))
  createBufferSource = vi.fn(() => {
    const source = new FakeSource()
    this.sources.push(source)
    return source
  })
  createBuffer = vi.fn((_channels: number, length: number, rate: number) => ({
    duration: length / rate,
  }))
  decodeAudioData = vi.fn(() => Promise.resolve({ duration: 1 }))
  addEventListener = vi.fn((event: string, callback: () => void) => {
    this.listeners.set(event, callback)
  })
}
const response = () => new Response(new ArrayBuffer(4), { status: 200 })
const sessionDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  'audioSession',
)
let audioSession = { type: 'auto' }
let fetchAudio = vi.fn<(url: string) => Promise<Response>>(() =>
  Promise.resolve(response()),
)

function context() {
  const ctx = FakeContext.instances.at(-1)
  if (!ctx) throw new Error('Audio context was not created')
  return ctx
}

beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  FakeContext.instances = []
  audioSession = { type: 'auto' }
  Object.defineProperty(navigator, 'audioSession', {
    value: audioSession,
    configurable: true,
  })
  vi.stubGlobal('AudioContext', FakeContext)
  fetchAudio = vi.fn<(url: string) => Promise<Response>>(() =>
    Promise.resolve(response()),
  )
  vi.stubGlobal('fetch', fetchAudio)
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  if (sessionDescriptor)
    Object.defineProperty(navigator, 'audioSession', sessionDescriptor)
  else Reflect.deleteProperty(navigator, 'audioSession')
})

describe('iPhone audio activation', () => {
  it('requests playback audio and unlocks at the output sample rate during the first gesture', async () => {
    const audio = await import('./audio')
    audio.unlockAudio()
    expect(audioSession.type).toBe('playback')
    expect(context().resume).toHaveBeenCalledOnce()
    expect(context().createBuffer).toHaveBeenCalledWith(1, 1, 48000)
    expect(context().sources[0]?.start).toHaveBeenCalledWith(0)
  })
  it('unmuting unlocks audio even when Play has not been pressed', async () => {
    localStorage.setItem('tontie.muted', '1')
    const audio = await import('./audio')
    expect(audio.isMuted()).toBe(true)
    audio.setMuted(false)
    expect(context().resume).toHaveBeenCalledOnce()
    expect(audioSession.type).toBe('playback')
    expect(localStorage.getItem('tontie.muted')).toBe('0')
  })
  it('uses touchend to recover an interrupted iPhone context and cleans up its listeners', async () => {
    const audio = await import('./audio')
    const cleanup = audio.installAudioLifecycle()
    window.dispatchEvent(new Event('pointerdown'))
    await vi.waitFor(() => {
      expect(context().state).toBe('running')
    })
    const ctx = context()
    ctx.state = 'interrupted'
    window.dispatchEvent(new Event('touchend'))
    await vi.waitFor(() => {
      expect(ctx.resume).toHaveBeenCalledTimes(2)
    })
    cleanup()
    ctx.state = 'interrupted'
    window.dispatchEvent(new Event('touchend'))
    expect(ctx.resume).toHaveBeenCalledTimes(2)
  })
  it('retries on touchend even if a pointerdown resume promise is still pending', async () => {
    const audio = await import('./audio')
    const cleanup = audio.installAudioLifecycle()
    audio.unlockAudio()
    await Promise.resolve()
    const ctx = context()
    ctx.state = 'suspended'
    ctx.resume.mockImplementationOnce(() => new Promise<void>(() => {}))
    audio.unlockAudio()
    expect(ctx.state).toBe('suspended')
    window.dispatchEvent(new Event('touchend'))
    expect(ctx.resume).toHaveBeenCalledTimes(3)
    expect(ctx.state).toBe('running')
    cleanup()
  })
  it('recreates a context closed by iOS', async () => {
    const audio = await import('./audio')
    audio.unlockAudio()
    context().state = 'closed'
    audio.unlockAudio()
    expect(FakeContext.instances).toHaveLength(2)
    expect(context().state).toBe('running')
  })
  it('retries a failed mobile soundtrack download on the next gesture', async () => {
    let failed = false
    fetchAudio.mockImplementation((url) => {
      if (url.endsWith('/66.mp3') && !failed) {
        failed = true
        return Promise.resolve(new Response('', { status: 503 }))
      }
      return Promise.resolve(response())
    })
    const audio = await import('./audio')
    audio.unlockAudio()
    audio.playMusic('game')
    await vi.waitFor(() => {
      expect(failed).toBe(true)
      expect(context().decodeAudioData).toHaveBeenCalled()
    })
    expect(context().sources.filter((source) => source.loop)).toHaveLength(0)
    audio.unlockAudio()
    await vi.waitFor(() => {
      expect(context().sources.filter((source) => source.loop)).toHaveLength(1)
    })
    expect(
      fetchAudio.mock.calls.filter(([url]) => url.endsWith('/66.mp3')),
    ).toHaveLength(2)
  })
  it('does not duplicate a soundtrack when a cancelled download completes after a restart', async () => {
    let finish: ((value: Response) => void) | undefined
    const pending = new Promise<Response>((resolve) => {
      finish = resolve
    })
    fetchAudio.mockImplementation(async (url) =>
      url.endsWith('/66.mp3') ? pending : response(),
    )
    const audio = await import('./audio')
    audio.unlockAudio()
    audio.playMusic('game')
    audio.stopMusic()
    audio.playMusic('game')
    finish?.(response())
    await vi.waitFor(() => {
      expect(context().sources.filter((source) => source.loop)).toHaveLength(1)
    })
    audio.unlockAudio()
    await Promise.resolve()
    expect(context().sources.filter((source) => source.loop)).toHaveLength(1)
  })
})
