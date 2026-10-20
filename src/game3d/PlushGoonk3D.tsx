import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  DoubleSide,
  Float32BufferAttribute,
  MeshPhysicalMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type Group,
} from 'three'
import { PINK_FLIGHT_MS } from './plushAnimation'
import { PinkSnack3D } from './PinkSnack3D'

const PROFILE = new CatmullRomCurve3([
  new Vector3(0, 0.065, 0),
  new Vector3(0.2, 0.07, 0),
  new Vector3(0.29, 0.15, 0),
  new Vector3(0.325, 0.34, 0),
  new Vector3(0.3, 0.53, 0),
  new Vector3(0.24, 0.67, 0),
  new Vector3(0.14, 0.755, 0),
  new Vector3(0, 0.78, 0),
])

function bodyPoint(u: number, angle: number, offset = 0) {
  const p = PROFILE.getPoint(u)
  const seam = Math.exp(-Math.pow(Math.cos(angle * 2), 2) * 190) * 0.007
  const radius = Math.max(0, p.x - seam * Math.sin(u * Math.PI)) + offset
  return new Vector3(
    Math.sin(angle) * radius,
    p.y,
    Math.cos(angle) * radius * 0.82,
  )
}

function stuffedBody() {
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = []
  const rows = 64,
    columns = 96
  for (let y = 0; y <= rows; y++)
    for (let x = 0; x <= columns; x++) {
      positions.push(
        ...bodyPoint(y / rows, (x / columns) * Math.PI * 2).toArray(),
      )
      uvs.push(x / columns, y / rows)
    }
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < columns; x++) {
      const a = y * (columns + 1) + x,
        b = a + columns + 1
      indices.push(a, a + 1, b, b, a + 1, b + 1)
    }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/** Fine directional pile, with larger patches of brushed velour, generated locally. */
function velourTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  const pixels = ctx.createImageData(512, 512)
  let seed = 731
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let y = 0; y < 512; y++)
    for (let x = 0; x < 512; x++) {
      const index = (y * 512 + x) * 4
      const mottle =
        Math.sin(x * 0.047 + Math.sin(y * 0.019) * 3) * Math.cos(y * 0.043) * 17
      const value = Math.min(255, 201 + mottle + random() * 47)
      pixels.data[index] =
        pixels.data[index + 1] =
        pixels.data[index + 2] =
          value
      pixels.data[index + 3] = 255
    }
  ctx.putImageData(pixels, 0, 0)
  for (let i = 0; i < 31000; i++) {
    const x = random() * 512,
      y = random() * 512
    ctx.strokeStyle =
      random() > 0.5 ? 'rgba(255,255,255,.28)' : 'rgba(67,49,77,.15)'
    ctx.lineWidth = 0.45 + random() * 0.55
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + random() * 1.5, y + 1.5 + random() * 3)
    ctx.stroke()
  }
  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  map.wrapS = map.wrapT = RepeatWrapping
  map.repeat.set(2, 2)
  map.anisotropy = 8
  return map
}

let clothMap: CanvasTexture | undefined
function sharedVelourTexture() {
  clothMap ??= velourTexture()
  return clothMap
}

function stuffedTube(
  points: Vector3[],
  radiusStart: number,
  radiusEnd: number,
  flatten = 1,
) {
  const curve = new CatmullRomCurve3(points)
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = []
  const rows = 32,
    sides = 24
  for (let i = 0; i <= rows; i++) {
    const t = i / rows,
      center = curve.getPoint(t),
      tangent = curve.getTangent(t)
    const normal = new Vector3(1, 0, 0)
    if (Math.abs(tangent.dot(normal)) > 0.9) normal.set(0, 0, 1)
    normal.addScaledVector(tangent, -normal.dot(tangent)).normalize()
    const binormal = new Vector3().crossVectors(tangent, normal).normalize()
    const radius = radiusStart * (1 - t) + radiusEnd * t
    for (let j = 0; j <= sides; j++) {
      const angle = (j / sides) * Math.PI * 2
      const p = center
        .clone()
        .addScaledVector(normal, Math.cos(angle) * radius)
        .addScaledVector(binormal, Math.sin(angle) * radius * flatten)
      positions.push(...p.toArray())
      uvs.push(j / sides, t)
    }
  }
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < sides; j++) {
      const a = i * (sides + 1) + j,
        b = a + sides + 1
      indices.push(a, a + 1, b, b, a + 1, b + 1)
    }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

