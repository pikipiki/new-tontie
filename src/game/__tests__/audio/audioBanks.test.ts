import { describe, expect, it, vi } from 'vitest'
import { MUTE_KEY, readMutedPreference, soundUrl } from '@game/audioBanks'

describe('audio bank helpers', () => {
  it('reads mute preference and builds sound urls', () => {
    localStorage.setItem(MUTE_KEY, '1')
    expect(readMutedPreference()).toBe(true)
    expect(soundUrl(42)).toBe('/game/sounds/42.mp3')
  })

  it('treats storage failures as unmuted', () => {
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked')
      })
    expect(readMutedPreference()).toBe(false)
    getItem.mockRestore()
  })
})
