import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Group,
  type Material,
} from 'three'

/** Opaque PBR copy (keeps colour, normal and roughness maps from the Blender export). */
function fixMaterial(mat: Material): MeshStandardMaterial {
  const old = mat as MeshStandardMaterial
  const map = old.map
  if (map) {
    map.colorSpace = SRGBColorSpace
    map.needsUpdate = true
  }
  return new MeshStandardMaterial({
    name: old.name,
    map,
    normalMap: old.normalMap,
    normalScale: old.normalScale.clone(),
    roughnessMap: old.roughnessMap,
    color: old.color.clone(),
    emissive: old.emissive.clone(),
    emissiveMap: old.emissiveMap,
    transparent: false,
    alphaTest: map ? 0.5 : 0,
    side: DoubleSide,
    roughness: old.roughness,
    metalness: old.metalness,
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
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [scene])
}
