import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Group,
  type Material,
  type MeshStandardMaterialParameters,
} from 'three'

function fixMaterial(mat: Material): MeshStandardMaterial {
  const old = mat as MeshStandardMaterial
  const map = old.map ?? null
  const hasAlpha = map !== null
  const params: MeshStandardMaterialParameters = {
    map,
    color: old.color?.clone(),
    transparent: hasAlpha,
    alphaTest: hasAlpha ? 0.42 : 0,
    side: DoubleSide,
    roughness: old.roughness ?? 0.82,
    metalness: old.metalness ?? 0.05,
  }
  const next = new MeshStandardMaterial(params)
  if (map) {
    map.colorSpace = SRGBColorSpace
    map.needsUpdate = true
  }
  return next
}

export function useClonedGltf(url: string): Group {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    const clone = scene.clone(true) as Group
    clone.traverse((obj) => {
      if (obj instanceof Mesh) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        obj.material = mats.map((m) => fixMaterial(m))
        obj.castShadow = true
        obj.receiveShadow = true
        obj.renderOrder = 2
      }
    })
    return clone
  }, [scene])
}

export function GlbModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
}: {
  url: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number] | number
}) {
  const root = useClonedGltf(url)
  const s = typeof scale === 'number' ? [scale, scale, scale] : scale
  return <primitive object={root} position={position} rotation={rotation} scale={s} />
}
