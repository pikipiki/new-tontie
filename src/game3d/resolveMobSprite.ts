import type { EnemySpawn } from '@/game/types'
import { mobSheetIndex } from '@/game/assets'

/** URL for the Flash-accurate 2D sprite used on the 3D billboard. */
export function mobSpriteUrl(enemy: EnemySpawn): string {
  if (enemy.kind === 'shop') {
    return '/game/sprites/mobs/shop.png'
  }
  if (enemy.kind === 'treasure') {
    return '/game/sprites/mobs/treasure.png'
  }
  if (enemy.catalogFrame !== undefined) {
    const frame = enemy.catalogFrame
    if (frame >= 5 && frame <= 24) {
      return `/game/sprites/mobs/${frame}.png`
    }
    const idx = 5 + (mobSheetIndex(frame) % 20)
    return `/game/sprites/mobs/${idx}.png`
  }
  return '/game/sprites/mob.png'
}
