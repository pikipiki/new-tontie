import { GlbModel } from './GlbModel'
import { hammerStrikeDrop, MOB_TILT_X } from './layout3d'

const HAMMER_GLB = '/game/models/hammer.glb'
const FRAME_COUNT = 8
const RAISED_Y = 0.55

export function HammerStrike3D({ frame }: { frame: number }) {
  const drop = hammerStrikeDrop(frame, FRAME_COUNT)
  return (
    <GlbModel
      url={HAMMER_GLB}
      position={[0, RAISED_Y * (1 - drop), 0.12]}
      rotation={[MOB_TILT_X, 0, 0]}
    />
  )
}
