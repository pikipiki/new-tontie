import { HOLE_ORDER } from '@game/layout'
import { holeWorldPosition } from './layout3d'
import { themeColors as colors } from './theme'
export function BossDrumWells() {
  return (
    <group>
      {' '}
      {HOLE_ORDER.map((hole) => {
        const [posX, , posZ] = holeWorldPosition(hole)
        return (
          <group key={hole} position={[posX, 0, posZ]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.405, 0.405, 0.37, 40, 1, true]} />
              <meshStandardMaterial
                color={colors.scene.arcadeMetal}
                metalness={0.85}
                roughness={0.3}
                side={2}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
              <torusGeometry args={[0.43, 0.042, 12, 48]} />
              <meshStandardMaterial
                color={colors.gold}
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
              <torusGeometry args={[0.48, 0.013, 8, 48]} />
              <meshBasicMaterial
                color={colors.hudAccentCyan}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, -0.43, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.02, 40]} />
              <meshBasicMaterial color={colors.ink} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