const BODY = stuffedBody()
const VIOLET_NOSE = stuffedTube(
  [
    new Vector3(0, 0.46, 0.22),
    new Vector3(0, 0.41, 0.36),
    new Vector3(0, 0.285, 0.43),
  ],
  0.102,
  0.037,
  0.83,
)
const PINK_NOSE = stuffedTube(
  [
    new Vector3(0, 0.45, 0.22),
    new Vector3(0, 0.395, 0.37),
    new Vector3(0, 0.3, 0.5),
  ],
  0.105,
  0.018,
  0.83,
)

function Arm({
  side,
  material,
  holding = false,
  scared = false,
}: {
  side: number
  material: MeshPhysicalMaterial
  holding?: boolean
  scared?: boolean
}) {
  const geometry = useMemo(
    () =>
      stuffedTube(
        [
          new Vector3(side * 0.27, 0.43, 0.015),
          new Vector3(side * 0.39, 0.36, 0.07),
          new Vector3(side * 0.37, 0.24, 0.2),
        ],
        0.057,
        0.066,
      ),
    [side],
  )
  useEffect(
    () => () => {
      geometry.dispose()
    },
    [geometry],
  )
  const grip = useMemo(
    () =>
      stuffedTube(
        [
          new Vector3(0.27, 0.43, 0.015),
          new Vector3(0.37, 0.48, 0.1),
          new Vector3(0.2, 0.48, 0.02),
        ],
        0.057,
        0.06,
      ),
    [],
  )
  useEffect(
    () => () => {
      grip.dispose()
    },
    [grip],
  )
  const anxious = useMemo(
    () =>
      stuffedTube(
        [
          new Vector3(side * 0.27, 0.43, 0.015),
          new Vector3(side * 0.37, 0.34, 0.18),
          new Vector3(side * 0.205, 0.5, 0.26),
        ],
        0.057,
        0.061,
      ),
    [side],
  )
  useEffect(
    () => () => {
      anxious.dispose()
    },
    [anxious],
  )
  if (scared)
    return (
      <group>
        <mesh geometry={anxious} material={material} castShadow />
        <mesh
          position={[side * 0.205, 0.5, 0.26]}
          scale={[0.067, 0.066, 0.045]}
          material={material}
        >
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[side * (0.17 + i * 0.032), 0.55, 0.275]}
            scale={[0.022, 0.043, 0.027]}
            material={material}
          >
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        ))}
      </group>
    )
  if (holding)
    return (
      <group>
        <mesh geometry={grip} material={material} castShadow />
        <mesh
          position={[0.2, 0.48, 0.02]}
          scale={[0.06, 0.05, 0.055]}
          material={material}
        >
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[0.17 + i * 0.024, 0.475, 0.058]}
            scale={[0.017, 0.035, 0.022]}
            material={material}
          >
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
        ))}
      </group>
    )
  return (
    <group>
      <mesh geometry={geometry} material={material} castShadow />
      <mesh
        position={[side * 0.355, 0.24, 0.205]}
        scale={[0.083, 0.074, 0.065]}
        material={material}
        castShadow
      >
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[
            side * (0.32 + i * 0.047),
            0.205 + (i === 1 ? -0.008 : 0.007),
            0.25,
          ]}
          rotation={[0.3, side * -0.3, side * 0.2]}
          scale={[0.029, 0.052, 0.038]}
          material={material}
          castShadow
        >
          <sphereGeometry args={[1, 20, 12]} />
        </mesh>
      ))}
      <mesh
        position={[side * 0.3, 0.275, 0.255]}
        rotation={[0, 0, side * -0.55]}
        scale={[0.032, 0.049, 0.034]}
        material={material}
      >
        <sphereGeometry args={[1, 20, 12]} />
      </mesh>
    </group>
  )
}

