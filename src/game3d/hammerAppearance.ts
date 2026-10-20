import {
  Color,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Object3D,
  type Texture,
} from 'three'

const METALS: Record<number, string> = {
  2: '#c27a3a',
  3: '#e9eef5',
  4: '#ffc83a',
}
interface OriginalHead {
  map: Texture | null
  normalMap: Texture | null
  color: Color
  metalness: number
  roughness: number
  sheen: number
}
const originals = new WeakMap<MeshStandardMaterial, OriginalHead>()

/** Preserve the plush head for level 1; remove its pink fabric maps for real metallic upgrades. */
export function applyHammerAppearance(root: Object3D, level: number): void {
  root.traverse((object) => {
    if (!(object instanceof Mesh) || !/^(Head|Seam)/.test(object.name)) return
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material]
    for (const material of materials) {
      if (!(material instanceof MeshStandardMaterial)) continue
      let original = originals.get(material)
      if (!original) {
        original = {
          map: material.map,
          normalMap: material.normalMap,
          color: material.color.clone(),
          metalness: material.metalness,
          roughness: material.roughness,
          sheen: material instanceof MeshPhysicalMaterial ? material.sheen : 0,
        }
        originals.set(material, original)
      }
      const metal = level > 1 ? (METALS[level] ?? METALS[4]) : undefined
      material.color.copy(metal ? new Color(metal) : original.color)
      material.map = metal ? null : original.map
      material.normalMap = metal ? null : original.normalMap
      material.metalness = metal ? 0.85 : original.metalness
      material.roughness = metal ? 0.24 : original.roughness
      if (material instanceof MeshPhysicalMaterial)
        material.sheen = metal ? 0 : original.sheen
      material.needsUpdate = true
    }
  })
}
