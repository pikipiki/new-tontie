import { useGLTF } from '@react-three/drei'
import { publicUrl } from '@constants/publicUrl'

for (let frame = 5; frame <= 24; frame++) {
  useGLTF.preload(publicUrl(`game/models/mobs/${String(frame)}.glb`))
}
for (const key of ['default', 'treasure', 'shop']) {
  useGLTF.preload(publicUrl(`game/models/mobs/${key}.glb`))
}
useGLTF.preload(publicUrl('game/models/board.glb'))
useGLTF.preload(publicUrl('game/models/hammer.glb'))
useGLTF.preload(publicUrl('game/models/player.glb'))