function FlatEye({
  side,
  seed,
  scared = false,
}: {
  side: number
  seed: number
  scared?: boolean
}) {
  const eye = useRef<Group>(null)
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime + seed * 0.67) % (3.8 + seed * 0.13)
    if (eye.current)
      eye.current.scale.y =
        t < 0.13 ? Math.max(0.09, Math.abs(Math.cos((t / 0.13) * Math.PI))) : 1
  })
  return (
    <group
      position={[side * 0.105, 0.575, 0.232]}
      scale={scared ? 1.18 : 1}
      rotation={[0.12, side * 0.28, -side * 0.12]}
    >
      <group ref={eye}>
        <mesh scale={[0.05, 0.065, 0.012]}>
          <sphereGeometry args={[1, 32, 20]} />
          <meshPhysicalMaterial
            color="#f5faf0"
            roughness={0.3}
            clearcoat={0.25}
          />
        </mesh>
        <mesh
          position={[-side * 0.011, -0.015, 0.012]}
          scale={scared ? [0.02, 0.027, 0.007] : [0.029, 0.038, 0.007]}
        >
          <sphereGeometry args={[1, 24, 16]} />
          <meshPhysicalMaterial
            color="#110f17"
            roughness={0.17}
            clearcoat={0.7}
          />
        </mesh>
        <mesh
          position={[-side * 0.011 - 0.009, 0.001, 0.019]}
          scale={[0.007, 0.01, 0.002]}
        >
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  )
}

function FurPile({ pink }: { pink: boolean }) {
  const geometry = useMemo(() => {
    const positions: number[] = []
    let seed = 37
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < 9000; i++) {
      const u = 0.04 + random() * 0.91,
        angle = random() * Math.PI * 2
      const point = bodyPoint(u, angle, 0.001)
      const end = bodyPoint(
        u + 0.003 * random(),
        angle + 0.004,
        0.004 + random() * 0.003,
      )
      positions.push(...point.toArray(), ...end.toArray())
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return g
  }, [])
  useEffect(
    () => () => {
      geometry.dispose()
    },
    [geometry],
  )
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={pink ? '#f3b2d7' : '#b39cdd'}
        transparent
        opacity={0.23}
        depthWrite={false}
      />
    </lineSegments>
  )
}

function Stitching({ pink }: { pink: boolean }) {
  const geometry = useMemo(() => {
    const points: number[] = []
    for (const angle of [
      Math.PI / 4,
      -Math.PI / 4,
      Math.PI * 0.75,
      -Math.PI * 0.75,
    ]) {
      for (let i = 3; i < 58; i++) {
        const p = bodyPoint(i / 64, angle - 0.008, 0.0015)
        const q = bodyPoint((i + 0.45) / 64, angle + 0.008, 0.0015)
        points.push(...p.toArray(), ...q.toArray())
      }
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(points, 3))
    return g
  }, [])
  useEffect(
    () => () => {
      geometry.dispose()
    },
    [geometry],
  )
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={pink ? '#ac6393' : '#624b92'}
        transparent
        opacity={0.65}
      />
    </lineSegments>
  )
}

function HelmetShard({ index, born }: { index: number; born: number }) {
  const group = useRef<Group>(null)
  const angle = (index / 8) * Math.PI * 2
  const profile = useMemo(
    () => [
      new Vector2(0.365, 0),
      new Vector2(0.33, 0.12),
      new Vector2(0.275, 0.255),
      new Vector2(0.145, 0.325),
      new Vector2(0.125, 0.325),
      new Vector2(0.255, 0.24),
      new Vector2(0.31, 0.11),
      new Vector2(0.345, 0),
    ],
    [],
  )
  useFrame(() => {
    if (!group.current) return
    const t = (performance.now() - born) / 900
    group.current.visible = t < 1
    group.current.position.set(
      Math.sin(angle) * t * 0.9,
      0.545 + 0.65 * t - 1.4 * t * t,
      Math.cos(angle) * t * 0.9,
    )
    group.current.rotation.set(
      t * (index % 2 ? 4 : -4),
      t * 3,
      Math.sin(angle) * t * 4,
    )
    group.current.scale.setScalar(Math.max(0.1, 1 - t * 0.6))
  })
  return (
    <group ref={group}>
      <mesh castShadow>
        <latheGeometry args={[profile, 12, angle, Math.PI / 4 - 0.035]} />
        <meshPhysicalMaterial
          color="#efe4ce"
          roughness={0.23}
          clearcoat={0.6}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.005, 5, 10, Math.PI / 4 - 0.035]} />
        <meshStandardMaterial color="#315d9c" />
      </mesh>
    </group>
  )
}

