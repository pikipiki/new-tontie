import { describe, expect, it, vi } from 'vitest'
import {
  FakeContext,
  installAudioCoverHarness,
} from '@/audio/__tests__/harness'

installAudioCoverHarness()

describe('audioInternal boot paths', () => {
  it('no-ops when Web Audio is unavailable', async () => {
    vi.resetModules()
    vi.stubGlobal('window', undefined)
    const internal = await import('@/audio/runtime')
    internal.playSfx('push')
    internal.playMusic('game')
    expect(FakeContext.instances).toHaveLength(0)
  })

  it('covers load short-circuits and buffer reuse', async () => {
    const internal = await import('@/audio/runtime')
    internal.__testClearAudioEngine()
    await internal.__testLoadSound(33)
    internal.unlockAudio()
    await internal.__testLoadSound(33)
    await internal.__testLoadSound(33)
  })

  it('short-circuits gain updates before the engine exists', async () => {
    const internal = await import('@/audio/runtime')
    internal.setMuted(true)
    expect(internal.isMuted()).toBe(true)
  })

  it('reuses cached loads and survives decode failures', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.endsWith('/33.mp3')) {
        return Promise.resolve(new Response('', { status: 500 }))
      }
      return Promise.resolve(new Response(new ArrayBuffer(4), { status: 200 }))
    })
    vi.stubGlobal('fetch', fetchMock)
    const internal = await import('@/audio/runtime')
    internal.unlockAudio()
    internal.playSfx('push')
    internal.playSfx('push')
    await vi.waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(([url]) => url.endsWith('/33.mp3')),
      ).toHaveLength(1)
    })
  })

  it('ignores sfx before unlock and survives constructor failures', async () => {
    vi.resetModules()
    vi.stubGlobal('AudioContext', function BrokenAudioContext() {
      throw new Error('no audio')
    })
    const internal = await import('@/audio/runtime')
    internal.playSfx('push')
    internal.unlockAudio()
    expect(FakeContext.instances).toHaveLength(0)
  })

  it('tolerates storage errors when toggling mute', async () => {
    const internal = await import('@/audio/runtime')
    internal.unlockAudio()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    internal.setMuted(true)
    expect(internal.isMuted()).toBe(true)
  })
})
