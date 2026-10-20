import { useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import type { Group } from 'three'
import { fxProgress, KILL_MS } from './fx'
import { MOB_TILT_X } from './layout3d'
import { MobModel3D } from './MobModel3D'
import { mobGlbUrl } from './resolveMobGlb'

/** todome: the defeated mob jumps out of the hole spinning, squashes and vanishes. */
export function KillPop3D({
  glbKey,
  startAt,
  bomb,
}: {
  glbKey: string
  startAt: number
  bomb: boolean
}) {
  const ref = useRef<Group>(null)

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const t = fxProgress(startAt, performance.now(), KILL_MS)
    g.visible = t !== null
    if (t === null) return
    if (bomb) {
      const s =
        t < 0.3 ? 1 + t * 1.6 : Math.max(0, 1.48 * (1 - (t - 0.3) / 0.25))
      g.scale.set(s, s * (t < 0.3 ? 1 - t * 0.5 : 1), s)
      g.position.y = -0.12
      return
    }
    g.position.y = -0.12 + Math.sin(t * Math.PI) * 0.55
    g.rotation.y = t * Math.PI * 3
    const s = t < 0.15 ? 1 + t * 1.5 : (1 - (t - 0.15) / 0.85) * 1.22
    g.scale.set(s, s * (t < 0.15 ? 1 - t * 2 : 1), s)
  })

  return (
    <group ref={ref} visible={false}>
      <group rotation={[MOB_TILT_X, 0, 0]}>
        <Suspense fallback={null}>
          <MobModel3D url={mobGlbUrl(glbKey)} damaged shatter={false} />
        </Suspense>
      </group>
    </group>
  )
}
