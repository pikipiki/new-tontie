import { themeColors as colors } from './theme'
/** A curved, ridged yellow banana with brown stem and blossom tips. */
export function BananaModel3D() {
  return (
    <group rotation={[0, 0, -0.45]} scale={2.15}>
      <mesh castShadow>
        <torusGeometry args={[0.15, 0.039, 6, 28, Math.PI * 0.78]} />
        <meshStandardMaterial color={colors.yellowBright} roughness={0.7} />
      </mesh>
      <mesh position={[0.15, -0.026, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.012, 0.025, 0.06, 6]} />
        <meshStandardMaterial color={colors.plush.snackInk} />
      </mesh>
      <mesh position={[-0.116, 0.096, 0]} rotation={[0, 0, -0.72]}>
        <coneGeometry args={[0.024, 0.045, 6]} />
        <meshStandardMaterial color={colors.plush.snackChip} />
      </mesh>
    </group>
  )
}
