import { adventureGame } from '@game/adventure/__tests__/helpers'
import { spawnConductor } from '@game/adventure/boss'
import { strikeAnchor, strikeHitY } from '../plushPlayerFlightHelpers'
import { createFx } from '../fx'
import { describe, expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { HOLE_ORDER } from '@game/layout'
import { createBossDeck } from '../bossDeckGeometry'
import { holeWorldPosition } from '../layout3d'
import { plushPopScale, swapArc } from '../adventureMotion'

describe('boss arena geometry and animation', () => {
  it('keeps all nine physical holes open while replacing the carpet', () => {
    const geometry = createBossDeck(),
      material = new MeshBasicMaterial()
    const deck = new Mesh(geometry, material)
    deck.rotation.x = -Math.PI / 2
    deck.updateMatrixWorld(true)
    for (const hole of HOLE_ORDER) {
      const [posX, , posZ] = holeWorldPosition(hole)
      const ray = new Raycaster(
        new Vector3(posX, 5, posZ),
        new Vector3(0, -1, 0),
      )
      expect(ray.intersectObject(deck)).toHaveLength(0)
    }
    const solidRay = new Raycaster(
      new Vector3(1.9, 5, 1.7),
      new Vector3(0, -1, 0),
    )
    expect(solidRay.intersectObject(deck).length).toBeGreaterThan(0)
    geometry.dispose()
    material.dispose()
  })
  it('settles the spring and lands a swap exactly on the new target', () => {
    expect(plushPopScale(2)).toEqual({ width: 1, height: 1 })
    const actor = {
      role: 'prankster' as const,
      age: 51,
      acted: true,
      swapWith: null,
      swappedFrom: 4 as const,
      swapAge: 51,
    }
    expect(swapArc(actor, 3)?.blend).toBe(1)
    expect(swapArc(actor, 3.3)?.lift).toBeGreaterThan(0.5)
    expect(swapArc(actor, 4)).toBeNull()
  })
})

describe('giant boss target alignment', () => {
  it('places the head target in front of the helmet and keeps minion targets on their own holes', () => {
    const { state } = adventureGame(6)
    spawnConductor(state)
    expect(strikeAnchor(state, 8)[2]).toBeCloseTo(
      holeWorldPosition(8)[2] + 0.95,
    )
    expect(strikeHitY(state, createFx(), 8, 0, false)).toBe(2.24)
    expect(strikeAnchor(state, 5)).toEqual(holeWorldPosition(5))
  })
})
