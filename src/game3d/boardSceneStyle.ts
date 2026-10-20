import { themeColors } from '@game3d/theme'
import { useEffect } from 'react'
import { Mesh, MeshStandardMaterial, Object3D } from 'three'

export function useBoardSceneStyle(root: Object3D, bossArena = false) {
  useEffect(() => {
    root.traverse((obj) => {
      if (/^(BackPanel|BackFrame|BackStars|Text_|Mascot)/.test(obj.name))
        obj.visible = false
      if (
        /^(Board|HoleRims|Piping|Bumper|Stars|FrontPlate|PlateStars|PlateTrim)$/.test(
          obj.name,
        )
      )
        obj.visible = !bossArena
      if (!(obj instanceof Mesh)) return
      const materials = Array.isArray(obj.material)
        ? obj.material
        : [obj.material]
      for (const material of materials) {
        if (!(material instanceof MeshStandardMaterial)) continue
        if (/BackPlush/.test(material.name)) material.emissiveIntensity = 0
        if (/Carpet/.test(material.name))
          material.color.set(themeColors.scene.carpet)
        if (/RimPlush|BumperPlush|Cabinet/.test(material.name))
          material.color.set(themeColors.scene.trimPlush)
      }
    })
  }, [root, bossArena])
}
