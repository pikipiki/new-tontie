import {
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  Sphere,
  Vector3,
  type Object3D,
} from 'three'

export const PINK_MOUTH: [number, number, number] = [0, 0.276, 0.505]
export const SNACK_HAND_REST = new Vector3(-0.355, 0.24, 0.205)
export const SNACK_HAND_BITE = new Vector3(-0.015, 0.12, 0.395)
export const SNACK_DONUT_OFFSET = new Vector3(0.015, 0.03, 0.11)
const SEGMENTS = 18,
  SIDES = 10

export interface SnackClock {
  age: number
  last: number | null
}

/** Pause chewing while hidden; keep the partially eaten donut between flights. */
export function snackAge(
  root: Object3D,
  clock: { current: SnackClock },
  elapsed: number,
): number | null {
  let ancestor: Object3D | null = root
  while (ancestor) {
    if (!ancestor.visible) {
      clock.current.last = null
      return null
    }
    ancestor = ancestor.parent
  }
  if (clock.current.last !== null)
    clock.current.age += elapsed - clock.current.last
  clock.current.last = elapsed
  return clock.current.age
}

export function createSnackArmGeometry() {
  const geometry = new BufferGeometry()
  const vertices = (SEGMENTS + 1) * (SIDES + 1)
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(new Float32Array(vertices * 3), 3),
  )
  geometry.setAttribute(
    'normal',
    new Float32BufferAttribute(new Float32Array(vertices * 3), 3),
  )
  const uvs: number[] = [],
    indices: number[] = []
  for (let row = 0; row <= SEGMENTS; row++)
    for (let side = 0; side <= SIDES; side++) {
      uvs.push(side / SIDES, row / SEGMENTS)
      if (row < SEGMENTS && side < SIDES) {
        const vertex = row * (SIDES + 1) + side,
          next = vertex + SIDES + 1
        indices.push(vertex, vertex + 1, next, next, vertex + 1, next + 1)
      }
    }
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.boundingSphere = new Sphere(new Vector3(-0.2, 0.3, 0.2), 0.7)
  return geometry
}

/** Bend the stuffed arm toward its wrist without detaching the shoulder or stretching the fingers. */
export function updateSnackArm(
  geometry: BufferGeometry,
  curve: CatmullRomCurve3,
  lift: number,
) {
  curve.points[1]?.set(
    -0.39 + 0.06 * lift,
    0.36 - 0.17 * lift,
    0.07 + 0.14 * lift,
  )
  curve.points[2]?.lerpVectors(SNACK_HAND_REST, SNACK_HAND_BITE, lift)
  const positions = geometry.getAttribute('position'),
    normals = geometry.getAttribute('normal')
  const point = new Vector3(),
    tangent = new Vector3(),
    normal = new Vector3(),
    binormal = new Vector3()
  for (let row = 0; row <= SEGMENTS; row++) {
    const blend = row / SEGMENTS
    curve.getPoint(blend, point)
    curve.getTangent(blend, tangent)
    normal.set(-tangent.y, tangent.x, 0).normalize()
    binormal.crossVectors(tangent, normal).normalize()
    const radius = 0.057 + blend * 0.009
    for (let side = 0; side <= SIDES; side++) {
      const angle = (side / SIDES) * Math.PI * 2,
        cosine = Math.cos(angle),
        sine = Math.sin(angle)
      const offsetX = normal.x * cosine + binormal.x * sine
      const offsetY = normal.y * cosine + binormal.y * sine
      const offsetZ = normal.z * cosine + binormal.z * sine
      const vertex = row * (SIDES + 1) + side
      positions.setXYZ(
        vertex,
        point.x + radius * offsetX,
        point.y + radius * offsetY,
        point.z + radius * offsetZ,
      )
      normals.setXYZ(vertex, offsetX, offsetY, offsetZ)
    }
  }
  positions.needsUpdate = true
  normals.needsUpdate = true
}
