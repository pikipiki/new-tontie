import { DoubleSide } from 'three'

/** Low rim around the hole — no solid tile that blocks the view. */
export function PlayTile3D() {
  return (
    <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
      <ringGeometry args={[0.14, 0.2, 4, 1]} />
      <meshStandardMaterial color="#7a5238" roughness={0.88} side={DoubleSide} />
    </mesh>
  )
}
