import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'
import { describe, expect, it } from 'vitest'
import { HOLES } from '@game/engine/shared'
import type { HoleIndex } from '@game/types'
import {
  BOARD_SURFACE_Y,
  cameraFit,
  holeWorldPosition,
  HOLE_TAP_DEPTH,
  HOLE_TAP_WIDTH,
  sceneCameraView,
} from '@game3d/layout3d'

function setupSceneAndCamera(width: number, height: number) {
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
  camera.updateMatrixWorld(true)

  // Build the 9 tap target meshes exactly like HoleSlot3D
  const tapMeshes: { hole: HoleIndex; mesh: Mesh }[] = []
  const tapGeometry = new BoxGeometry(HOLE_TAP_WIDTH, 0.28, HOLE_TAP_DEPTH)
  const material = new MeshBasicMaterial()
  for (const hole of HOLES) {
    const [posX, , posZ] = holeWorldPosition(hole)
    const mesh = new Mesh(tapGeometry, material)
    mesh.position.set(posX, BOARD_SURFACE_Y + 0.04, posZ)
    mesh.updateMatrixWorld(true)
    tapMeshes.push({ hole, mesh })
  }
  return { camera, tapMeshes, aspect }
}

function projectToNdc(camera: PerspectiveCamera, worldPoint: Vector3): Vector2 {
  const projected = worldPoint.clone().project(camera)
  return new Vector2(projected.x, projected.y)
}

describe('3D tap target raycast alignment', () => {
  for (const [name, width, height] of [
    ['phone-portrait', 390, 844],
    ['tablet-portrait', 768, 1024],
    ['desktop', 1280, 800],
    ['phone-landscape', 844, 390],
    ['phone-landscape-small', 667, 375],
  ] as const) {
    it(`ray from screen center of each hole hits that exact hole first at ${name} (${String(width)}×${String(height)})`, () => {
      const { camera, tapMeshes } = setupSceneAndCamera(width, height)
      const raycaster = new Raycaster()
      const allMeshes = tapMeshes.map((item) => item.mesh)

      for (const { hole, mesh } of tapMeshes) {
        // Project center of this hole's tap volume to NDC [-1, 1]
        const ndc = projectToNdc(camera, mesh.position)
        raycaster.setFromCamera(ndc, camera)
        const intersects = raycaster.intersectObjects(allMeshes, false)

        expect(intersects.length).toBeGreaterThan(0)
        const firstHitMesh = intersects[0]?.object
        const matchedHole = tapMeshes.find(
          (item) => item.mesh === firstHitMesh,
        )?.hole
        expect(matchedHole).toBe(hole)

        // Off-center taps (±25% along width and depth) must still resolve to this hole
        for (const [deltaX, deltaZ] of [
          [HOLE_TAP_WIDTH * 0.25, 0],
          [-HOLE_TAP_WIDTH * 0.25, 0],
          [0, HOLE_TAP_DEPTH * 0.25],
          [0, -HOLE_TAP_DEPTH * 0.25],
        ]) {
          const offPoint = mesh.position
            .clone()
            .add(new Vector3(deltaX, 0, deltaZ))
          const offNdc = projectToNdc(camera, offPoint)
          raycaster.setFromCamera(offNdc, camera)
          const offHits = raycaster.intersectObjects(allMeshes, false)
          expect(offHits.length).toBeGreaterThan(0)
          const offMatched = tapMeshes.find(
            (item) => item.mesh === offHits[0]?.object,
          )?.hole
          expect(offMatched).toBe(hole)
        }
      }
    })
  }
})
