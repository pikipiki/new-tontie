import { useGLTF } from '@react-three/drei'

for (let frame = 5; frame <= 24; frame++) {
  useGLTF.preload(`/game/models/mobs/${String(frame)}.glb`)
}
for (const key of ['default', 'treasure', 'shop']) {
  useGLTF.preload(`/game/models/mobs/${key}.glb`)
}
useGLTF.preload('/game/models/board.glb')
useGLTF.preload('/game/models/hammer.glb')
useGLTF.preload('/game/models/player.glb')
