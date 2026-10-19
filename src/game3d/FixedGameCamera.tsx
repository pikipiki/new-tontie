import { PerspectiveCamera } from '@react-three/drei'

const LOOK_AT: [number, number, number] = [0, 0.22, 0]

/** Fixed framing similar to the original 400×400 playfield (no orbit). */
export function FixedGameCamera() {
  return (
    <PerspectiveCamera
      makeDefault
      position={[0.12, 3.95, 4.55]}
      fov={43}
      near={0.08}
      far={40}
      onUpdate={(cam) => cam.lookAt(...LOOK_AT)}
    />
  )
}
