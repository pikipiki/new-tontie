import { Environment, Lightformer } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import { EdgesGeometry } from 'three'
import { createCrystalHeartGeometry } from './crystalHeartGeometry'
import { CrystalHeart3D } from './CrystalHeart3D'
import { themeColors } from './theme'
import { fitCrystalHeartsCamera } from './crystalHeartAnimation'

function CrystalHeartsScene({ filled }: { filled: number }) {
  const { camera, size, invalidate } = useThree()
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const geometry = useMemo(() => createCrystalHeartGeometry(), [])
  const edges = useMemo(() => new EdgesGeometry(geometry, 8), [geometry])
  useEffect(
    () => () => {
      geometry.dispose()
      edges.dispose()
    },
    [geometry, edges],
  )
  useEffect(() => {
    fitCrystalHeartsCamera(camera, size.width)
    invalidate()
  }, [camera, size.width, invalidate])
  useEffect(() => {
    invalidate()
    if (reducedMotion) return
    // This small HUD renders at 24 fps and sleeps when the page is hidden.
    const timer = window.setInterval(() => {
      if (!document.hidden) invalidate()
    }, 1000 / 24)
    return () => {
      window.clearInterval(timer)
    }
  }, [invalidate, reducedMotion])
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[-3, 4, 5]} intensity={3} />
      <directionalLight
        position={[4, -1, 2]}
        intensity={1.4}
        color={themeColors.redPink}
      />
      <Environment resolution={32} frames={1}>
        <Lightformer position={[-3, 4, 5]} scale={[6, 2, 1]} intensity={5} />
        <Lightformer position={[4, 1, 3]} scale={[1, 5, 1]} intensity={3} />
        <Lightformer
          position={[0, -3, -2]}
          scale={[7, 1, 1]}
          intensity={2}
          color={themeColors.redPink}
        />
      </Environment>
      {Array.from({ length: 6 }, (_, index) => (
        <CrystalHeart3D
          key={index}
          geometry={geometry}
          edges={edges}
          index={index}
          fill={Math.max(0, Math.min(1, filled - index))}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  )
}

/** A transparent orthographic scene confined to the reserved life-meter space. */
export function CrystalHearts3D({ filled }: { filled: number }) {
  return (
    <Canvas
      orthographic
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 12], near: 0.1, far: 30, zoom: 36 }}
      gl={{
        alpha: true,
        antialias: true,
        localClippingEnabled: true,
        powerPreference: 'low-power',
      }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden
    >
      <CrystalHeartsScene filled={filled} />
    </Canvas>
  )
}
