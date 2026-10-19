import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, InstancedMesh, Mesh, MeshBasicMaterial, Object3D } from 'three'
import type { BurstStyle } from './burstStyles'
import { fxProgress } from './fx'

const dummy = new Object3D()

function rand(seed: number): () => number {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
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
    const r = rand(Math.floor(startAt * 1000))
    return Array.from({ length: style.count }, (_, i) => {
      const a = (i / style.count) * Math.PI * 2 + r() * 0.6
      const up = style.lift * (0.6 + r() * 0.8)
      const sp = style.speed * (0.55 + r() * 0.6)
      return {
        v: [Math.cos(a) * sp, up * style.speed, Math.sin(a) * sp] as const,
        spin: (r() - 0.5) * 14,
        scale: style.size * (0.6 + r() * 0.8),
        color: new Color(style.colors[i % style.colors.length]),
      }
    })
  }, [startAt, style])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const t = fxProgress(startAt, performance.now(), style.durationMs)
    mesh.visible = t !== null
    if (t === null) return
    const sec = (t * style.durationMs) / 1000
    particles.forEach((p, i) => {
      dummy.position.set(
        p.v[0] * sec,
        p.v[1] * sec - 0.5 * style.gravity * sec * sec,
        p.v[2] * sec,
      )
      dummy.rotation.set(p.spin * sec, p.spin * sec * 0.7, 0)
      const fade = style.shape === 'puff' ? 0.6 + t * 1.2 : 1 - t * t
      dummy.scale.setScalar(p.scale * Math.max(0.001, fade))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, p.color)
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
      <meshStandardMaterial
        roughness={0.5}
        emissive="#ffffff"
        emissiveIntensity={style.shape === 'star' ? 0.35 : 0}
      />
    </instancedMesh>
  )
}

/** Flat shock ring on hammer impact. */
export function ImpactRing3D({
  startAt,
  y = 0.02,
}: {
  startAt: number
  y?: number
}) {
  const ref = useRef<Mesh>(null)
  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const t = fxProgress(startAt, performance.now(), 260)
    mesh.visible = t !== null
    if (t === null) return
    const s = 0.2 + t * 0.55
    mesh.scale.set(s, s, 1)
    ;(mesh.material as MeshBasicMaterial).opacity = 0.85 * (1 - t)
  })
  return (
    <mesh
      ref={ref}
      position={[0, y, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={false}
    >
      <ringGeometry args={[0.8, 1, 40]} />
      <meshBasicMaterial color="#ffffff" transparent depthWrite={false} />
    </mesh>
  )
}
