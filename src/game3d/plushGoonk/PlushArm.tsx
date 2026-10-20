import { useEffect, useMemo } from 'react'
import type { MeshPhysicalMaterial } from 'three'
import { Vector3 } from 'three'
import { stuffedTube } from '@game3d/plushGoonk/mesh'
import { FingerRow } from '@game3d/plushGoonk/plushFingers'
import { LaserGripArm } from './LaserGripArm'

function ScaredArm({
  side,
  material,
}: {
  side: number
  material: MeshPhysicalMaterial
}) {
  const anxious = useMemo(
    () =>
      stuffedTube(
        [
          new Vector3(side * 0.27, 0.43, 0.015),
          new Vector3(side * 0.37, 0.34, 0.18),
          new Vector3(side * 0.205, 0.5, 0.26),
        ],
        0.057,
        0.061,
      ),
    [side],
  )
  useEffect(
    () => () => {
      anxious.dispose()
    },
    [anxious],
  )
  const fingerPositions = [0, 1, 2].map(
    (finger) =>
      [side * (0.17 + finger * 0.032), 0.55, 0.275] as [number, number, number],
  )
  return (
    <group>
      <mesh geometry={anxious} material={material} castShadow />
      <mesh
        position={[side * 0.205, 0.5, 0.26]}
        scale={[0.067, 0.066, 0.045]}
        material={material}
      >
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      <FingerRow material={material} positions={fingerPositions} />
    </group>
  )
}

function HoldingArm({ material }: { material: MeshPhysicalMaterial }) {
  const grip = useMemo(
    () =>
      stuffedTube(
        [
          new Vector3(0.27, 0.43, 0.015),
          new Vector3(0.37, 0.48, 0.1),
          new Vector3(0.2, 0.48, 0.02),
        ],
        0.057,
        0.06,
      ),
    [],
  )
  useEffect(
    () => () => {
      grip.dispose()
    },
    [grip],
  )
  return (
    <group>
      <mesh geometry={grip} material={material} castShadow />
      <mesh
        position={[0.2, 0.48, 0.02]}
        scale={[0.06, 0.05, 0.055]}
        material={material}
      >
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      {[0, 1, 2].map((finger) => (
        <mesh
          key={finger}
          position={[0.17 + finger * 0.024, 0.475, 0.058]}
          scale={[0.017, 0.035, 0.022]}
          material={material}
        >
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
      ))}
    </group>
  )
}

function RelaxedArm({
  side,
  material,
}: {
  side: number
  material: MeshPhysicalMaterial
}) {
  const geometry = useMemo(
    () =>
      stuffedTube(
        [
          new Vector3(side * 0.27, 0.43, 0.015),
          new Vector3(side * 0.39, 0.36, 0.07),
          new Vector3(side * 0.37, 0.24, 0.2),
        ],
        0.057,
        0.066,
      ),
    [side],
  )
  useEffect(
    () => () => {
      geometry.dispose()
    },
    [geometry],
  )
  return (
    <group>
      <mesh geometry={geometry} material={material} castShadow />
      <mesh
        position={[side * 0.355, 0.24, 0.205]}
        scale={[0.083, 0.074, 0.065]}
        material={material}
        castShadow
      >
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      {[0, 1, 2].map((finger) => (
        <mesh
          key={finger}
          position={[
            side * (0.32 + finger * 0.047),
            0.205 + (finger === 1 ? -0.008 : 0.007),
            0.25,
          ]}
          rotation={[0.3, side * -0.3, side * 0.2]}
          scale={[0.029, 0.052, 0.038]}
          material={material}
          castShadow
        >
          <sphereGeometry args={[1, 20, 12]} />
        </mesh>
      ))}
      <mesh
        position={[side * 0.3, 0.275, 0.255]}
        rotation={[0, 0, side * -0.55]}
        scale={[0.032, 0.049, 0.034]}
        material={material}
      >
        <sphereGeometry args={[1, 20, 12]} />
      </mesh>
    </group>
  )
}

export function PlushArm({
  side,
  material,
  holding = false,
  aiming = false,
  scared = false,
}: {
  side: number
  material: MeshPhysicalMaterial
  holding?: boolean
  aiming?: boolean
  scared?: boolean
}) {
  if (scared) {
    return <ScaredArm side={side} material={material} />
  }
  if (aiming) return <LaserGripArm material={material} />
  if (holding) {
    return <HoldingArm material={material} />
  }
  return <RelaxedArm side={side} material={material} />
}
