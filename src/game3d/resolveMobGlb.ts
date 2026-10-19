import type { EnemySpawn } from '@/game/types'
import { mobSheetIndex } from '@/game/assets'
import modelsManifest from '../../reference/models.manifest.json'

type ModelsManifest = {
  mobs: Record<string, { glb: string }>
}

const manifest = modelsManifest as ModelsManifest

const SPRITE_ONLY_KINDS = new Set<EnemySpawn['kind']>(['shop'])

/** Manifest key for the retopo GLB (matches `public/game/models/mobs/<key>.glb`). */
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

/** Use Blender GLB only when we have a 1:1 catalog frame model; else show the 2D sprite volume. */
export function mobUseGlbModel(enemy: EnemySpawn): boolean {
  if (SPRITE_ONLY_KINDS.has(enemy.kind)) {
    return false
  }
  if (enemy.kind === 'treasure') {
    return mobGlbAvailable('treasure')
  }
  const frame = enemy.catalogFrame
  if (frame === undefined) {
    return mobGlbAvailable('default')
  }
  if (frame < 5 || frame > 24) {
    return false
  }
  return mobGlbAvailable(String(frame))
}
