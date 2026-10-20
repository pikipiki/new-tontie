import { publicUrl } from '@constants/publicUrl'
import type { EnemySpawn } from '@game/types'
import modelsManifest from '@reference/models.manifest.json'

type ModelsManifest = {
  mobs: Record<string, { glb: string; size?: number[] }>
}

const manifest = modelsManifest as ModelsManifest

const FALLBACK_MOB_HEIGHT = 0.75

/** World height of an exported mob GLB (Blender keeps the SWF pixel scale). */
export function mobGlbHeight(key: string): number {
  if (key === '5' || key === 'default') return 0.78
  if (key === '6') return 0.9
  return manifest.mobs[key]?.size?.[1] ?? FALLBACK_MOB_HEIGHT
}

/** [width, height, depth] of an exported mob GLB. */
export function mobGlbSize(key: string): [number, number, number] {
  if (key === '5' || key === 'default') return [0.88, 0.78, 0.74]
  if (key === '6') return [0.88, 0.9, 0.74]
  const [width = 0.5, height = FALLBACK_MOB_HEIGHT, depth = 0.4] =
    manifest.mobs[key]?.size ?? []
  return [width, height, depth]
}

export function mobModelKey(enemy: EnemySpawn): string {
  if (enemy.kind === 'shop') {
    return 'shop'
  }
  if (enemy.kind === 'treasure') {
    return 'treasure'
  }
  const frame = enemy.catalogFrame
  if (frame !== undefined && frame >= 5 && frame <= 24) {
    return String(frame)
  }
  return 'default'
}

export function mobGlbUrl(key: string): string {
  return publicUrl(`game/models/mobs/${key}.glb`)
}

export function mobGlbAvailable(key: string): boolean {
  return key in manifest.mobs
}

/** Blender GLB for an enemy; unknown frames fall back to the default Tontie. */
export function mobGlbKey(enemy: EnemySpawn): string {
  const key = mobModelKey(enemy)
  return mobGlbAvailable(key) ? key : 'default'
}

export function catalogFrameGlbKey(frame: number | null): string {
  if (frame === null) {
    return 'default'
  }
  return mobGlbKey({
    kind: 'mob',
    hp: 1,
    maxHp: 1,
    attack: 0,
    score: 0,
    catalogFrame: frame,
  })
}
