import { useContext } from 'react'
import { AdventureSnackContext } from './AdventureSnackContext'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'
import { themeColors } from './theme'
import { PINK_MOUTH, snackAge } from './snackRig'
import { pinkSnackPose } from './plushAnimation'

/** A discreet opening beneath the trunk tip, without any extra shape on the belly. */
export function PinkMouth3D({ snacking }: { snacking: boolean }) {
  const adventure = useContext(AdventureSnackContext)
  const root = useRef<Group>(null),
    mouth = useRef<Mesh>(null)
  const started = useRef<{ age: number; last: number | null }>({
    age: 0,
    last: null,
  })
  useFrame(({ clock }) => {
    if (!root.current || !mouth.current || !snacking) return
    const age =
      adventure?.snackSeconds ??
      snackAge(root.current, started, clock.elapsedTime)
    if (age === null) return
    const { chew } = pinkSnackPose(age)
    mouth.current.scale.y = 0.004 + 0.004 * chew
    mouth.current.scale.x = 0.021 + 0.002 * chew
  })
  return (
    <group ref={root}>
      <mesh ref={mouth} position={PINK_MOUTH} scale={[0.021, 0.004, 0.015]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial
          color={themeColors.plush.snackInk}
          roughness={0.9}
        />
      </mesh>
    </group>
  )
}
