import { describe, expect, it, vi } from 'vitest'
import {
  FakeContext,
  installAudioCoverHarness,
  requireFakeAudioContext,
} from '@game/__tests__/helpers/audioInternal.harness'

installAudioCoverHarness()

describe('audioInternal branch coverage (resume)', () => {
  it('reuses the looping game track without restarting', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    internal.playMusic('game')
    await vi.waitFor(() => {
      expect(FakeContext.instances[0]?.sources.length).toBeGreaterThan(0)
    })
    const sourcesBefore = FakeContext.instances[0]?.sources.length
    internal.playMusic('game')
    expect(FakeContext.instances[0]?.sources.length).toBe(sourcesBefore)
  })

  it('drops stale soundtrack loads after stopMusic', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    internal.playMusic('game')
    internal.stopMusic()
    internal.playMusic('boss')
    await vi.waitFor(() => {
      expect(internal.currentMusicLabel()).toBe('boss')
    })
  })

  it('blocks statechange resume while a gesture resume is pending', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    const ctx = requireFakeAudioContext()
    ctx.state = 'suspended'
    ctx.resume.mockImplementationOnce(() => new Promise<void>(() => {}))
    internal.unlockAudio()
    const resumeCalls = ctx.resume.mock.calls.length
    ctx.listeners.get('statechange')?.()
    expect(ctx.resume.mock.calls).toHaveLength(resumeCalls)
  })

  it('ignores statechange resume when the context is closed', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    const ctx = requireFakeAudioContext()
    ctx.state = 'closed'
    const resumeCalls = ctx.resume.mock.calls.length
    ctx.listeners.get('statechange')?.()
    expect(ctx.resume.mock.calls).toHaveLength(resumeCalls)
  })

  it('ignores stale resume rejections', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    const ctx = requireFakeAudioContext()
    ctx.state = 'suspended'
    ctx.resume
      .mockImplementationOnce(() => Promise.reject(new Error('stale')))
      .mockImplementationOnce(() => Promise.resolve())
    internal.unlockAudio()
    internal.unlockAudio()
    await Promise.resolve()
    expect(ctx.resume.mock.calls.length).toBeGreaterThan(0)
  })

  it('drops stale soundtrack callbacks', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    internal.playMusic('boss')
    const ctx = requireFakeAudioContext()
    await internal.__testLoadSound(67)
    const generation = internal.__testMusicGeneration()
    internal.__testApplyLoadedMusic(
      generation - 1,
      'boss',
      ctx as unknown as AudioContext,
    )
    internal.__testApplyLoadedMusic(
      generation,
      'game',
      ctx as unknown as AudioContext,
    )
    expect(internal.currentMusicLabel()).toBe('boss')
  })
})
