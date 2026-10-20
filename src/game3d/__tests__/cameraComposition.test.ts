import { PerspectiveCamera, Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import type { HoleIndex } from '@game/types'
import { HOLE_ORDER } from '@game/layout'
import {
  BOARD_SURFACE_Y,
  cameraFit,
  holeWorldPosition,
  PINK_LEDGE_POSITION,
  PINK_LEDGE_SCALE,
  sceneCameraView,
} from '@game3d/layout3d'

function screenPoint(width: number, height: number, point: Vector3) {
  const aspect = width / height
  const fit = cameraFit(aspect)
  const view = sceneCameraView(aspect)
  const aim = new Vector3(...view.target)
  const camera = new PerspectiveCamera(fit.fov, aspect, 0.08, 40)
  camera.position
    .set(...view.position)
    .sub(aim)
    .multiplyScalar(fit.distanceScale * view.distanceScale)
    .add(aim)
  camera.lookAt(aim)
  camera.updateMatrixWorld()
  point.project(camera)
  return { x: ((point.x + 1) * width) / 2, y: ((1 - point.y) * height) / 2 }
}

describe('playable cabinet composition', () => {
  for (const [width, height] of [
    [390, 844],
    [768, 1024],
    [1448, 1086],
  ] as const) {
    it(`keeps nine separated targets and the pink companion visible at ${String(width)}×${String(height)}`, () => {
      const projectHole = (hole: HoleIndex) => {
        const [posX, , posZ] = holeWorldPosition(hole)
        return screenPoint(
          width,
          height,
          new Vector3(posX, BOARD_SURFACE_Y, posZ),
        )
      }
      const points = HOLE_ORDER.map(projectHole)
      for (const point of points) {
        expect(point.x).toBeGreaterThan(44)
        expect(point.x).toBeLessThan(width - 44)
        expect(point.y).toBeGreaterThan(44)
        expect(point.y).toBeLessThan(height - 160)
      }
      // A phone's rows must not collapse into visually overlapping tap centres.
      expect(projectHole(4).y - projectHole(7).y).toBeGreaterThan(42)
      expect(projectHole(8).x - projectHole(7).x).toBeGreaterThan(44)
      const [posX, posY, posZ] = PINK_LEDGE_POSITION
      const pinkTop = screenPoint(
        width,
        height,
        new Vector3(posX, posY + 0.95 * PINK_LEDGE_SCALE, posZ - 0.1),
      )
      const pinkFeet = screenPoint(width, height, new Vector3(posX, posY, posZ))
      // The entire character starts below the front row, rather than covering its targets.
      expect(pinkTop.y).toBeGreaterThan(projectHole(1).y + 24)
      expect(pinkFeet.y).toBeLessThan(height - 80)
      expect(pinkTop.x).toBeGreaterThan(32)
    })
  }
})