function ShatteredHelmet() {
  const [born] = useState(() => performance.now())
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => (
        <HelmetShard key={i} index={i} born={born} />
      ))}
    </group>
  )
}

function CryingFace() {
  const drops = useRef<(Group | null)[]>([])
  useFrame(({ clock }) => {
    drops.current.forEach((drop, i) => {
      if (!drop) return
      const side = i < 3 ? -1 : 1
      const t = (clock.elapsedTime * 1.8 + (i % 3) / 3) % 1
      drop.position.set(
        side * (0.12 + t * 0.065),
        0.54 - 0.3 * t,
        0.263 + t * 0.04,
      )
      drop.scale.setScalar(Math.sin(t * Math.PI) * 0.8 + 0.2)
    })
  })
  return (
    <group>
      {Array.from({ length: 6 }, (_, i) => (
        <group
          key={i}
          ref={(group) => {
            drops.current[i] = group
          }}
        >
          <mesh scale={[0.017, 0.033, 0.009]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial
              color="#8bd8f4"
              roughness={0.13}
              clearcoat={1}
            />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.108, 0.66, 0.225]}
          rotation={[0, 0, side * -0.4]}
          scale={[0.055, 0.009, 0.008]}
        >
          <sphereGeometry args={[1, 16, 8]} />
          <meshStandardMaterial color="#4f366c" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0.093, 0.27, 0.263]} scale={[0.044, 0.058, 0.009]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#291a3c" roughness={0.8} />
      </mesh>
      <mesh position={[0.093, 0.244, 0.273]} scale={[0.027, 0.021, 0.006]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#d985a9" roughness={0.8} />
      </mesh>
    </group>
  )
}

function PorcelainBowl() {
  const profile = useMemo(
    () => [
      new Vector2(0.365, 0),
      new Vector2(0.36, 0.025),
      new Vector2(0.33, 0.12),
      new Vector2(0.275, 0.255),
      new Vector2(0.18, 0.31),
      new Vector2(0.145, 0.315),
      new Vector2(0.145, 0.345),
      new Vector2(0.115, 0.345),
      new Vector2(0.115, 0.325),
      new Vector2(0, 0.325),
    ],
    [],
  )
  return (
    <group position={[0, 0.545, 0]} rotation={[0.025, 0, -0.035]}>
      <mesh castShadow>
        <latheGeometry args={[profile, 64]} />
        <meshPhysicalMaterial
          color="#efe4ce"
          roughness={0.23}
          clearcoat={0.7}
          side={DoubleSide}
        />
      </mesh>
      {[0.015, 0.031, 0.085, 0.272, 0.295].map((y) => {
        const radius = y < 0.09 ? 0.365 - y * 0.3 : 0.18 + (0.31 - y) * 1.5
        return (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.0038, 6, 64]} />
            <meshStandardMaterial color="#28549a" roughness={0.3} />
          </mesh>
        )
      })}
      {Array.from({ length: 30 }, (_, i) => {
        const a = (i / 30) * Math.PI * 2
        return (
          <group
            key={i}
            position={[Math.sin(a) * 0.349, 0.058, Math.cos(a) * 0.349]}
            rotation={[0, a, 0]}
          >
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[0.02, 0.003, 4, 4]} />
              <meshStandardMaterial color="#315d9c" roughness={0.35} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function YellowTuft() {
  const geometry = useMemo(() => {
    const points: number[] = []
    for (let i = 0; i < 85; i++) {
      const angle = i * 2.39996,
        x = Math.sin(angle) * 0.033,
        z = Math.cos(angle) * 0.025
      const h = 0.065 + (Math.sin(i * 71) + 1) * 0.035
      points.push(
        x,
        0.755,
        z,
        x * 1.4,
        0.755 + h * 0.55,
        z - 0.008,
        x * 1.4,
        0.755 + h * 0.55,
        z - 0.008,
        x * 1.8 + 0.015,
        0.755 + h,
        z - 0.023,
      )
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(points, 3))
    return g
  }, [])
  useEffect(
    () => () => {
      geometry.dispose()
    },
    [geometry],
  )
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#edc52e" />
    </lineSegments>
  )
}

/** Sewn egg-shaped plush, modelled directly from the two toy photographs. */
export function PlushGoonk3D({
  pink = false,
  bowl = false,
  damaged = false,
  flying = false,
  snacking = false,
  shatter = true,
  seed = 0,
}: {
  pink?: boolean
  bowl?: boolean
  damaged?: boolean
  flying?: boolean
  snacking?: boolean
  shatter?: boolean
  seed?: number
}) {
  const [reacting, setReacting] = useState(damaged)
  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setReacting(damaged)
      },
      damaged ? PINK_FLIGHT_MS * 0.42 : 0,
    )
    return () => {
      window.clearTimeout(timer)
    }
  }, [damaged])
  const frightened = damaged && reacting
  const fabric = useMemo(() => {
    const map = sharedVelourTexture()
    const material = new MeshPhysicalMaterial({
      color: pink ? '#ce7eb4' : '#7856b6',
      map,
      bumpMap: map,
      bumpScale: 0.011,
      roughness: 0.93,
      sheen: 1,
      sheenRoughness: 0.75,
      sheenColor: pink ? '#efb9d7' : '#a18bc8',
    })
    return { map, material }
  }, [pink])
  useEffect(
    () => () => {
      fabric.material.dispose()
    },
    [fabric],
  )
  return (
    <group>
      <mesh
        dispose={null}
        geometry={BODY}
        material={fabric.material}
        castShadow
        receiveShadow
      />
      <FurPile pink={pink} />
      <Stitching pink={pink} />
      <mesh
        dispose={null}
        geometry={pink ? PINK_NOSE : VIOLET_NOSE}
        material={fabric.material}
        castShadow
      />
      <mesh
        position={pink ? [0, 0.3, 0.5] : [0, 0.285, 0.43]}
        scale={pink ? [0.019, 0.024, 0.019] : [0.037, 0.038, 0.033]}
        material={fabric.material}
      >
        <sphereGeometry args={[1, 20, 12]} />
      </mesh>
      <FlatEye side={-1} seed={seed} scared={frightened} />
      <FlatEye side={1} seed={seed} scared={frightened} />
      {[-1, 1].map((side) =>
        pink && snacking && !flying && side === -1 ? (
          <PinkSnack3D key={side}>
            <Arm side={side} material={fabric.material} />
          </PinkSnack3D>
        ) : (
          <group
            key={side}
            position={[side * 0.27, 0.43, 0.015]}
            rotation={[0, 0, 0]}
          >
            <group position={[-side * 0.27, -0.43, -0.015]}>
              <Arm
                side={side}
                material={fabric.material}
                holding={pink && flying && side === 1}
                scared={frightened}
              />
            </group>
          </group>
        ),
      )}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.145, 0.055, 0.15]}>
          <mesh
            scale={[0.092, 0.055, 0.13]}
            material={fabric.material}
            castShadow
          >
            <sphereGeometry args={[1, 28, 16]} />
          </mesh>
          {[-1, 0, 1].map((toe) => (
            <mesh
              key={toe}
              position={[toe * 0.045, -0.006, 0.1]}
              scale={[0.034, 0.035, 0.05]}
              material={fabric.material}
              castShadow
            >
              <sphereGeometry args={[1, 20, 12]} />
            </mesh>
          ))}
        </group>
      ))}
      {pink && <YellowTuft />}
      {bowl &&
        (frightened ? shatter ? <ShatteredHelmet /> : null : <PorcelainBowl />)}
      {frightened && <CryingFace />}
    </group>
  )
}
