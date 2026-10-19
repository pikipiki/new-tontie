import { GlbModel } from './GlbModel'

const HOLE_GLB = '/game/models/hole.glb'

export function Hole3D() {
  return <GlbModel url={HOLE_GLB} position={[0, -0.02, 0]} scale={1} />
}
