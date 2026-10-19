import { Suspense, useLayoutEffect } from 'react'
import { DoubleSide, Mesh, MeshStandardMaterial } from 'three'
import { useAlignTopToSurface } from './alignGlbToSurface'
import { useClonedGltf } from './GlbModel'
import { BOARD_SURFACE_Y } from './layout3d'

const BOARD_GLB = '/game/models/board.glb'

function BoardGlb() {
  const root = useClonedGltf(BOARD_GLB)

  useLayoutEffect(() => {
    root.rotation.x = -Math.PI / 2
    root.traverse((obj) => {
      if (obj instanceof Mesh) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        obj.material = mats.map((m) => {
          const map = (m as MeshStandardMaterial).map ?? null
          return new MeshStandardMaterial({
            map,
            color: '#ffffff',
            roughness: 0.82,
            metalness: 0.04,
            side: DoubleSide,
            transparent: false,
            depthWrite: true,
          })
        })
      }
    })
  }, [root])

  useAlignTopToSurface(root, BOARD_SURFACE_Y)
  return <primitive object={root} />
}

export function BoardScene3D() {
  return (
    <Suspense fallback={null}>
      <BoardGlb />
    </Suspense>
  )
}
