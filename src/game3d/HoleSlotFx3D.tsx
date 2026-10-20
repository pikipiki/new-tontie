import { ArcadeImpact3D } from './ArcadeImpact3D'
import type { HoleIndex } from '@game/types'
import { Burst3D } from '@game3d/Burst3D'
import { BURSTS } from '@game3d/burstStyles'
import {
  HIT_MS,
  KILL_MS,
  MISS_MS,
  PICKUP_MS,
  SCORE_POP_MS,
  useGameFx,
} from '@game3d/fx'
import { KillPop3D } from '@game3d/KillPop3D'
import { ScorePop3D } from '@game3d/ScorePop3D'
import { catalogFrameGlbKey } from '@game3d/resolveMobGlb'

export function HoleSlotFx3D({
  hole,
  now,
  hitY,
}: {
  hole: HoleIndex
  now: number
  hitY: number
}) {
  const holeFx = useGameFx().holes[hole]
  return (
    <>
      <ArcadeImpact3D hole={hole} now={now} hitY={hitY} />
      {now - holeFx.killAt < KILL_MS && (
        <>
          <KillPop3D
            glbKey={catalogFrameGlbKey(holeFx.killFrame)}
            startAt={holeFx.killAt}
            bomb={holeFx.killBomb}
          />
          <Burst3D
            startAt={holeFx.killAt}
            style={holeFx.killBomb ? BURSTS.bomb : BURSTS.kill}
            position={[0, 0.35, 0]}
          />
        </>
      )}
      {now - holeFx.killAt < SCORE_POP_MS && holeFx.killPoints > 0 && (
        <ScorePop3D key={holeFx.killAt} points={holeFx.killPoints} />
      )}
      {now - holeFx.hitAt < HIT_MS && (
        <Burst3D
          startAt={holeFx.hitAt}
          style={BURSTS.hit}
          position={[0, hitY + 0.05, 0.1]}
        />
      )}
      {now - holeFx.missAt < MISS_MS && (
        <Burst3D
          startAt={holeFx.missAt}
          style={BURSTS.miss}
          position={[0, 0.03, 0]}
        />
      )}
      {now - holeFx.pickupAt < PICKUP_MS && (
        <Burst3D
          startAt={holeFx.pickupAt}
          style={BURSTS.pickup}
          position={[0, 0.2, 0]}
        />
      )}
    </>
  )
}
