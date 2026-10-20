import { ExtrudeGeometry, Path, Shape } from 'three'
import { HOLE_ORDER } from '@game/layout'
import { holeWorldPosition } from './layout3d'

/** A separate metal deck with nine real holes: no surface covers a touch target. */
export function createBossDeck() {
  const shape = new Shape()
  shape.moveTo(-1.92, -2.05)
  shape.lineTo(1.92, -2.05)
  shape.quadraticCurveTo(2.2, -2.05, 2.2, -1.77)
  shape.lineTo(2.2, 1.9)
  shape.quadraticCurveTo(2.2, 2.12, 1.92, 2.12)
  shape.lineTo(-1.92, 2.12)
  shape.quadraticCurveTo(-2.2, 2.12, -2.2, 1.9)
  shape.lineTo(-2.2, -1.77)
  shape.quadraticCurveTo(-2.2, -2.05, -1.92, -2.05)
  for (const hole of HOLE_ORDER) {
    const [posX, , posZ] = holeWorldPosition(hole)
    const opening = new Path()
    opening.absarc(posX, -posZ, 0.41, 0, Math.PI * 2, true)
    shape.holes.push(opening)
  }
  return new ExtrudeGeometry(shape, {
    depth: 0.3,
    bevelEnabled: true,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    bevelSegments: 3,
    curveSegments: 32,
  })
}
