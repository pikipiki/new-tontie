import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, InstancedMesh, Mesh, MeshBasicMaterial, Object3D } from 'three'
import { WHITE } from '@/components/Tontie3D/theme'
import type { BurstStyle } from '@game3d/burstStyles'
import { fxProgress } from '@game3d/fx'

const dummy = new Object3D()

function rand(seed: number): () => number {
  let state = seed >>> 0 || 1
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

/** One-shot particle burst; restarts whenever `startAt` changes. */
export function Burst3D({
  startAt,
  style,
  position = [0, 0, 0],
}: {
  startAt: number
  style: BurstStyle
  position?: [number, number, number]
}) {
  const ref = useRef<InstancedMesh>(null)
  const particles = useMemo(() => {
    const random = rand(Math.floor(startAt * 1000))
    return Array.from({ length: style.count }, (_, index) => {
      const angle = (index / style.count) * Math.PI * 2 + random() * 0.6
      const verticalLift = style.lift * (0.6 + random() * 0.8)
      const speedScalar = style.speed * (0.55 + random() * 0.6)
      return {
        v: [
          Math.cos(angle) * speedScalar,
          verticalLift * style.speed,
          Math.sin(angle) * speedScalar,
        ] as const,
        spin: (random() - 0.5) * 14,
        scale: style.size * (0.6 + random() * 0.8),
        color: new Color(style.colors[index % style.colors.length]),
      }
    })
  }, [startAt, style])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const progress = fxProgress(startAt, performance.now(), style.durationMs)
    mesh.visible = progress !== null
    if (progress === null) return
    const sec = (progress * style.durationMs) / 1000
    particles.forEach((particle, index) => {
      dummy.position.set(
        particle.v[0] * sec,
        particle.v[1] * sec - 0.5 * style.gravity * sec * sec,
        particle.v[2] * sec,
      )
      dummy.rotation.set(particle.spin * sec, particle.spin * sec * 0.7, 0)
      const fade =
        style.shape === 'puff' ? 0.6 + progress * 1.2 : 1 - progress * progress
      dummy.scale.setScalar(particle.scale * Math.max(0.001, fade))
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
      mesh.setColorAt(index, particle.color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, style.count]}
      position={position}
      frustumCulled={false}
    >
      {style.shape === 'star' && <octahedronGeometry args={[1, 0]} />}
      {style.shape === 'puff' && <icosahedronGeometry args={[1, 1]} />}
      {style.shape === 'cube' && <boxGeometry args={[1, 1, 1]} />}
      <meshLambertMaterial
        emissive={WHITE}
        emissiveIntensity={style.shape === 'star' ? 0.35 : 0}
      />
    </instancedMesh>
  )
}

/** Flat shock ring on hammer impact. */
export function ImpactRing3D({
  startAt,
  posY = 0.02,
}: {
  startAt: number
  posY?: number
}) {
  const ref = useRef<Mesh>(null)
  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const progress = fxProgress(startAt, performance.now(), 260)
    mesh.visible = progress !== null
    if (progress === null) return
    const scale = 0.2 + progress * 0.55
    mesh.scale.set(scale, scale, 1)
    ;(mesh.material as MeshBasicMaterial).opacity = 0.85 * (1 - progress)
  })
  return (
    <mesh
      ref={ref}
      position={[0, posY, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={false}
    >
      <ringGeometry args={[0.8, 1, 40]} />
      <meshBasicMaterial color={WHITE} transparent depthWrite={false} />
    </mesh>
  )
}
