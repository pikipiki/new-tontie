import { describe, expect, it } from 'vitest'
import gameSpec from '@reference/game-spec.json'

describe('game-spec.json', () => {
  it('documents bosses at levels 10 and 20', () => {
    expect(gameSpec.round.bossLevels).toEqual([10, 20])
  })

  it('defines shop levels and offers in data', () => {
    expect(gameSpec.shop.levels).toEqual([10, 20])
    expect(gameSpec.shop.offers.map((row) => row.id)).toEqual([
      'hammer2',
      'hammer3',
      'hammer4',
      'heart1',
      'wing',
      'heart2',
      'continue',
      'heart3',
    ])
  })
})
