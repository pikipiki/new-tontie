import { GlbModel } from './GlbModel'
import { BOARD_SURFACE_Y } from './layout3d'

const BOARD_GLB = '/game/models/board.glb'

export function BoardScene3D() {
  return <GlbModel url={BOARD_GLB} position={[0, BOARD_SURFACE_Y, 0]} />
}
