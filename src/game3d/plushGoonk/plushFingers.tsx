import type { MeshPhysicalMaterial } from 'three'

export function FingerRow({
  material,
  positions,
}: {
  material: MeshPhysicalMaterial
  positions: [number, number, number][]
}) {
  return (
    <>
      {positions.map((position, finger) => (
        <mesh
          key={finger}
          position={position}
          scale={[0.022, 0.043, 0.027]}
          material={material}
        >
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
      ))}
    </>
  )
}
