import { useRef } from 'react'
import { Html } from '@react-three/drei'
import type { Group } from 'three'
import type { StolenWeapon } from '@game/adventure/types'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { HammerModel } from './HammerStrike3D'
import { LaserModel3D } from './LaserModel3D'
import { stealRun, stealSeconds, thiefHoldsWeapon } from './adventureMotion'
import { themeColors as colors } from './theme'

export function StolenTag3D({ label }: { label: string }) {
  return (
    <Html
      position={[0, 0.55, 0]}
      center
      zIndexRange={[4, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <span
        style={{
          display: 'inline-block',
          padding: '4px 8px',
          borderRadius: 12,
          background: colors.purpleInk,
          color: colors.yellow,
          border: `2px solid ${colors.yellow}`,
          fontWeight: 900,
          fontSize: 12,
          letterSpacing: 0.6,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </Html>
  )
}
export function StolenWeaponModel3D({
  weapon,
  wing = weapon.wing,
}: {
  weapon: StolenWeapon
  wing?: boolean
}) {
  const muzzle = useRef<Group>(null),
    flash = useRef<Group>(null)
  if (weapon.gun > 0)
    return <LaserModel3D muzzleRef={muzzle} flashRef={flash} />
  return (
    <group rotation={[0, 0, -2.08]}>
      <HammerModel hammerLv={weapon.hammerLv} wing={wing} />
    </group>
  )
}
export function StolenWeaponHeld3D({ weapon }: { weapon?: StolenWeapon }) {
  const reduced = useReducedMotion()
  if (!weapon || !thiefHoldsWeapon(weapon, reduced)) return null
  const running = stealRun(stealSeconds(weapon), reduced).travel > 0.02
  return (
    <group position={[0.36, 0.41, 0.22]}>
      <StolenWeaponModel3D weapon={weapon} />
      {running && <StolenTag3D label="STOLEN" />}
    </group>
  )
}
