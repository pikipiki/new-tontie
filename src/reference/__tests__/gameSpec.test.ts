import { describe, expect, it } from 'vitest'
import gameSpec from '@reference/game-spec.json'

describe('game-spec.json', () => {
  it('documents bosses at levels 10 and 20', () => {
    expect(gameSpec.round.bossLevels).toEqual([10, 20])
  })
})
