import { themeColors as colors } from './theme'

/** Sewn scowl and soft costume fangs keep the monster in the plush world. */
export function BossAngryFace3D() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.105, 0.642, 0.263]}
          rotation={[0, 0, side * 0.4]}
          scale={[0.081, 0.024, 0.024]}
          castShadow
        >
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial color={colors.plush.eyeInk} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.225, 0.37]} scale={[0.11, 0.058, 0.029]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={colors.plush.faceInk} roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.063, 0.24, 0.395]}
          rotation={[0, 0, Math.PI]}
        >
          <coneGeometry args={[0.018, 0.065, 12]} />
          <meshStandardMaterial
            color={colors.plush.helmetCream}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}
