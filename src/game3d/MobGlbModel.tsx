import { GlbModel } from './GlbModel'

export function MobGlbModel({
  url,
  position,
  tilt = 0,
}: {
  url: string
  position: [number, number, number]
  tilt?: number
}) {
  return <GlbModel url={url} position={position} rotation={[tilt, 0, 0]} />
}
