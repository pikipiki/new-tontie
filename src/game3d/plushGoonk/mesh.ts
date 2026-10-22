import { plush as config } from '@/config/presentation.json'
import {
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  Vector3,
} from 'three'
import { bodyPoint } from '@game3d/plushGoonk/profile'

export function stuffedBody() {
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = []
  const rows = config.bodyRows,
    columns = config.bodyColumns
  for (let row = 0; row <= rows; row++)
    for (let col = 0; col <= columns; col++) {
      positions.push(
        ...bodyPoint(row / rows, (col / columns) * Math.PI * 2).toArray(),
      )
      uvs.push(col / columns, row / rows)
    }
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < columns; col++) {
      const cornerA = row * (columns + 1) + col,
        cornerB = cornerA + columns + 1
      indices.push(
        cornerA,
        cornerA + 1,
        cornerB,
        cornerB,
        cornerA + 1,
        cornerB + 1,
      )
    }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export function stuffedTube(
  points: Vector3[],
  radiusStart: number,
  radiusEnd: number,
  flatten = 1,
) {
  const curve = new CatmullRomCurve3(points)
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = []
  const rows = config.tubeRows,
    sides = config.tubeSides
  for (let row = 0; row <= rows; row++) {
    const rowAlong = row / rows,
      center = curve.getPoint(rowAlong),
      tangent = curve.getTangent(rowAlong)
    const normal = new Vector3(1, 0, 0)
    if (Math.abs(tangent.dot(normal)) > 0.9) normal.set(0, 0, 1)
    normal.addScaledVector(tangent, -normal.dot(tangent)).normalize()
    const binormal = new Vector3().crossVectors(tangent, normal).normalize()
    const radius = radiusStart * (1 - rowAlong) + radiusEnd * rowAlong
    for (let side = 0; side <= sides; side++) {
      const angle = (side / sides) * Math.PI * 2
      const vertex = center
        .clone()
        .addScaledVector(normal, Math.cos(angle) * radius)
        .addScaledVector(binormal, Math.sin(angle) * radius * flatten)
      positions.push(...vertex.toArray())
      uvs.push(side / sides, rowAlong)
    }
  }
  for (let row = 0; row < rows; row++)
    for (let side = 0; side < sides; side++) {
      const cornerA = row * (sides + 1) + side,
        cornerB = cornerA + sides + 1
      indices.push(
        cornerA,
        cornerA + 1,
        cornerB,
        cornerB,
        cornerA + 1,
        cornerB + 1,
      )
    }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export const PLUSH_BODY = stuffedBody()
export const VIOLET_NOSE = stuffedTube(
  [
    new Vector3(0, 0.46, 0.22),
    new Vector3(0, 0.41, 0.36),
    new Vector3(0, 0.285, 0.43),
  ],
  0.102,
  0.037,
  0.83,
)
export const PINK_NOSE = stuffedTube(
  [
    new Vector3(0, 0.45, 0.22),
    new Vector3(0, 0.395, 0.37),
    new Vector3(0, 0.3, 0.5),
  ],
  0.105,
  0.018,
  0.83,
)

function createFurGeometry() {
  const positions: number[] = []
  let seed = 37
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let strand = 0; strand < config.furStrands; strand++) {
    const alongProfile = 0.04 + random() * 0.91,
      angle = random() * Math.PI * 2
    const point = bodyPoint(alongProfile, angle, 0.001)
    const end = bodyPoint(
      alongProfile + 0.003 * random(),
      angle + 0.004,
      0.004 + random() * 0.003,
    )
    positions.push(...point.toArray(), ...end.toArray())
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}
export const PLUSH_FUR = createFurGeometry()
