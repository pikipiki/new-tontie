import { useContext } from 'react'
import { AdventureSnackContext } from './AdventureSnackContext'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, MeshPhysicalMaterial } from 'three'
import { themeColors } from '@game3d/theme'
import { pinkSnackPose } from '@game3d/plushAnimation'
import { PlushSnackArm3D } from './PlushSnackArm3D'
import {
  PINK_MOUTH,
  SNACK_HAND_REST,
  SNACK_HAND_BITE,
  SNACK_DONUT_OFFSET,
  snackAge,
} from './snackRig'

const plush = themeColors.plush
const SPRINKLES = plush.snackSprinkles

function Donut({ quarters }: { quarters: number }) {
  const arc = (quarters * Math.PI) / 2
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

/** The left hand brings its donut to the central mouth, beneath the long nose. */
export function PinkSnack3D({ material }: { material: MeshPhysicalMaterial }) {
  const adventure = useContext(AdventureSnackContext)
  const root = useRef<Group>(null)
  const donut = useRef<Group>(null)
  const portions = useRef<(Group | null)[]>([])
  const crumbs = useRef<Group>(null)
  const started = useRef<{ age: number; last: number | null }>({
    age: 0,
    last: null,
  })
  useFrame(({ clock }) => {
    if (!root.current || !donut.current) return
    const age =
      adventure?.snackSeconds ??
      snackAge(root.current, started, clock.elapsedTime)
    if (age === null) return
    const pose = pinkSnackPose(age)
    donut.current.position
      .lerpVectors(SNACK_HAND_REST, SNACK_HAND_BITE, pose.lift)
      .add(SNACK_DONUT_OFFSET)
    donut.current.scale.setScalar(pose.donutScale)
    portions.current.forEach((portion, index) => {
      if (portion) portion.visible = index + 1 === pose.remaining
    })
    if (crumbs.current) {
      crumbs.current.visible = pose.crumb !== null
      const crumbPhase = pose.crumb ?? 0
      crumbs.current.position.set(
        PINK_MOUTH[0] + crumbPhase * 0.02,
        PINK_MOUTH[1] - crumbPhase * crumbPhase * 0.2,
        PINK_MOUTH[2] + 0.02,
      )
      crumbs.current.rotation.z = crumbPhase * 2
      crumbs.current.scale.setScalar(1 - crumbPhase * 0.7)
    }
  })
  return (
    <group ref={root}>
      <PlushSnackArm3D material={material} />
      <group ref={donut} rotation={[0.12, -0.1, 0]}>
        {[1, 2, 3, 4].map((quarters, index) => (
          <group
            key={quarters}
            ref={(node) => {
              portions.current[index] = node
            }}
            visible={quarters === 4}
          >
            <Donut quarters={quarters} />
          </group>
        ))}
      </group>
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
