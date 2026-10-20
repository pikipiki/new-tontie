import { enemyFromCatalogFrame } from '@/game/combat'
import { BOMB_FRAMES } from '@/game/engine'

export function traitsFor(frame: number): string[] {
  const enemy = enemyFromCatalogFrame(frame)
  const traits: string[] = []
  if (enemy.kind === 'boss') traits.push('traitBoss')
  if (BOMB_FRAMES.includes(frame)) traits.push('traitBomb')
  if (enemy.item === 'life') traits.push('traitHeal')
  if (enemy.item === 'coin' || enemy.coinSteal !== undefined)
    traits.push('traitCoins')
  if (enemy.nikai) traits.push('traitTwoHit')
  return traits
}
