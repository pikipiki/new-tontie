import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { DAMAGE_MS, fxProgress, useGameFx } from '@game3d/fx'
import { cameraFit, CAMERA_TARGET, sceneCameraView } from '@game3d/layout3d'
import { frameCamera } from '@game3d/sceneMutations'

const target = new Vector3(...CAMERA_TARGET)
const base = new Vector3()
const shaken = new Vector3()

/** Keeps the whole board in view for any viewport ratio and shakes the view on damage. */
export function CameraRig3D({ photo = false }: { photo?: boolean }) {
  const gameFx = useGameFx()

  useFrame(({ camera, size }) => {
    const fit = cameraFit(size.width / Math.max(1, size.height))
    const aspect = size.width / Math.max(1, size.height)
    const view = sceneCameraView(aspect, photo)
    target.set(...view.target)
    base
      .set(...view.position)
      .sub(target)
      .multiplyScalar(fit.distanceScale * view.distanceScale)
      .add(target)
    const shakePhase = fxProgress(gameFx.damageAt, performance.now(), DAMAGE_MS)
    if (shakePhase === null) {
      frameCamera(camera, fit.fov, base, target)
      return
    }
    const amp = 0.09 * (1 - shakePhase)
    shaken.set(
      base.x + Math.sin(shakePhase * 61) * amp,
      base.y + Math.sin(shakePhase * 47 + 1) * amp * 0.6,
      base.z,
    )
    frameCamera(camera, fit.fov, shaken, target)
  })

  return null
}
