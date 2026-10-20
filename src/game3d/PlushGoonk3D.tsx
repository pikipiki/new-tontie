import { useEffect, useState } from 'react'
import { PINK_FLIGHT_MS } from '@game3d/plushAnimation'
import { CryingFace } from '@game3d/plushGoonk/CryingFace'
import { FlatEye } from '@game3d/plushGoonk/FlatEye'
import { FurPile } from '@game3d/plushGoonk/FurPile'
import { PorcelainBowl, ShatteredHelmet } from '@game3d/plushGoonk/helmet'
import { PINK_NOSE, PLUSH_BODY, VIOLET_NOSE } from '@game3d/plushGoonk/mesh'
import {
  PlushGoonkArms,
  PlushGoonkFeet,
} from '@game3d/plushGoonk/PlushGoonkLimbs'
import { Stitching } from '@game3d/plushGoonk/Stitching'
import { usePlushFabric } from '@game3d/plushGoonk/usePlushFabric'
import { PinkMouth3D } from './PinkMouth3D'
import { YellowTuft } from '@game3d/plushGoonk/YellowTuft'

function GoonkBowl({
  bowl,
  frightened,
  shatter,
}: {
  bowl: boolean
  frightened: boolean
  shatter: boolean
}) {
  if (!bowl) {
    return null
  }
  if (frightened) {
    return shatter ? <ShatteredHelmet /> : null
  }
  return <PorcelainBowl />
}

/** Sewn egg-shaped plush, modelled directly from the two toy photographs. */
export function PlushGoonk3D({
  pink = false,
  bowl = false,
  damaged = false,
  flying = false,
  snacking = false,
  holdingWeapon = false,
  shatter = true,
  seed = 0,
}: {
  pink?: boolean
  bowl?: boolean
  damaged?: boolean
  flying?: boolean
  snacking?: boolean
  holdingWeapon?: boolean
  shatter?: boolean
  seed?: number
}) {
  const [reacting, setReacting] = useState(damaged)
  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setReacting(damaged)
      },
      damaged ? PINK_FLIGHT_MS * 0.42 : 0,
    )
    return () => {
      window.clearTimeout(timer)
    }
  }, [damaged])
  const frightened = damaged && reacting
  const material = usePlushFabric(pink)
  return (
    <group>
      <mesh
        dispose={null}
        geometry={PLUSH_BODY}
        material={material}
        castShadow
        receiveShadow
      />
      <FurPile pink={pink} />
      <Stitching pink={pink} />
      <mesh
        dispose={null}
        geometry={pink ? PINK_NOSE : VIOLET_NOSE}
        material={material}
        castShadow
      />
      <mesh
        position={pink ? [0, 0.3, 0.5] : [0, 0.285, 0.43]}
        scale={pink ? [0.019, 0.024, 0.019] : [0.037, 0.038, 0.033]}
        material={material}
      >
        <sphereGeometry args={[1, 20, 12]} />
      </mesh>
      <FlatEye side={-1} seed={seed} scared={frightened} />
      <FlatEye side={1} seed={seed} scared={frightened} />
      <PlushGoonkArms
        pink={pink}
        snacking={snacking}
        flying={flying}
        holdingWeapon={holdingWeapon}
        frightened={frightened}
        material={material}
      />
      <PlushGoonkFeet material={material} />
      {pink && <YellowTuft />}
      {pink && <PinkMouth3D snacking={snacking && !flying} />}
      <GoonkBowl bowl={bowl} frightened={frightened} shatter={shatter} />
      {frightened && <CryingFace />}
    </group>
  )
}
