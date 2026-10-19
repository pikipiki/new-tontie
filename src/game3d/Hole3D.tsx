import { DoubleSide } from 'three'

const PIT_DEPTH = 0.32

export function Hole3D() {
  return (
    <group>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.16, 28]} />
        <meshStandardMaterial color="#2a1e18" roughness={0.95} side={DoubleSide} />
      </mesh>
      <mesh position={[0, -0.06 - PIT_DEPTH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, PIT_DEPTH, 22]} />
        <meshStandardMaterial color="#120a08" roughness={1} />
      </mesh>
      <mesh position={[0, -PIT_DEPTH - 0.04, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.06, 22]} />
        <meshStandardMaterial color="#0a0605" roughness={1} />
      </mesh>
    </group>
  )
}
