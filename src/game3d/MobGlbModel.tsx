import { GlbModel } from './GlbModel'

export function MobGlbModel({
  url,
  height,
  position,
}: {
  url: string
  height: number
  position: [number, number, number]
}) {
  return <GlbModel url={url} position={position} scale={[height, height, height]} />
}
