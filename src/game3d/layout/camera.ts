export const CAMERA_POSITION: [number, number, number] = [3.4, 4.6, 6.5]
export const CAMERA_TARGET: [number, number, number] = [-0.1, 0.85, 0.1]
/** Vertical FOV that frames the board on a square viewport (the SWF stage is 400×400). */
export const BASE_FOV = 39
const MAX_PORTRAIT_FOV = 56

/**
 * Portrait phones: widen the FOV up to a limit, then dolly back along the view axis
 * so the board's full width stays visible. Landscape keeps the square framing.
 */
export function cameraFit(aspect: number): {
  fov: number
  distanceScale: number
} {
  if (aspect >= 1) {
    return { fov: BASE_FOV, distanceScale: 1 }
  }
  const toRad = Math.PI / 180
  const needTan = Math.tan((BASE_FOV / 2) * toRad) / aspect
  const tan = Math.min(Math.tan((MAX_PORTRAIT_FOV / 2) * toRad), needTan)
  return {
    fov: (2 * Math.atan(tan)) / toRad,
    distanceScale: (needTan / tan) * 1.03,
  }
}

export function sceneCameraView(
  aspect: number,
  photo = false,
): {
  position: [number, number, number]
  target: [number, number, number]
  distanceScale: number
} {
  if (photo)
    return {
      position: CAMERA_POSITION,
      target: CAMERA_TARGET,
      distanceScale: 1,
    }
  return {
    position: aspect < 0.8 ? [0, 6.9, 4.9] : [0, 5.9, 6.1],
    target: [0, 0.6, 0.2],
    distanceScale: aspect >= 0.8 ? 1.16 : 1,
  }
}
