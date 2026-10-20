import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import {
  FrontSide,
  Mesh,
  MeshLambertMaterial,
  SRGBColorSpace,
  type Group,
  type Material,
  type MeshStandardMaterial,
} from 'three'

/**
 * Cheap opaque Lambert copy for low-end phones: keeps the colour and normal maps of the Blender
 * export (the velour pile still reads) but drops the PBR / sheen shading.
 */
function fixMaterial(mat: Material): MeshLambertMaterial {
  const old = mat as MeshStandardMaterial
  const map = old.map
  if (map) {
    map.colorSpace = SRGBColorSpace
    map.needsUpdate = true
  }
  return new MeshLambertMaterial({
    name: old.name,
    map,
    normalMap: old.normalMap,
    normalScale: old.normalScale.clone(),
    color: old.color.clone(),
    emissive: old.emissive.clone(),
    emissiveMap: old.emissiveMap,
    transparent: false,
    side: FrontSide,
  })
}

/** Deep clone with per-instance materials, so tints never leak between instances. */
export function useClonedGltf(url: string): Group {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((obj) => {
      if (obj instanceof Mesh) {
        const mesh = obj as Mesh
        // A material array without geometry groups renders nothing, so keep single materials single.
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => fixMaterial(m))
          : fixMaterial(mesh.material)
      }
    })
    return clone
  }, [scene])
}
