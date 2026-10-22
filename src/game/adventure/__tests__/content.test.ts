import { afterEach, describe, expect, it, vi } from 'vitest'
import content from '../content.json'

afterEach(() => {
  vi.doUnmock('../content.json')
  vi.resetModules()
})

describe('editable mission content', () => {
  it('clamps navigation and defaults nonfinite stage values', async () => {
    const { missionFor, MISSIONS } = await import('../content')
    expect(missionFor(-1)).toBe(MISSIONS[0])
    expect(missionFor(100)).toBe(MISSIONS.at(-1))
    expect(missionFor(Number.NaN)).toBe(MISSIONS[0])
  })

  it.each([
    { kind: 'unknown' },
    { goal: 1.5 },
    { goal: 0 },
    { seconds: Number.POSITIVE_INFINITY },
    { seconds: 0 },
  ])('rejects malformed mission configuration %j', async (patch) => {
    vi.resetModules()
    vi.doMock('../content.json', () => ({
      default: {
        ...content,
        missions: [{ ...content.missions[0], ...patch }],
      },
    }))
    await expect(import('../content')).rejects.toThrow('Invalid mission')
  })

  it('reports an empty campaign clearly', async () => {
    vi.resetModules()
    vi.doMock('../content.json', () => ({
      default: { ...content, missions: [] },
    }))
    const { missionFor } = await import('../content')
    expect(() => missionFor(1)).toThrow('at least one mission')
  })
})
