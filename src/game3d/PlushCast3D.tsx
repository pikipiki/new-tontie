import { useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef, useState } from 'react'
import { ExtrudeGeometry, Shape, type Group } from 'three'
import { HOLE_ORDER } from '@/game/layout'
import type { GameState, HoleIndex } from '@/game/types'
import { fxProgress, previewStrike, useGameFx } from './fx'
import { GlbModel } from './GlbModel'
import { PINK_FLIGHT_MS, pinkFlightPose } from './plushAnimation'
import { moleLiftWorld } from './layout3d'
import { mobGlbHeight, mobGlbKey, catalogFrameGlbKey } from './resolveMobGlb'
import { HammerModel } from './HammerStrike3D'
import {
  BOARD_SURFACE_Y,
  holeWorldPosition,
  MOB_TILT_X,
  PINK_LEDGE_POSITION,
  PINK_LEDGE_SCALE,
} from './layout3d'
import { MobModel3D } from './MobModel3D'
import { PlushGoonk3D } from './PlushGoonk3D'
import { RoundedBox } from '@react-three/drei'

function FeltStar({
  position,
  scale = 1,
  color = '#eebc4a',
}: {
  position: [number, number, number]
  scale?: number
  color?: string
}) {
  const geometry = useMemo(() => {
    const shape = new Shape()
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 + Math.PI / 2
      const r = i % 2 === 0 ? 0.13 : 0.061
      const x = Math.cos(angle) * r
      const y = Math.sin(angle) * r
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    shape.closePath()
    return new ExtrudeGeometry(shape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.012,
    })
  }, [])
  return (
    <mesh
      geometry={geometry}
      position={position}
      scale={scale}
      rotation={[0, 0, -0.15]}
      castShadow
    >
      <meshPhysicalMaterial color={color} roughness={0.92} sheen={1} />
    </mesh>
  )
}

export function CabinetPatches3D() {
  return (
    <group position={[0, BOARD_SURFACE_Y, 0]}>
      <FeltStar position={[-1.8, 1.93, -1.98]} scale={1.2} />
      <FeltStar position={[1.83, 1.96, -1.98]} scale={1.25} />
      <FeltStar position={[-1.92, 1.5, -1.98]} scale={0.43} color="#8f689f" />
      <FeltStar position={[1.95, 1.46, -1.98]} scale={0.48} color="#6e8cab" />
    </group>
  )
}

