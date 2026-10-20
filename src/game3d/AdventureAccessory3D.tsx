import type { AdventureRole } from '@game/adventure/types'
import { themeColors as colors } from './theme'

function JesterHat() {
  return (
    <group position={[0, 0.72, 0]}>
      {[-1, 0, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.12, 0, 0]}
          rotation={[0, 0, -side * 0.5]}
        >
          <mesh position={[0, 0.08, 0]} castShadow>
            <coneGeometry args={[0.09, 0.23, 16]} />
            <meshStandardMaterial
              color={side === 0 ? colors.cabinetPink : colors.purpleSoft}
            />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.034, 12, 8]} />
            <meshStandardMaterial
              color={colors.gold}
              metalness={0.6}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
function BellHat() {
  return (
    <group position={[0, 0.82, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.055, 0.14, 0.18, 24]} />
        <meshStandardMaterial
          color={colors.gold}
          metalness={0.7}
          roughness={0.23}
        />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.04, 16, 12]} />
        <meshStandardMaterial color={colors.orange} />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.045, 0.016, 8, 20]} />
        <meshStandardMaterial color={colors.gold} />
      </mesh>
    </group>
  )
}
export function AdventureAccessory3D({ role }: { role?: AdventureRole }) {
  if (role === 'singer') return <BellHat />
  if (role === 'prankster') return <JesterHat />
  if (role === 'tinkerer')
    return (
      <group position={[0, 0.77, 0]}>
        <mesh castShadow>
          <sphereGeometry
            args={[0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial color={colors.hudAccentCyan} roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.08, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.053, 0.021, 6, 6]} />
          <meshStandardMaterial
            color={colors.plush.helmetBlue}
            metalness={0.6}
          />
        </mesh>
      </group>
    )
  if (role === 'thief')
    return (
      <group>
        <mesh position={[0, 0.76, 0]} scale={[1.1, 0.45, 1]} castShadow>
          <sphereGeometry args={[0.21, 24, 16]} />
          <meshStandardMaterial color={colors.ink} roughness={0.9} />
        </mesh>
        <mesh position={[0.16, 0.73, 0.05]} rotation={[0, 0, 0.4]}>
          <capsuleGeometry args={[0.035, 0.17, 4, 10]} />
          <meshStandardMaterial color={colors.ink} />
        </mesh>
      </group>
    )
  if (role === 'impostor')
    return (
      <group position={[0, 0.35, 0.465]}>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.052, 0, 0]}
            rotation={[0, 0, side * 0.3]}
            scale={[0.085, 0.038, 0.025]}
          >
            <sphereGeometry args={[1, 20, 12]} />
            <meshStandardMaterial color={colors.ink} roughness={0.9} />
          </mesh>
        ))}
      </group>
    )
  if (role === 'innocent')
    return (
      <group position={[0, 0.28, 0.47]}>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.07, 0, 0]}
            rotation={[0, 0, (side * Math.PI) / 2]}
          >
            <coneGeometry args={[0.075, 0.12, 3]} />
            <meshStandardMaterial color={colors.greenLight} />
          </mesh>
        ))}
      </group>
    )
  return null
}
