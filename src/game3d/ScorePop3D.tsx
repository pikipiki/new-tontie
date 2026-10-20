import { Html } from '@react-three/drei'
import { themeColors } from '@game3d/theme'
import { SCORE_POP_MS } from '@game3d/fx'

const scene = themeColors.scene

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
          color: scene.scoreGold,
          WebkitTextStroke: `5px ${scene.scoreStroke}`,
          paintOrder: 'stroke fill',
          textShadow: `0 4px 0 ${scene.scoreShadow}, 0 0 14px ${scene.scoreGlow}`,
          animation: `tontie-score-pop ${String(SCORE_POP_MS)}ms ease-out forwards`,
        }}
      >
        +{points}
      </div>
    </Html>
  )
}
