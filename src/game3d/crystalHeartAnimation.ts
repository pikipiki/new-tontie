import { OrthographicCamera, type Camera, type Plane } from 'three'

/** Imperative Three.js updates belong to the render loop, outside React rendering. */
export function clipCrystalHeart(full: Plane, empty: Plane, boundary: number) {
  full.constant = boundary
  empty.constant = -boundary
}

export function fitCrystalHeartsCamera(camera: Camera, width: number) {
  if (camera instanceof OrthographicCamera) {
    camera.zoom = width / 10.7
    camera.updateProjectionMatrix()
  }
}
