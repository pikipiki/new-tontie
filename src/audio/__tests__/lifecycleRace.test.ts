import { describe, expect, it } from 'vitest'
import { installAudioCoverHarness, requireFakeAudioContext } from './harness'
installAudioCoverHarness()
describe('replaced audio contexts', () => {
  it('does not start an effect on a context replaced while decoding', async () => {
    const audio = await import('@/audio/runtime')
    audio.unlockAudio()
    const old = requireFakeAudioContext()
    audio.playSfx('push')
    audio.__testClearAudioEngine()
    await Promise.resolve()
    await Promise.resolve()
    expect(old.sources).toHaveLength(1)
    expect(old.sources[0]?.buffer?.duration).toBeLessThan(0.1)
  })
})
