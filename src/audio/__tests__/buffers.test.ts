import { afterEach, describe, expect, it, vi } from 'vitest'
import { SoundBufferCache } from '@/audio/buffers'

const buffer = { duration: 1 } as AudioBuffer
const response = () => new Response(new ArrayBuffer(4))
function context(decodeAudioData = vi.fn(() => Promise.resolve(buffer))) {
  return { decodeAudioData } as unknown as AudioContext
}
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('decoded sound cache', () => {
  it('deduplicates requests and reuses decoded clips without a context', async () => {
    const request = vi.fn(() => Promise.resolve(response()))
    vi.stubGlobal('fetch', request)
    const cache = new SoundBufferCache()
    expect(await cache.load(33, null)).toBeNull()
    const first = cache.load(33, context())
    expect(cache.load(33, context())).toBe(first)
    expect(await first).toBe(buffer)
    expect(await cache.load(33, null)).toBe(buffer)
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('retries network and decode failures', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockImplementation(() => Promise.resolve(response()))
    vi.stubGlobal('fetch', request)
    const cache = new SoundBufferCache()
    expect(await cache.load(33, context())).toBeNull()
    const failed = context(
      vi.fn(() => Promise.reject(new Error('invalid MP3'))),
    )
    expect(await cache.load(33, failed)).toBeNull()
    expect(await cache.load(33, context())).toBe(buffer)
  })

  it('discards an old decode without deleting the replacement request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(response())),
    )
    const oldDecode = Promise.withResolvers<AudioBuffer>()
    const oldDecoder = vi.fn(() => oldDecode.promise)
    const oldContext = context(oldDecoder)
    const cache = new SoundBufferCache()
    const old = cache.load(33, oldContext)
    await vi.waitFor(() => {
      expect(oldDecoder).toHaveBeenCalled()
    })
    cache.clear()
    const newDecode = Promise.withResolvers<AudioBuffer>()
    const newDecoder = vi.fn(() => newDecode.promise)
    const newContext = context(newDecoder)
    const replacement = cache.load(33, newContext)
    await vi.waitFor(() => {
      expect(newDecoder).toHaveBeenCalled()
    })
    oldDecode.resolve(buffer)
    expect(await old).toBeNull()
    expect(cache.buffers.size).toBe(0)
    expect(cache.load(33, newContext)).toBe(replacement)
    newDecode.resolve(buffer)
    expect(await replacement).toBe(buffer)
  })
})
