import { useLayoutEffect } from 'react'
import { Box3, Vector3, type Object3D } from 'three'

/** Center X/Z and place the mesh top at `surfaceY` (world Y). */
export function useAlignTopToSurface(object: Object3D, surfaceY: number): void {
  useLayoutEffect(() => {
    const box = new Box3().setFromObject(object)
    if (box.isEmpty()) {
      return
    }
    const center = box.getCenter(new Vector3())
    object.position.x -= center.x
    object.position.z -= center.z
    box.setFromObject(object)
    object.position.y += surfaceY - box.max.y
  }, [object, surfaceY])
}
