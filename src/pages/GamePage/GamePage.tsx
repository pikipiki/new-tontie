import { lazy, Suspense, useMemo } from 'react'

const Tontie3D = lazy(() =>
  import('@components/Tontie3D/Tontie3D').then((module) => ({
    default: module.Tontie3D,
  })),
)

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
  return (
    <Suspense fallback={null}>
      <Tontie3D />
    </Suspense>
  )
}
