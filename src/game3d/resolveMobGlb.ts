import type { EnemySpawn } from '@/game/types'
import { mobSheetIndex } from '@/game/assets'
import modelsManifest from '../../reference/models.manifest.json'

type ModelsManifest = {
  mobs: Record<string, { glb: string }>
  worldHeight?: number
}

const manifest = modelsManifest as ModelsManifest

export const MOB_WORLD_HEIGHT = manifest.worldHeight ?? 0.74

export function mobModelKey(enemy: EnemySpawn): string {
  if (enemy.kind === 'shop') {
    return 'shop'
  }
  if (enemy.kind === 'treasure') {
    return 'treasure'
  }
  if (enemy.catalogFrame !== undefined) {
    const frame = enemy.catalogFrame
    if (frame >= 5 && frame <= 24) {
      return String(frame)
    }
    const idx = 5 + (mobSheetIndex(frame) % 20)
    return String(idx)
  }
  return 'default'
}

export function mobGlbUrl(key: string): string {
  return `/game/models/mobs/${key}.glb`
}

export function mobGlbAvailable(key: string): boolean {
  return key in manifest.mobs
}

/** Prefer Blender GLB when exported; map unknown frames to nearest catalog GLB. */
export function mobGlbKey(enemy: EnemySpawn): string | null {
  const key = mobModelKey(enemy)
  if (mobGlbAvailable(key)) {
    return key
  }
  if (mobGlbAvailable('default')) {
    return 'default'
  }
  return null
}
