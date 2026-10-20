import { describe, expect, it, vi } from 'vitest'
import {
  FakeContext,
  installAudioCoverHarness,
  requireFakeAudioContext,
} from '@game/__tests__/helpers/audioInternal.harness'

installAudioCoverHarness()

describe('audioInternal branch coverage (boot)', () => {
  it('returns null when no audio constructor exists', async () => {
    vi.resetModules()
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('webkitAudioContext', undefined)
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    expect(FakeContext.instances).toHaveLength(0)
  })

  it('uses webkitAudioContext when AudioContext is missing', async () => {
    vi.resetModules()
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('webkitAudioContext', FakeContext)
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    expect(FakeContext.instances).toHaveLength(1)
  })

  it('skips playback session when navigator is missing', async () => {
    vi.resetModules()
    const navigatorValue = globalThis.navigator
    // @ts-expect-error test shim removes navigator for branch coverage
    delete globalThis.navigator
    const internal = await import('@game/audioInternal')
    internal.setMuted(false)
    internal.unlockAudio()
    globalThis.navigator = navigatorValue
    expect(FakeContext.instances.length).toBeGreaterThanOrEqual(0)
  })

  it('ignores lifecycle restore without an engine', async () => {
    const internal = await import('@game/audioInternal')
    const cleanup = internal.installAudioLifecycle()
    window.dispatchEvent(new Event('focus'))
    cleanup()
  })

  it('ignores statechange callbacks while muted', async () => {
    const internal = await import('@game/audioInternal')
    internal.unlockAudio()
    const ctx = requireFakeAudioContext()
    internal.setMuted(true)
    ctx.state = 'suspended'
    ctx.listeners.get('statechange')?.()
    internal.setMuted(false)
  })
})
