import { ConductorBoss3D } from './ConductorBoss3D'
import { SugarStorm3D } from './SugarStorm3D'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { GameState } from '@game/types'
import { missionFor } from '@game/adventure/content'
import { ConductorCrowns } from './ConductorCrowns'
import { BOARD_SURFACE_Y, holeWorldPosition } from './layout3d'
import { themeColors as colors } from './theme'

function BirthdayCake({ slices }: { slices: number }) {
  return (
    <group position={[1.25, 0.05, 2.35]} scale={0.72}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.05, 48]} />
        <meshStandardMaterial color={colors.plush.helmetCream} />
      </mesh>
      {Array.from({ length: Math.min(8, slices) }, (_, index) => (
        <group key={index} rotation={[0, (index * Math.PI) / 4, 0]}>
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry
              args={[0.43, 0.43, 0.23, 12, 1, false, 0.025, Math.PI / 4 - 0.05]}
            />
            <meshStandardMaterial color={colors.plush.snackBread} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry
              args={[0.44, 0.44, 0.06, 12, 1, false, 0.025, Math.PI / 4 - 0.05]}
            />
            <meshStandardMaterial
              color={colors.plush.snackPink}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
      {[0, 1, 2].map((index) => (
        <group key={index} position={[(index - 1) * 0.17, 0.42, 0]}>
          <mesh>
            <cylinderGeometry args={[0.024, 0.024, 0.19, 12]} />
            <meshStandardMaterial color={colors.hudAccentCyan} />
          </mesh>
          <mesh position={[0, 0.13, 0]} scale={[0.025, 0.06, 0.025]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial color={colors.yellow} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
function BossTable({ state }: { state: GameState }) {
  const boss = state.adventure?.boss
  const shock = useRef<Mesh>(null)
  const wave = useRef({ count: 0, age: 10 })
  useFrame((_, delta) => {
    if (!boss || !shock.current) return
    if (wave.current.count !== boss.wave)
      wave.current = { count: boss.wave, age: 0 }
    wave.current.age += delta
    shock.current.visible = wave.current.age < 1
    shock.current.scale.setScalar(1 + wave.current.age * 6)
  })
  if (!boss || boss.hp <= 0) return null
  const [weakX] = holeWorldPosition(boss.weak)
  const crownColor = boss.warning ? colors.red : colors.gold
  return (
    <group>
      <ConductorCrowns boss={boss} crownColor={crownColor} />
      <mesh
        position={[weakX, BOARD_SURFACE_Y + 0.018, 0.08]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.88, 3.3]} />
        <meshBasicMaterial
          color={crownColor}
          transparent
          opacity={boss.warning ? 0.22 : 0.1}
          depthWrite={false}
        />
      </mesh>
      <mesh
        position={[0, BOARD_SURFACE_Y + 0.2, -1.63]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <capsuleGeometry args={[0.09, 2.4, 8, 24]} />
        <meshStandardMaterial
          color={colors.plush.fabricPurple}
          roughness={0.9}
        />
      </mesh>
      <mesh
        ref={shock}
        position={[weakX, BOARD_SURFACE_Y + 0.04, -1]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <torusGeometry args={[0.4, 0.02, 8, 40]} />
        <meshBasicMaterial
          color={colors.red}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
export function AdventureTable3D({ state }: { state: GameState }) {
  const adventure = state.adventure
  if (!adventure) return null
  const swappers = Object.entries(adventure.actors).filter(
    ([, actor]) => actor.swapWith,
  )
  return (
    <group>
      {missionFor(adventure.stage).kind === 'cake' && (
        <BirthdayCake slices={adventure.cake} />
      )}
      <BossTable state={state} />
      <ConductorBoss3D state={state} />
      <SugarStorm3D state={state} />
      {swappers.flatMap(([hole, actor]) =>
        [Number(hole), actor.swapWith].map((target) => {
          if (!target) return null
          const [posX, , posZ] = holeWorldPosition(
            target as import('@game/types').HoleIndex,
          )
          return (
            <mesh
              key={`${hole}-${String(target)}`}
              position={[posX, BOARD_SURFACE_Y + 0.05, posZ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[0.44, 0.035, 8, 32]} />
              <meshBasicMaterial color={colors.hudAccentCyan} />
            </mesh>
          )
        }),
      )}
    </group>
  )
}
