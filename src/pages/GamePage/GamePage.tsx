import { lazy, Suspense, useMemo } from 'react'
import { Tontie3D } from '@components/Tontie3D/Tontie3D'

const TontiePlayer = lazy(() =>
  import('@components/TontiePlayer/TontiePlayer').then((module) => ({
    default: module.TontiePlayer,
  })),
)

/** Game only. `?ruffle=1` keeps the original SWF reachable for side-by-side fidelity checks. */
export function GamePage() {
  const ruffle = useMemo(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('ruffle') === '1',
    [],
  )

  if (ruffle) {
    return (
      <Suspense fallback={null}>
        <TontiePlayer />
      </Suspense>
    )
  }
  return <Tontie3D />
}
