import { themeColors } from '@/components/Tontie3D/theme'
import {
  Color,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Object3D,
  type Texture,
} from 'three'

const METALS = themeColors.hammerMetal as Record<number, string>
interface OriginalHead {
  map: Texture | null
  normalMap: Texture | null
  color: Color
  metalness: number
  roughness: number
  sheen: number
}
const originals = new WeakMap<MeshStandardMaterial, OriginalHead>()

function snapshotMaterial(material: MeshStandardMaterial): OriginalHead {
  const original = {
    map: material.map,
    normalMap: material.normalMap,
    color: material.color.clone(),
    metalness: material.metalness,
    roughness: material.roughness,
    sheen: material instanceof MeshPhysicalMaterial ? material.sheen : 0,
  }
  originals.set(material, original)
  return original
}

function metalColorForLevel(level: number): string | undefined {
  if (level <= 1) {
    return undefined
  }
  return METALS[level] ?? METALS[4]
}

function applyHammerMaterial(
  material: MeshStandardMaterial,
  level: number,
): void {
  const original = originals.get(material) ?? snapshotMaterial(material)
  const metal = metalColorForLevel(level)
  material.color.copy(metal ? new Color(metal) : original.color)
  material.map = metal ? null : original.map
  material.normalMap = metal ? null : original.normalMap
  material.metalness = metal ? 0.85 : original.metalness
  material.roughness = metal ? 0.24 : original.roughness
  if (material instanceof MeshPhysicalMaterial) {
    material.sheen = metal ? 0 : original.sheen
  }
  material.needsUpdate = true
}

/** Preserve the plush head for level 1; remove its pink fabric maps for real metallic upgrades. */
export function applyHammerAppearance(root: Object3D, level: number): void {
  root.traverse((object) => {
    if (!(object instanceof Mesh) || !/^(Head|Seam)/.test(object.name)) {
      return
    }
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material]
    for (const material of materials) {
      if (material instanceof MeshStandardMaterial) {
        applyHammerMaterial(material, level)
      }
    }
  })
}
