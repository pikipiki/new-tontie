import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import type { HoleIndex } from '@game/types'
import { useGameFx, fxProgress } from './fx'
import { ComicWord3D } from './ComicWord3D'
import { Burst3D } from './Burst3D'
import { themeColors as colors } from './theme'

const CRYSTAL_BURST = {
  count: 36,
  durationMs: 700,
  lift: 1.1,
  speed: 2.1,
  gravity: 4.2,
  size: 0.065,
  shape: 'star' as const,
  colors: [colors.white, colors.cabinetPink, colors.hudAccentCyan, colors.gold],
}
export function ArcadeImpact3D({
  hole,
  now,
  hitY,
}: {
  hole: HoleIndex
  now: number
  hitY: number
}) {
  const reduced = useReducedMotion()
  const gameFx = useGameFx()
  const slot = gameFx.holes[hole]
  const contactAt = Math.max(slot.hitAt, slot.killAt)
  const laser =
    gameFx.laser?.hole === hole && Math.abs(gameFx.laser.at - contactAt) < 120
  const impact = contactAt + (laser ? 0 : 420)
  if (reduced || now - impact > 750 || now < contactAt) return null
  return (
    <group>
      <Burst3D startAt={impact} style={CRYSTAL_BURST} position={[0, hitY, 0]} />
      <ComicShock startAt={impact} hitY={hitY} />
      <ComicWord3D startAt={impact} hole={hole} />
    </group>
  )
}
function ComicShock({ startAt, hitY }: { startAt: number; hitY: number }) {
  const root = useRef<Group>(null),
    ring = useRef<Mesh>(null)
  useFrame(() => {
    if (!root.current || !ring.current) return
    const phase = fxProgress(startAt, performance.now(), 450)
    root.current.visible = phase !== null
    if (phase === null) return
    ring.current.scale.setScalar(0.1 + phase * 1.35)
    ;(ring.current.material as MeshBasicMaterial).opacity = (1 - phase) * 0.8
    root.current.rotation.y = phase * 1.2
  })
  return (
    <group ref={root} position={[0, hitY * 0.4, 0]} visible={false}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.46, 48]} />
        <meshBasicMaterial
          color={colors.hudAccentCyan}
          transparent
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
