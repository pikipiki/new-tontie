import { Html } from '@react-three/drei'
import { SCORE_POP_MS } from './fx'

/** Yellow felt "+points" lettering that floats up out of the hole after a kill. */
export function ScorePop3D({ points }: { points: number }) {
  return (
    <Html
      position={[0, 0.95, 0]}
      center
      zIndexRange={[4, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div
        aria-hidden
        style={{
          fontFamily: 'inherit',
          fontWeight: 900,
          fontSize: 30,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          color: '#ffd23a',
          WebkitTextStroke: '5px #4b1f8f',
          paintOrder: 'stroke fill',
          textShadow: '0 4px 0 #2a0f55, 0 0 14px rgba(255,140,220,0.65)',
          animation: `tontie-score-pop ${String(SCORE_POP_MS)}ms ease-out forwards`,
        }}
      >
        +{points}
      </div>
    </Html>
  )
}
