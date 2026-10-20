import { themeColors } from '@game3d/theme'
import { RoundedBox } from '@react-three/drei'

const scene = themeColors.scene

/** Upholstered marquee trim and cabinet hardware on the imported board. */
export function BoardSceneTrim3D() {
  return (
    <>
      <RoundedBox
        position={[0, 1.04, -2.23]}
        args={[4.42, 2.62, 0.28]}
        radius={0.28}
        smoothness={6}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={scene.trimMagenta}
          roughness={0.94}
          sheen={1}
          sheenColor={scene.trimMagentaSheen}
        />
      </RoundedBox>
      <RoundedBox
        position={[0, 1.04, -2.065]}
        args={[4.18, 2.4, 0.12]}
        radius={0.25}
        smoothness={6}
        receiveShadow
      >
        <meshPhysicalMaterial
          color={scene.trimRose}
          roughness={0.94}
          sheen={1}
          sheenColor={scene.trimRoseSheen}
        />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.99, 0.02, 1.91]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.025, 20]} />
            <meshStandardMaterial
              color={scene.trimTan}
              metalness={0.75}
              roughness={0.35}
            />
          </mesh>
        </group>
      ))}
      <RoundedBox
        position={[1.66, -0.32, 2.115]}
        args={[0.32, 0.44, 0.06]}
        radius={0.035}
        smoothness={3}
      >
        <meshStandardMaterial
          color={scene.trimGray}
          metalness={0.85}
          roughness={0.3}
        />
      </RoundedBox>
      <mesh position={[1.66, -0.29, 2.15]}>
        <boxGeometry args={[0.035, 0.21, 0.018]} />
        <meshStandardMaterial color={scene.trimInk} />
      </mesh>
    </>
  )
}
