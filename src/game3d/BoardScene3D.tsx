import { BOARD_SURFACE_Y } from '@game3d/layout3d'
import { useBoardSceneStyle } from '@game3d/boardSceneStyle'
import { BoardSceneTrim3D } from '@game3d/BoardSceneTrim3D'
import { useClonedGltf } from '@game3d/useClonedGltf'

/** Reuse the genuinely cut-out board, with a taller upholstered arcade marquee. */
export function BoardScene3D() {
  const root = useClonedGltf('/game/models/board.glb')
  useBoardSceneStyle(root)
  return (
    <group position={[0, BOARD_SURFACE_Y, 0]}>
      <primitive object={root} />
      <BoardSceneTrim3D />
    </group>
  )
}
