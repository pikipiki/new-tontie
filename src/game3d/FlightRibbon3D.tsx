import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, Vector3, type Group, type InstancedMesh } from 'three'
import { themeColors as colors } from './theme'

const dummy = new Object3D(),
  world = new Vector3()
const gold = new Color(colors.gold),
  pink = new Color(colors.cabinetPink)
export function FlightRibbon3D({
  target,
}: {
  target: RefObject<Group | null>
}) {
  const reduced = useReducedMotion()
  const mesh = useRef<InstancedMesh>(null)
  const trail = useRef(
    Array.from({ length: 28 }, () => ({ position: new Vector3(), age: 10 })),
  )
  const sample = useRef(0)
  useFrame((_, delta) => {
    if (!mesh.current) return
    mesh.current.visible = !reduced
    if (reduced) return
    const body = target.current
    if (body?.parent?.visible) {
      body.getWorldPosition(world)
      const point = trail.current[sample.current % 28]
      if (point) {
        point.position.copy(world)
        point.position.y += 0.25
        point.age = 0
      }
      sample.current += 1
    }
    trail.current.forEach((point, index) => {
      point.age += delta
      const remaining = Math.max(0, 1 - point.age / 0.55)
      dummy.position.copy(point.position)
      dummy.position.y += Math.sin(point.age * 12 + index) * 0.04
      dummy.rotation.set(point.age * 5, index, point.age * 8)
      dummy.scale.setScalar(remaining * (index % 3 ? 0.035 : 0.055))
      dummy.updateMatrix()
      mesh.current?.setMatrixAt(index, dummy.matrix)
      mesh.current?.setColorAt(index, index % 2 ? pink : gold)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor)
      mesh.current.instanceColor.needsUpdate = true
  })
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, 28]}
      frustumCulled={false}
    >
      <octahedronGeometry args={[1]} />
      <meshBasicMaterial
        toneMapped={false}
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
