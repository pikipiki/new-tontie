import { describe, expect, it, vi } from 'vitest'
import {
  FakeContext,
  installAudioCoverHarness,
  requireFakeAudioContext,
} from '@game/__tests__/helpers/audioInternal.harness'

installAudioCoverHarness()

describe('audioInternal playback paths', () => {
  it('plays sfx and music after unlock', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    internal.setMusicPaused(true)
    expect(internal.currentMusicLabel()).toBeNull()
    internal.playMusic('game')
    internal.setMusicPaused(false)
    await vi.waitFor(() => {
      expect(FakeContext.instances[0]?.sources.length).toBeGreaterThan(0)
    })
    internal.playSfx('push')
    internal.setMuted(false)
    internal.stopMusic()
    expect(internal.currentMusicLabel()).toBeNull()
  })

  it('resumes closed contexts from lifecycle hooks', async () => {
    const internal = await import('@game/audioInternal')
    const cleanup = internal.installAudioLifecycle()
    internal.unlockAudio()
    const ctx = requireFakeAudioContext()
    ctx.state = 'closed'
    window.dispatchEvent(new Event('focus'))
    cleanup()
    expect(FakeContext.instances.length).toBeGreaterThan(0)
  })

  it('handles context state changes and silent buffer teardown', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    const ctx = requireFakeAudioContext()
    ctx.state = 'suspended'
    ctx.listeners.get('statechange')?.()
    const silent = ctx.sources.at(-1)
    silent?.onended?.()
    expect(silent?.disconnect).toHaveBeenCalled()
  })

  it('swallows resume rejections', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    const ctx = requireFakeAudioContext()
    ctx.state = 'suspended'
    ctx.resume.mockImplementationOnce(() => Promise.reject(new Error('denied')))
    internal.unlockAudio()
    await vi.waitFor(() => {
      expect(ctx.resume).toHaveBeenCalled()
    })
  })

  it('invokes statechange and buffer onended handlers', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    const ctx = requireFakeAudioContext()
    await internal.__testLoadSound(33)
    internal.__testFireSfxEnd(33)
    internal.__testClearAudioEngine()
    internal.__testFireSfxEnd(33)
    ctx.state = 'suspended'
    ctx.listeners.get('statechange')?.()
  })

  it('swallows stop errors on active music sources', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    internal.playMusic('game')
    const ctx = requireFakeAudioContext()
    await vi.waitFor(() => {
      expect(ctx.sources.filter((source) => source.loop)).toHaveLength(1)
    })
    const looping = ctx.sources.find((source) => source.loop)
    if (!looping) {
      throw new Error('missing loop source')
    }
    looping.stop = vi.fn(() => {
      throw new Error('already stopped')
    })
    internal.stopMusic()
  })
})
