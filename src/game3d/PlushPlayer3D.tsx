import { FlightRibbon3D } from './FlightRibbon3D'
import { AdventureSnackContext } from './AdventureSnackContext'
import { useRef } from 'react'
import type { Group } from 'three'
import type { GameState } from '@game/types'
import { HammerModel } from './HammerStrike3D'
import { PlushGoonk3D } from './PlushGoonk3D'
import { SlapCueContext } from './SlapCueContext'
import { PINK_FLIGHT_MS } from './plushAnimation'
import { fxProgress, useGameFx } from './fx'
import { usePlushPlayerFlight } from './usePlushPlayerFlight'
import { pinkLostWeapon } from './adventureMotion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { laserIsEquipped } from './laserPresentation'
import { LaserEffects3D } from './LaserEffects3D'
import { PlushIdlePlayer3D } from './PlushIdlePlayer3D'

/** The same plush holds its equipped hammer or ray gun; only hammer hits need a flight. */
export function PlushPlayer3D({
  photo = false,
  state,
  now,
  attract = false,
}: {
  photo?: boolean
  state: GameState
  now: number
  attract?: boolean
}) {
  const root = useRef<Group>(null),
    mallet = useRef<Group>(null)
  const flyer = useRef<Group>(null),
    flyerBody = useRef<Group>(null),
    flyerHammer = useRef<Group>(null)
  const weapon = useRef<Group>(null),
    muzzle = useRef<Group>(null),
    flash = useRef<Group>(null)
  const gameFx = useGameFx()
  const reduced = useReducedMotion()
  const stolen = state.adventure?.stolenWeapon
  const disarmed = pinkLostWeapon(stolen, reduced)
  const slap = gameFx.slap
    ? fxProgress(gameFx.slap.at, now, PINK_FLIGHT_MS)
    : null
  const laser =
    !disarmed && (stolen ? stolen.gun > 0 : laserIsEquipped(state, gameFx, now))
  usePlushPlayerFlight(
    state,
    photo,
    attract,
    root,
    mallet,
    flyer,
    flyerBody,
    flyerHammer,
  )
  return (
    <AdventureSnackContext.Provider value={state.adventure ?? null}>
      <PlushIdlePlayer3D
        state={state}
        photo={photo}
        laser={laser}
        rootRef={root}
        malletRef={mallet}
        weaponRef={weapon}
        muzzleRef={muzzle}
        flashRef={flash}
      />
      <group ref={flyer} visible={false}>
        <SlapCueContext.Provider value={slap}>
          <group ref={flyerBody}>
            <PlushGoonk3D pink seed={2} flying slapping={slap !== null} />
          </group>
        </SlapCueContext.Provider>
        <group ref={flyerHammer} visible={!disarmed}>
          <HammerModel hammerLv={state.hammerLv} wing={state.wing} />
        </group>
      </group>
      <FlightRibbon3D target={flyerBody} />
      {laser && (
        <LaserEffects3D
          state={state}
          weaponRef={weapon}
          muzzleRef={muzzle}
          flashRef={flash}
        />
      )}
    </AdventureSnackContext.Provider>
  )
}
