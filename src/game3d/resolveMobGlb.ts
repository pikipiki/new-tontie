import type { EnemySpawn } from '@/game/types'
import { mobSheetIndex } from '@/game/assets'
import modelsManifest from '../../reference/models.manifest.json'

type ModelsManifest = {
  mobs: Record<string, { glb: string; size?: number[] }>
}

const manifest = modelsManifest as ModelsManifest

const FALLBACK_MOB_HEIGHT = 0.75

/** World height of an exported mob GLB (Blender keeps the SWF pixel scale). */
export function mobGlbHeight(key: string): number {
  return manifest.mobs[key]?.size?.[1] ?? FALLBACK_MOB_HEIGHT
}

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
