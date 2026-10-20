import { useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import type { Group } from 'three'
import { fxProgress, KILL_MS } from '@game3d/fx'
import { MOB_TILT_X } from '@game3d/layout3d'
import { MobModel3D } from '@game3d/MobModel3D'
import { mobGlbUrl } from '@game3d/resolveMobGlb'

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
    const group = ref.current
    if (!group) return
    const progress = fxProgress(startAt, performance.now(), KILL_MS)
    group.visible = progress !== null
    if (progress === null) return
    if (bomb) {
      const scale =
        progress < 0.3
          ? 1 + progress * 1.6
          : Math.max(0, 1.48 * (1 - (progress - 0.3) / 0.25))
      group.scale.set(
        scale,
        scale * (progress < 0.3 ? 1 - progress * 0.5 : 1),
        scale,
      )
      group.position.y = -0.12
      return
    }
    group.position.y = -0.12 + Math.sin(progress * Math.PI) * 0.55
    group.rotation.y = progress * Math.PI * 3
    const scale =
      progress < 0.15
        ? 1 + progress * 1.5
        : (1 - (progress - 0.15) / 0.85) * 1.22
    group.scale.set(
      scale,
      scale * (progress < 0.15 ? 1 - progress * 2 : 1),
      scale,
    )
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
