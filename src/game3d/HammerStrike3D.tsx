import { useMemo } from 'react'
import { hammerStrikeAngle } from './layout3d'

const FRAME_COUNT = 8

/** Volumetric hammer (handle + metal head), not a sprite card. */
export function HammerStrike3D({ frame }: { frame: number }) {
  const angle = useMemo(() => hammerStrikeAngle(frame, FRAME_COUNT), [frame])
  const y = 0.42 + Math.sin(angle) * 0.12
  const z = 0.1 + Math.cos(angle) * 0.06

  return (
    <group position={[0.06, y, z]} rotation={[angle, 0.12, 0.28]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.048, 0.48, 12]} />
        <meshStandardMaterial color="#6d3f1a" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.5, 0.04]} castShadow>
        <boxGeometry args={[0.2, 0.11, 0.14]} />
        <meshStandardMaterial color="#9aa3ad" roughness={0.35} metalness={0.72} />
      </mesh>
      <mesh position={[0, 0.5, 0.16]} castShadow>
        <boxGeometry args={[0.14, 0.09, 0.22]} />
        <meshStandardMaterial color="#b8c0c8" roughness={0.28} metalness={0.8} />
      </mesh>
    </group>
  )
}
