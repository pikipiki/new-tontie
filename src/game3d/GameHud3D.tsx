import { Text } from '@react-three/drei'
import type { GameState } from '@/game/types'
import { HUD } from './hudLayout3d'

function HeartMesh({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[-0.022, 0.01, 0]} castShadow>
        <sphereGeometry args={[0.028, 10, 10]} />
        <meshStandardMaterial color="#e53935" roughness={0.45} emissive="#5a1010" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0.022, 0.01, 0]} castShadow>
        <sphereGeometry args={[0.028, 10, 10]} />
        <meshStandardMaterial color="#e53935" roughness={0.45} emissive="#5a1010" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.05, 0.05, 0.035]} />
        <meshStandardMaterial color="#c62828" roughness={0.5} />
      </mesh>
    </group>
  )
}

function HeartsRow({ hp, hpMax }: { hp: number; hpMax: number }) {
  const slots = 8
  const filled = Math.max(0, Math.min(slots, Math.ceil((hp / Math.max(1, hpMax)) * slots)))
  const [ox, oy, oz] = HUD.hearts
  return (
    <group position={[ox, oy, oz]}>
      {Array.from({ length: slots }, (_, i) => (
        <group key={i} position={[i * 0.09, 0, 0]}>
          {i < filled ? (
            <HeartMesh position={[0, 0, 0]} />
          ) : (
            <mesh>
              <boxGeometry args={[0.055, 0.055, 0.02]} />
              <meshStandardMaterial color="#4a3030" roughness={0.9} transparent opacity={0.45} />
            </mesh>
          )}
        </group>
      ))}
      <Text position={[slots * 0.09 + 0.06, -0.01, 0]} fontSize={0.07} color="#fff" anchorX="left">
        {hp}
      </Text>
    </group>
  )
}

function LaserGunHud({ gun, gunAmmo }: { gun: number; gunAmmo: number }) {
  const [x, y, z] = HUD.laser
  const active = gun > 0
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.22]} />
        <meshStandardMaterial
          color={active ? '#26c6da' : '#455a64'}
          metalness={0.55}
          roughness={0.35}
          emissive={active ? '#006064' : '#000000'}
          emissiveIntensity={active ? 0.35 : 0}
        />
      </mesh>
      <mesh position={[0, 0.04, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.18, 10]} />
        <meshStandardMaterial color={active ? '#84ffff' : '#78909c'} emissive={active ? '#00bcd4' : '#000'} emissiveIntensity={0.5} />
      </mesh>
      {active && (
        <mesh position={[0, 0.04, 0.28]}>
          <boxGeometry args={[0.02, 0.02, 0.35]} />
          <meshStandardMaterial color="#e0f7fa" emissive="#00e5ff" emissiveIntensity={1.2} transparent opacity={0.85} />
        </mesh>
      )}
      <Text position={[0, -0.05, 0]} fontSize={0.055} color={active ? '#e0f7fa' : '#90a4ae'} anchorX="center">
        {active ? `LASER ${gunAmmo}` : 'LASER'}
      </Text>
    </group>
  )
}

function HammerTierHud({ hammerLv }: { hammerLv: number }) {
  const [x, y, z] = HUD.hammer
  return (
    <group position={[x, y, z]}>
      {([1, 2, 3, 4] as const).map((tier, i) => (
        <mesh key={tier} position={[0, i * 0.07, 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.1]} />
          <meshStandardMaterial
            color={hammerLv >= tier ? '#ffd54f' : '#5d4037'}
            metalness={hammerLv >= tier ? 0.65 : 0.1}
            roughness={0.4}
            emissive={hammerLv >= tier ? '#ff6f00' : '#000000'}
            emissiveIntensity={hammerLv >= tier ? 0.25 : 0}
          />
        </mesh>
      ))}
    </group>
  )
}

function LevelBadge({ level }: { level: number }) {
  const [x, y, z] = HUD.level
  return (
    <group position={[x, y, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.55, 0.14, 0.12]} />
        <meshStandardMaterial color="#5d4037" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.52, 0.04, 0.1]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.7} />
      </mesh>
      <Text position={[0, 0.01, 0.07]} fontSize={0.09} color="#fff" anchorX="center" anchorY="middle">
        {`LV ${level}`}
      </Text>
    </group>
  )
}

function ScorePlate({ score, money }: { score: number; money: number }) {
  const [x, y, z] = HUD.score
  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[1.1, 0.08, 0.14]} />
        <meshStandardMaterial color="#3e2723" roughness={0.85} />
      </mesh>
      <Text position={[-0.35, 0.01, 0.08]} fontSize={0.055} color="#fff" anchorX="left">
        {`SCORE ${score}`}
      </Text>
      <Text position={[0.35, 0.01, 0.08]} fontSize={0.055} color="#fffef0" anchorX="right">
        {`$${money}`}
      </Text>
    </group>
  )
}

export function GameHud3D({ state }: { state: GameState }) {
  if (state.phase === 'shop' || state.phase === 'gameOver' || state.phase === 'win') {
    return null
  }
  return (
    <>
      <LevelBadge level={state.level} />
      <HeartsRow hp={state.hp} hpMax={state.hpMax} />
      <LaserGunHud gun={state.gun} gunAmmo={state.gunAmmo} />
      <HammerTierHud hammerLv={state.hammerLv} />
      <ScorePlate score={state.score} money={state.money} />
    </>
  )
}
