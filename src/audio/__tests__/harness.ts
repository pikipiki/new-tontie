import { afterEach, beforeEach, vi } from 'vitest'

export class FakeSource {
  buffer: { duration: number } | null = null
  loop = false
  onended: (() => void) | null = null
  connect = vi.fn()
  disconnect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}

export class FakeContext {
  static instances: FakeContext[] = []
  state = 'running'
  sampleRate = 48000
  currentTime = 0
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
  decodeAudioData = vi.fn(() => Promise.resolve({ duration: 0.2 }))
  addEventListener = vi.fn((event: string, callback: () => void) => {
    this.listeners.set(event, callback)
  })
}

const audioResponse = () => new Response(new ArrayBuffer(4), { status: 200 })

/** First AudioContext created in the current test (after unlockAudio). */
export function requireFakeAudioContext(): FakeContext {
  const ctx = FakeContext.instances[0]
  if (!ctx) {
    throw new Error('expected FakeContext after unlockAudio()')
  }
  return ctx
}

export function installAudioCoverHarness(): void {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    FakeContext.instances = []
    vi.stubGlobal('AudioContext', FakeContext)
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(audioResponse())),
    )
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })
}
