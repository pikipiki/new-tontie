import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import type { Group, Mesh } from 'three'
import { themeColors } from '@game3d/theme'
import { pinkSnackPose } from '@game3d/plushAnimation'

const plush = themeColors.plush
const SPRINKLES = plush.snackSprinkles

function Donut({ bitten = false }: { bitten?: boolean }) {
  const arc = bitten ? Math.PI * 1.5 : Math.PI * 2
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <torusGeometry args={[0.088, 0.043, 12, 40, arc]} />
        <meshStandardMaterial color={plush.snackBread} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0, 0.024]} scale={[1, 1, 0.65]} castShadow>
        <torusGeometry args={[0.088, 0.039, 12, 40, arc]} />
        <meshPhysicalMaterial
          color={plush.snackPink}
          roughness={0.4}
          clearcoat={0.3}
        />
      </mesh>
      {Array.from({ length: 16 }, (_, sprinkleIndex) => {
        const angle = ((sprinkleIndex + 0.35) * Math.PI) / 8
        if (angle > arc) return null
        const radius = 0.088 + Math.sin(sprinkleIndex * 7) * 0.014
        return (
          <mesh
            key={sprinkleIndex}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              0.05,
            ]}
            rotation={[0, 0, sprinkleIndex * 2.4]}
          >
            <capsuleGeometry args={[0.004, 0.016, 2, 6]} />
            <meshStandardMaterial
              color={SPRINKLES[sprinkleIndex % SPRINKLES.length]}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/** The left hand and snack share a shoulder pivot; the right hand keeps its mallet. */
export function PinkSnack3D({ children }: { children: ReactNode }) {
  const root = useRef<Group>(null)
  const shoulder = useRef<Group>(null)
  const full = useRef<Group>(null)
  const bitten = useRef<Group>(null)
  const mouth = useRef<Mesh>(null)
  const crumbs = useRef<Group>(null)
  const started = useRef<number | null>(null)
  useFrame(({ clock }) => {
    if (!root.current || !shoulder.current) return
    // Reset while the resting character is hidden during a flight.
    let ancestor = root.current.parent
    while (ancestor) {
      if (!ancestor.visible) {
        started.current = null
        return
      }
      ancestor = ancestor.parent
    }
    started.current ??= clock.elapsedTime
    const pose = pinkSnackPose(clock.elapsedTime - started.current)
    shoulder.current.rotation.set(-0.23 * pose.lift, 0, 1.3 * pose.lift)
    if (full.current) full.current.visible = !pose.bitten
    if (bitten.current) bitten.current.visible = pose.bitten
    if (mouth.current) {
      mouth.current.scale.y = 0.009 + 0.016 * pose.chew
      mouth.current.scale.x = 0.03 + 0.006 * pose.chew
    }
    if (crumbs.current) {
      crumbs.current.visible = pose.crumb !== null
      const crumbPhase = pose.crumb ?? 0
      crumbs.current.position.set(
        -0.16 - crumbPhase * 0.025,
        0.37 - crumbPhase * crumbPhase * 0.27,
        0.35,
      )
      crumbs.current.rotation.z = crumbPhase * 2
      crumbs.current.scale.setScalar(1 - crumbPhase * 0.7)
    }
  })
  return (
    <group ref={root}>
      <group ref={shoulder} position={[-0.27, 0.43, 0.015]}>
        <group position={[0.27, -0.43, -0.015]}>
          {children}
          <group position={[-0.355, 0.29, 0.31]} rotation={[0.12, -0.1, 0]}>
            <group ref={full}>
              <Donut />
            </group>
            <group ref={bitten} visible={false}>
              <Donut bitten />
            </group>
          </group>
        </group>
      </group>
      <mesh
        ref={mouth}
        position={[-0.14, 0.36, 0.258]}
        scale={[0.03, 0.009, 0.009]}
      >
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={plush.snackInk} roughness={0.9} />
      </mesh>
      <group ref={crumbs} visible={false}>
        {[0, 1, 2].map((crumbIndex) => (
          <mesh
            key={crumbIndex}
            position={[
              (crumbIndex - 1) * 0.023,
              -crumbIndex * 0.018,
              crumbIndex * 0.009,
            ]}
          >
            <dodecahedronGeometry args={[0.009, 0]} />
            <meshStandardMaterial color={plush.snackChip} roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
