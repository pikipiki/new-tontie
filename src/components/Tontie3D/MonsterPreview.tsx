import { themeColors } from './theme'
import { ContactShadows } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import type { Group } from 'three'
import { MobModel3D } from '@game3d/MobModel3D'
import { mobGlbSize, mobGlbUrl } from '@game3d/resolveMobGlb'

const STAGE_HEIGHT = 0.95
const POP_MS = 620

/** Back-out ease: overshoots then settles, like the puff on up_boad frames 4-7. */
function popEase(blend: number): number {
  const overshoot = 2.2
  const progress = blend - 1
  return 1 + (overshoot + 1) * progress ** 3 + overshoot * progress ** 2
}

function Turntable({ glbKey }: { glbKey: string }) {
  const ref = useRef<Group>(null)
  const born = useRef<number | null>(null)
  const [width, height, depth] = mobGlbSize(glbKey)
  const scale = STAGE_HEIGHT / Math.max(height, Math.max(width, depth) * 0.8)

  useFrame(({ clock }) => {
    const group = ref.current
    if (!group) return
    const now = clock.getElapsedTime() * 1000
    born.current ??= now
    const lerpFactor = Math.min(1, (now - born.current) / POP_MS)
    const scaleNow = scale * Math.max(0.001, popEase(lerpFactor))
    group.scale.set(scaleNow, scaleNow, scaleNow)
    group.rotation.y = Math.sin(now / 1400) * 0.5
    group.position.y = Math.abs(Math.sin(now / 520)) * 0.035
  })

  return (
    <group ref={ref}>
      <MobModel3D url={mobGlbUrl(glbKey)} seed={3} />
    </group>
  )
}

/** The monster a level introduces, turning slowly on a little stage (enemy_b on up_boad "on"). */
export function MonsterPreview({ glbKey }: { glbKey: string }) {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0.62, 2.35], fov: 30, near: 0.1, far: 20 }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0.42, 0)
      }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[1.6, 2.6, 2.2]} intensity={2.1} />
      <directionalLight
        position={[-2, 1.2, -1.5]}
        intensity={0.9}
        color={themeColors.purplePreview}
      />
      <Suspense fallback={null}>
        <Turntable key={glbKey} glbKey={glbKey} />
      </Suspense>
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.45}
        scale={1.8}
        blur={2.4}
        far={1}
        color={themeColors.purpleInk}
      />
    </Canvas>
  )
}