/** The pink plush stays on the front ledge, holding the star mallet, as in the reference. */
export function PlushPlayer3D({
  photo = false,
  state,
  attract = false,
}: {
  photo?: boolean
  state: GameState
  attract?: boolean
}) {
  const root = useRef<Group>(null)
  const mallet = useRef<Group>(null)
  const fx = useGameFx()
  const flyer = useRef<Group>(null)
  const flyerBody = useRef<Group>(null)
  const flyerHammer = useRef<Group>(null)
  const capture = useRef<{
    at: number
    y: number
    hole: HoleIndex
    from: [number, number, number]
  }>({
    at: -1e9,
    y: 0.5,
    hole: 5,
    from: [...PINK_LEDGE_POSITION],
  })
  useFrame(({ clock }) => {
    if (!root.current || !mallet.current) return
    const now = performance.now()
    let latest = -1e9
    let selected: HoleIndex = 5
    for (const hole of HOLE_ORDER)
      if (fx.holes[hole].strikeAt > latest) {
        latest = fx.holes[hole].strikeAt
        selected = hole
      }
    const flight = fxProgress(latest, now, PINK_FLIGHT_MS)
    root.current.visible = flight === null
    root.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.045 + 0.07
    root.current.rotation.z = Math.sin(clock.elapsedTime * 1.6) * 0.015
    mallet.current.rotation.z =
      -2.08 + Math.sin(clock.elapsedTime * 1.8) * 0.045
    if (!flyer.current || !flyerBody.current || !flyerHammer.current) return
    flyer.current.visible = flight !== null
    if (flight === null) return
    if (capture.current.at !== latest) {
      const slot = state.holes[selected]
      const height = mobGlbHeight(mobGlbKey(slot.enemy))
      const occupied = slot.phase !== 'off' && slot.enemy.kind !== 'none'
      const killed = now - fx.holes[selected].killAt < PINK_FLIGHT_MS
      const hitY = attract
        ? selected === 9 || selected === 3
          ? 0.72
          : 0.6
        : occupied
          ? height +
            moleLiftWorld(
              slot.phase,
              state.koma,
              slot.phaseTicks,
              height + 0.05,
            )
          : killed
            ? mobGlbHeight(catalogFrameGlbKey(fx.holes[selected].killFrame)) -
              0.18
            : 0.04
      const continuing = now - capture.current.at < PINK_FLIGHT_MS
      const from: [number, number, number] = continuing
        ? [
            flyerBody.current.position.x,
            flyerBody.current.position.y,
            flyerBody.current.position.z,
          ]
        : photo
          ? [-1.82, BOARD_SURFACE_Y + 0.02, 1.75]
          : [...PINK_LEDGE_POSITION]
      capture.current = {
        at: latest,
        y: Math.max(0.04, hitY),
        hole: selected,
        from,
      }
    }
    const pose = pinkFlightPose(
      flight,
      photo ? [-1.82, BOARD_SURFACE_Y + 0.02, 1.75] : PINK_LEDGE_POSITION,
      holeWorldPosition(capture.current.hole),
      capture.current.y,
      capture.current.from,
    )
    flyerBody.current.position.set(...pose.body)
    const idleScale = photo ? 1.55 : PINK_LEDGE_SCALE
    flyerBody.current.scale.setScalar(idleScale + (1 - idleScale) * pose.amount)
    flyerBody.current.rotation.set(
      -0.45 * (1 - pose.amount),
      pose.yaw,
      Math.sin(flight * Math.PI) * -0.08,
    )
    flyerHammer.current.position.set(...pose.pivot)
    flyerHammer.current.rotation.z = pose.angle
  })
  return (
    <>
      <group
        position={
          photo ? [-1.82, BOARD_SURFACE_Y + 0.02, 1.75] : PINK_LEDGE_POSITION
        }
        scale={photo ? 1.55 : PINK_LEDGE_SCALE}
      >
        {!photo && (
          <RoundedBox
            position={[0, -0.04, 0]}
            args={[0.95, 0.12, 0.75]}
            radius={0.1}
            smoothness={3}
            receiveShadow
          >
            <meshStandardMaterial color="#654775" roughness={0.9} />
          </RoundedBox>
        )}
        <group ref={root}>
          <group rotation={[photo ? 0 : -0.45, photo ? 1.65 : 0.2, 0]}>
            <PlushGoonk3D pink seed={2} />
          </group>
          <group
            position={[0.36, 0.38, 0.16]}
            ref={mallet}
            rotation={[0, 0, -2.08]}
          >
            <GlbModel url="/game/models/hammer.glb" scale={0.95} />
          </group>
        </group>
      </group>
      <group ref={flyer} visible={false}>
        <group ref={flyerBody}>
          <PlushGoonk3D pink seed={2} flying />
        </group>
        <group ref={flyerHammer}>
          <HammerModel hammerLv={state.hammerLv} />
        </group>
      </group>
    </>
  )
}

function DisplayPlush({
  hole,
  bowl = false,
  damaged = false,
  onPreviewHit,
}: {
  onPreviewHit: (hole: HoleIndex) => void
  hole: HoleIndex
  bowl?: boolean
  damaged?: boolean
}) {
  const group = useRef<Group>(null)
  const [x, , z] = holeWorldPosition(hole)
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    g.position.y =
      BOARD_SURFACE_Y - 0.18 + Math.sin(clock.elapsedTime * 2.2 + hole) * 0.024
    g.rotation.z = Math.sin(clock.elapsedTime * 1.3 + hole) * 0.045
  })
  return (
    <group
      ref={group}
      onPointerDown={(event) => {
        event.stopPropagation()
        onPreviewHit(hole)
      }}
      position={[x, BOARD_SURFACE_Y - 0.18, z]}
      rotation={[MOB_TILT_X, 0.1 * ((hole % 3) - 1), 0]}
    >
      <MobModel3D
        url={`/game/models/mobs/${bowl ? '6' : '5'}.glb`}
        seed={hole}
        damaged={damaged}
      />
    </group>
  )
}

/** Attract mode shows the full cast without changing the game simulation. */
export function PlushAttract3D() {
  const [damaged, setDamaged] = useState<Set<HoleIndex>>(() => new Set())
  const fx = useGameFx()
  const hit = (hole: HoleIndex) => {
    const now = performance.now()
    previewStrike(fx, hole, now)
    if (hole === 9 || hole === 3)
      setDamaged((previous) => new Set(previous).add(hole))
  }
  return (
    <Suspense fallback={null}>
      {HOLE_ORDER.map((hole) => (
        <DisplayPlush
          key={hole}
          hole={hole}
          bowl={hole === 9 || hole === 3}
          damaged={damaged.has(hole)}
          onPreviewHit={hit}
        />
      ))}
    </Suspense>
  )
}
