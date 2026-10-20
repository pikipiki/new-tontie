import { useRef } from 'react'
import type { Group } from 'three'
import type { StolenWeapon } from '@game/adventure/types'
import { HammerModel } from './HammerStrike3D'
import { LaserModel3D } from './LaserModel3D'
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
  if (!weapon || weapon.age < 12) return null
  return (
    <group position={[0.36, 0.41, 0.22]}>
      <StolenWeaponModel3D weapon={weapon} />
    </group>
  )
}
