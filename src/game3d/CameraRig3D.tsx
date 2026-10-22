import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { DAMAGE_MS, fxProgress, useGameFx } from '@game3d/fx'
import { cameraFit, sceneCameraView } from '@game3d/layout3d'
import { frameCamera } from '@game3d/sceneMutations'

/** Recompute framing on resize; keep mutable scratch vectors local to this canvas. */
export function CameraRig3D({ photo = false }: { photo?: boolean }) {
  const gameFx = useGameFx()
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const view = useMemo(() => {
    const aspect = width / Math.max(1, height)
    const fit = cameraFit(aspect)
    const composition = sceneCameraView(aspect, photo)
    const target = new Vector3(...composition.target)
    const base = new Vector3(...composition.position)
      .sub(target)
      .multiplyScalar(fit.distanceScale * composition.distanceScale)
      .add(target)
    return { target, base, shaken: new Vector3(), fov: fit.fov }
  }, [width, height, photo])

  useFrame(({ camera }) => {
    const shakePhase = fxProgress(gameFx.damageAt, performance.now(), DAMAGE_MS)
    if (shakePhase === null) {
      frameCamera(camera, view.fov, view.base, view.target)
      return
    }
    const amplitude = 0.09 * (1 - shakePhase)
    view.shaken.set(
      view.base.x + Math.sin(shakePhase * 61) * amplitude,
      view.base.y + Math.sin(shakePhase * 47 + 1) * amplitude * 0.6,
      view.base.z,
    )
    frameCamera(camera, view.fov, view.shaken, view.target)
  })
  return null
}
