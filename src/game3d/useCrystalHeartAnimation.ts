import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, Plane, Vector3, type Group } from 'three'
import { clipCrystalHeart } from './crystalHeartAnimation'

export function useCrystalHeartAnimation(
  fill: number,
  index: number,
  reducedMotion: boolean,
) {
  const root = useRef<Group>(null)
  const sparkle = useRef<Group>(null)
  const amount = useRef(fill)
  const center = (index - 2.5) * 1.75
  const planes = useMemo(
    () => ({
      full: [new Plane(new Vector3(-1, 0, 0), 0)] as [Plane],
      empty: [new Plane(new Vector3(1, 0, 0), 0)] as [Plane],
    }),
    [],
  )
  useFrame(({ clock }, delta) => {
    amount.current = reducedMotion
      ? fill
      : MathUtils.damp(amount.current, fill, 14, Math.min(delta, 0.1))
    const boundary = center - 0.9 + amount.current * 1.8
    clipCrystalHeart(planes.full[0], planes.empty[0], boundary)
    if (root.current)
      root.current.rotation.set(
        -0.13 +
          (reducedMotion
            ? 0
            : Math.sin(clock.elapsedTime * 0.7 + index) * 0.08),
        -0.22 +
          (reducedMotion
            ? 0
            : Math.sin(clock.elapsedTime * 0.55 + index * 0.6) * 0.16),
        -0.035,
      )
    if (sparkle.current) {
      const pulse = reducedMotion
        ? 0.45
        : Math.pow(
            Math.max(0, Math.sin(clock.elapsedTime * 1.5 + index * 1.7)),
            12,
          )
      sparkle.current.scale.setScalar(pulse * Math.min(1, amount.current * 3))
    }
  })
  return { root, sparkle, center, planes }
}
