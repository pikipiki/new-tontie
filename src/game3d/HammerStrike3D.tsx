import { useMemo } from 'react'
import { GlbModel } from './GlbModel'
import { hammerStrikeAngle } from './layout3d'

const HAMMER_GLB = '/game/models/hammer.glb'
const FRAME_COUNT = 8

export function HammerStrike3D({ frame }: { frame: number }) {
  const angle = useMemo(() => hammerStrikeAngle(frame, FRAME_COUNT), [frame])
  const y = 0.5 + Math.sin(angle) * 0.14
  const z = 0.1 + Math.cos(angle) * 0.07

  return (
    <GlbModel
      url={HAMMER_GLB}
      position={[0.06, y, z]}
      rotation={[angle, 0.12, 0.28]}
      scale={0.88}
    />
  )
}
