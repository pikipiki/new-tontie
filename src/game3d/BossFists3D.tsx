import { useMemo, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CatmullRomCurve3,
  TubeGeometry,
  Vector3,
  type Group,
  type MeshPhysicalMaterial,
} from 'three'
import type { AdventureState } from '@game/adventure/types'
import { usePlushFabric } from './plushGoonk/usePlushFabric'
import { holeWorldPosition } from './layout3d'
import { themeColors as colors } from './theme'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function BossFists3D({
  boss,
  final,
}: {
  final: boolean
  boss: NonNullable<AdventureState['boss']>
}) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <BossFist key={side} side={side} boss={boss} final={final} />
      ))}
    </group>
  )
}
function BossFist({
  side,
  boss,
  final,
}: {
  side: number
  final: boolean
  boss: NonNullable<AdventureState['boss']>
}) {
  const material = usePlushFabric(false),
    root = useRef<Group>(null)
  const reduced = useReducedMotion()
  const wave = useRef({ count: -1, at: 0 })
  const fistHole = side === -1 ? 7 : 9
  const [targetX, , targetZ] = holeWorldPosition(fistHole)
  const geometry = useMemo(
    () =>
      new TubeGeometry(
        new CatmullRomCurve3([
          new Vector3(side * 0.5, 0.7, -0.78),
          new Vector3(side * 1.0, 1.0, -1),
          new Vector3(targetX, 0.4, targetZ),
        ]),
        24,
        0.16,
        16,
        false,
      ),
    [side, targetX, targetZ],
  )
  useEffect(
    () => () => {
      geometry.dispose()
    },
    [geometry],
  )
  useFrame(({ clock }) => {
    if (!root.current) return
    if (wave.current.count !== boss.wave)
      wave.current = { count: boss.wave, at: clock.elapsedTime }
    const slam = reduced
      ? 0
      : Math.sin(
          Math.min(1, (clock.elapsedTime - wave.current.at) / 0.7) * Math.PI,
        ) * 0.3
    const anticipation = boss.warning && boss.weak === fistHole ? 0.17 : 0
    root.current.position.y =
      0.4 +
      anticipation +
      slam +
      (reduced ? 0 : Math.sin(clock.elapsedTime * 3 + side) * 0.045)
    root.current.rotation.z = side * (boss.warning ? 0.15 : -0.1)
  })
  return (
    <group>
      <mesh geometry={geometry} material={material} castShadow />
      <group ref={root} position={[targetX, 0.4, targetZ]}>
        <PlushFist material={material} side={side} />
        <BossBracelet final={final} />
      </group>
    </group>
  )
}

function BossBracelet({ final }: { final: boolean }) {
  return (
    <group position={[0, -0.06, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.032, 8, 32]} />
        <meshStandardMaterial
          color={final ? colors.hudAccentCyan : colors.gold}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      {final &&
        [-1, 0, 1].map((spike) => (
          <mesh
            key={spike}
            position={[spike * 0.21, 0.16, -0.08]}
            rotation={[0, 0, -spike * 0.45]}
          >
            <coneGeometry args={[0.05, 0.24, 6]} />
            <meshStandardMaterial
              color={colors.white}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))}
    </group>
  )
}
function PlushFist({
  material,
  side,
}: {
  material: MeshPhysicalMaterial
  side: number
}) {
  return (
    <group>
      {' '}
      <mesh material={material} scale={[0.37, 0.31, 0.31]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
      {[-1, 0, 1].map((finger) => (
        <mesh
          key={finger}
          material={material}
          position={[finger * 0.16, 0.05, 0.23]}
          scale={[0.1, 0.15, 0.13]}
          castShadow
        >
          <sphereGeometry args={[1, 20, 14]} />
        </mesh>
      ))}
      <mesh
        material={material}
        position={[-side * 0.29, -0.025, 0.11]}
        rotation={[0, 0, side * 0.6]}
        scale={[0.13, 0.2, 0.15]}
        castShadow
      >
        <sphereGeometry args={[1, 20, 14]} />
      </mesh>
    </group>
  )
}
