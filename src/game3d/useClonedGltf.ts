import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import {
  FrontSide,
  Mesh,
  SRGBColorSpace,
  type Group,
  type Material,
  type MeshStandardMaterial,
} from 'three'

/** Keep the exported velvet sheen, ceramic glaze and normal maps intact. */
export function useClonedGltf(url: string): Group {
  const { scene } = useGLTF(url)
  const clone = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const copy = (source: MeshStandardMaterial) => {
        const material = source.clone()
        material.side = FrontSide
        if (material.map) material.map.colorSpace = SRGBColorSpace
        material.envMapIntensity = 0.65
        return material
      }
      obj.material = Array.isArray(obj.material)
        ? obj.material.map((m: MeshStandardMaterial) => copy(m))
        : copy(obj.material as MeshStandardMaterial)
      obj.castShadow = true
      obj.receiveShadow = true
    })
    return root
  }, [scene])
  useEffect(
    () => () => {
      clone.traverse((obj) => {
        if (obj instanceof Mesh) {
          const materials = Array.isArray(obj.material)
            ? obj.material
            : [obj.material]
          materials.forEach((material: Material) => {
            material.dispose()
          })
        }
      })
    },
    [clone],
  )
  return clone
}
