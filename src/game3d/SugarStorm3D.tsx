import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, type InstancedMesh, type Group } from 'three'
import type { GameState } from '@game/types'
import { BOARD_SURFACE_Y } from './layout3d'
import { themeColors as colors } from './theme'

const dummy = new Object3D()
const palette = [
  colors.gold,
  colors.cabinetPink,
  colors.hudAccentCyan,
  colors.white,
].map((color) => new Color(color))
/** One draw call for a spiralling sugar storm; the centre remains clear for tapping. */
export function SugarStorm3D({ state }: { state: GameState }) {
  const reduced = useReducedMotion()
  const particles = useRef<InstancedMesh>(null),
    rings = useRef<Group>(null)
  useFrame(({ clock }) => {
    const mesh = particles.current
    if (!mesh || !rings.current) return
    const active = Boolean(
      state.adventure &&
      state.adventure.frenzyFrames > 0 &&
      state.phase === 'playing',
    )
    mesh.visible = active && !reduced
    rings.current.visible = active
    if (!active || state.phase === 'paused' || reduced) return
    const time = clock.elapsedTime
    rings.current.rotation.y = time * 0.8
    rings.current.scale.setScalar(1 + Math.sin(time * 5) * 0.035)
    for (let index = 0; index < 64; index += 1) {
      const phase = (time * 0.6 + index / 64) % 1
      const angle = index * 2.399 + time * (index % 2 ? 1.4 : -1.1)
      const radius = 1.8 + Math.sin(index * 3) * 0.35
      dummy.position.set(
        Math.cos(angle) * radius,
        BOARD_SURFACE_Y + phase * 1.7,
        Math.sin(angle) * radius * 0.8 + 0.15,
      )
      dummy.rotation.set(time * 2 + index, angle, phase * 4)
      dummy.scale.setScalar(
        (0.024 + (index % 3) * 0.009) * Math.sin(phase * Math.PI),
      )
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
      mesh.setColorAt(
        index,
        palette[index % palette.length] ?? palette[0] ?? new Color(colors.gold),
      )
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })
  return (
    <group>
      <instancedMesh
        ref={particles}
        args={[undefined, undefined, 64]}
        frustumCulled={false}
        visible={false}
      >
        <octahedronGeometry args={[1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <group
        ref={rings}
        position={[0, BOARD_SURFACE_Y + 0.06, 0.15]}
        visible={false}
      >
        {[0, 1].map((index) => (
          <mesh key={index} rotation={[-Math.PI / 2, 0, index * Math.PI]}>
            <torusGeometry
              args={[2 + index * 0.12, 0.018, 8, 72, Math.PI * 0.8]}
            />
            <meshBasicMaterial
              color={index ? colors.cabinetPink : colors.hudAccentCyan}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
