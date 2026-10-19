import { useGLTF } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Group,
  type Material,
} from 'three'

/** Opaque PBR copy; textured sprite faces use an alpha cutout so sorting never hides them. */
function fixMaterial(mat: Material): MeshStandardMaterial {
  const old = mat as MeshStandardMaterial
  const map = old.map
  if (map) {
    map.colorSpace = SRGBColorSpace
    map.needsUpdate = true
  }
  return new MeshStandardMaterial({
    map,
    color: map ? '#ffffff' : old.color.clone(),
    transparent: false,
    alphaTest: map ? 0.5 : 0,
    side: DoubleSide,
    roughness: old.roughness,
    metalness: old.metalness,
  })
}

function useClonedGltf(url: string): Group {
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

function GlbModelInner({
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
  return (
    <primitive
      object={root}
      position={position}
      rotation={rotation}
      scale={s}
    />
  )
}

export function GlbModel(props: {
  url: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number] | number
}) {
  return (
    <Suspense fallback={null}>
      <GlbModelInner {...props} />
    </Suspense>
  )
}
