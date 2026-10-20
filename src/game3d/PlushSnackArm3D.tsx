import { useContext } from 'react'
import { AdventureSnackContext } from './AdventureSnackContext'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  CatmullRomCurve3,
  Vector3,
  type Group,
  type MeshPhysicalMaterial,
} from 'three'
import {
  createSnackArmGeometry,
  updateSnackArm,
  snackAge,
  SNACK_HAND_REST,
  SNACK_HAND_BITE,
} from './snackRig'
import { pinkSnackPose } from './plushAnimation'
import { FingerRow } from './plushGoonk/plushFingers'

const FINGERS: [number, number, number][] = [
  [-0.03, -0.022, 0.045],
  [0, -0.027, 0.05],
  [0.03, -0.022, 0.045],
]

export function PlushSnackArm3D({
  material,
}: {
  material: MeshPhysicalMaterial
}) {
  const adventure = useContext(AdventureSnackContext)
  const root = useRef<Group>(null),
    palm = useRef<Group>(null)
  const started = useRef<{ age: number; last: number | null }>({
    age: 0,
    last: null,
  })
  const curve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-0.27, 0.43, 0.015),
        new Vector3(-0.39, 0.36, 0.07),
        SNACK_HAND_REST.clone(),
      ]),
    [],
  )
  const geometry = useMemo(() => createSnackArmGeometry(), [])
  useEffect(
    () => () => {
      geometry.dispose()
    },
    [geometry],
  )
  useFrame(({ clock }) => {
    if (!root.current || !palm.current) return
    const age =
      adventure?.snackSeconds ??
      snackAge(root.current, started, clock.elapsedTime)
    if (age === null) return
    const { lift } = pinkSnackPose(age)
    updateSnackArm(geometry, curve, lift)
    palm.current.position.lerpVectors(SNACK_HAND_REST, SNACK_HAND_BITE, lift)
  })
  return (
    <group ref={root}>
      <mesh geometry={geometry} material={material} castShadow />
      <group ref={palm}>
        <mesh material={material} scale={[0.07, 0.06, 0.065]} castShadow>
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>
        <FingerRow material={material} positions={FINGERS} />
      </group>
    </group>
  )
}
