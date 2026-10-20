import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { fxProgress } from './fx'
import { themeColors as colors } from './theme'

export function ComicWord3D({
  startAt,
  hole,
}: {
  startAt: number
  hole: number
}) {
  const label = useRef<HTMLDivElement>(null)
  useFrame(() => {
    if (!label.current) return
    const phase = fxProgress(startAt, performance.now(), 550)
    label.current.style.opacity =
      phase === null ? '0' : String(Math.min(1, (1 - phase) * 2))
    if (phase === null) return
    const pop = Math.min(1, phase * 7)
    label.current.style.transform = `translateY(${String(-phase * 35)}px) rotate(${String(-12 + phase * 16)}deg) scale(${String(pop * (1 + Math.sin(phase * Math.PI) * 0.2))})`
  })
  return (
    <Html
      position={[0.14, 0.83, 0]}
      center
      zIndexRange={[4, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div
        ref={label}
        aria-hidden
        style={{
          opacity: 0,
          fontWeight: 1000,
          fontStyle: 'italic',
          fontSize: 30,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          color: colors.yellow,
          WebkitTextStroke: `5px ${colors.purpleInk}`,
          paintOrder: 'stroke fill',
          textShadow: `2px 4px 0 ${colors.redPink}`,
        }}
      >
        {hole % 2 ? 'BAM!' : 'POW!'}
      </div>
    </Html>
  )
}
