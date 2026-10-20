import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { DAMAGE_MS, fxProgress, useGameFx } from './fx'
import { cameraFit, CAMERA_TARGET, sceneCameraView } from './layout3d'
import { frameCamera } from './sceneMutations'

const target = new Vector3(...CAMERA_TARGET)
const base = new Vector3()
const shaken = new Vector3()

/** Keeps the whole board in view for any viewport ratio and shakes the view on damage. */
export function CameraRig3D({ photo = false }: { photo?: boolean }) {
  const fx = useGameFx()

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
    const t = fxProgress(fx.damageAt, performance.now(), DAMAGE_MS)
    if (t === null) {
      frameCamera(camera, fit.fov, base, target)
      return
    }
    const amp = 0.09 * (1 - t)
    shaken.set(
      base.x + Math.sin(t * 61) * amp,
      base.y + Math.sin(t * 47 + 1) * amp * 0.6,
      base.z,
    )
    frameCamera(camera, fit.fov, shaken, target)
  })

  return null
}
