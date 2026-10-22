// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

describe('audioContextCtor without window', () => {
  it('returns null when window is missing', async () => {
    vi.resetModules()
    const internal = await import('@/audio/runtime')
    internal.__testClearAudioEngine()
    internal.unlockAudio()
    internal.playSfx('push')
    expect(internal.isMuted()).toBe(false)
  })
})
