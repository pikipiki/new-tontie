import type { EnemySpawn } from '@/game/types'
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

/** [width, height, depth] of an exported mob GLB. */
export function mobGlbSize(key: string): [number, number, number] {
  const [w = 0.5, h = FALLBACK_MOB_HEIGHT, d = 0.4] =
    manifest.mobs[key]?.size ?? []
  return [w, h, d]
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
  return `/game/models/mobs/${key}.glb`
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
