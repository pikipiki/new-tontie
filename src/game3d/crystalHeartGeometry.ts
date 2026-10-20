import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'

/** Tontie's angular heart silhouette with a cut crown, girdle and deep pavilion. */
export function createCrystalHeartGeometry(): BufferGeometry {
  const outline = [
    [0, -0.62],
    [0.54, -0.36],
    [0.79, 0.05],
    [0.74, 0.44],
    [0.36, 0.62],
    [0, 0.34],
    [-0.36, 0.62],
    [-0.74, 0.44],
    [-0.79, 0.05],
    [-0.54, -0.36],
  ] as const
  const positions: number[] = []
  const triangle = (first: Vector3, second: Vector3, third: Vector3) => {
    positions.push(...first.toArray(), ...second.toArray(), ...third.toArray())
  }
  for (const [index, current] of outline.entries()) {
    const next = outline[(index + 1) % outline.length]
    if (!next) continue
    const edge = new Vector3(current[0], current[1], 0.045)
    const edgeNext = new Vector3(next[0], next[1], 0.045)
    const crown = new Vector3(current[0] * 0.62, current[1] * 0.62, 0.29)
    const crownNext = new Vector3(next[0] * 0.62, next[1] * 0.62, 0.29)
    const back = new Vector3(current[0], current[1], -0.045)
    const backNext = new Vector3(next[0], next[1], -0.045)
    triangle(edge, edgeNext, crownNext)
    triangle(edge, crownNext, crown)
    triangle(crown, crownNext, new Vector3(0, -0.04, 0.37))
    triangle(edge, back, backNext)
    triangle(edge, backNext, edgeNext)
    triangle(backNext, back, new Vector3(0, -0.04, -0.39))
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}
