import { themeColors } from '@/components/Tontie3D/theme'
import { BoxGeometry, Group, Mesh, MeshPhysicalMaterial, Texture } from 'three'
import { describe, expect, it } from 'vitest'
import { createInitialState } from '@game/engine'
import { buyShopOffer, SHOP_OFFERS } from '@game/shop'
import { applyHammerAppearance } from '@game3d/hammerAppearance'

function weapon() {
  const root = new Group()
  const map = new Texture()
  const normal = new Texture()
  const head = new MeshPhysicalMaterial({
    color: themeColors.hammerTestHead,
    map,
    normalMap: normal,
    roughness: 0.9,
    sheen: 1,
  })
  const body = new Mesh(new BoxGeometry(), head)
  body.name = 'HeadBody'
  const handle = new MeshPhysicalMaterial({
    color: themeColors.hammerTestHandle,
  })
  const grip = new Mesh(new BoxGeometry(), handle)
  grip.name = 'Handle'
  root.add(body, grip)
  return { root, head, handle, map, normal }
}

describe('equipped hammer appearance', () => {
  it('turns actual shop purchases into bronze, silver, then gold heads', () => {
    const state = createInitialState()
    state.money = 9999
    const resting = weapon(),
      flying = weapon()
    for (const [offerId, color] of [
      ['hammer2', themeColors.hammerMetal[2]],
      ['hammer3', themeColors.hammerMetal[3]],
      ['hammer4', themeColors.hammerMetal[4]],
    ]) {
      const index = SHOP_OFFERS.findIndex((offer) => offer.id === offerId)
      expect(buyShopOffer(state, index)).toBe(true)
      for (const model of [resting, flying]) {
        applyHammerAppearance(model.root, state.hammerLv)
        expect(model.head.color.getHexString()).toBe(color?.slice(1))
        expect(model.head.metalness).toBe(0.85)
        expect(model.head.map).toBeNull()
        expect(model.head.normalMap).toBeNull()
        expect(model.head.sheen).toBe(0)
        expect(model.handle.color.getHexString()).toBe(
          themeColors.hammerTestHandle.slice(1),
        )
      }
    }
  })
  it('restores the original pink fabric when a run resets to level 1', () => {
    const model = weapon()
    applyHammerAppearance(model.root, 4)
    applyHammerAppearance(model.root, 1)
    expect(model.head.map).toBe(model.map)
    expect(model.head.normalMap).toBe(model.normal)
    expect(model.head.color.getHexString()).toBe(
      themeColors.hammerTestHead.slice(1),
    )
    expect(model.head.metalness).toBe(0)
    expect(model.head.sheen).toBe(1)
  })
  it('keeps healing purchases from changing the equipped weapon', () => {
    const state = createInitialState()
    state.money = 9999
    const model = weapon()
    buyShopOffer(
      state,
      SHOP_OFFERS.findIndex((offer) => offer.id === 'heart1'),
    )
    applyHammerAppearance(model.root, state.hammerLv)
    expect(state.hammerLv).toBe(1)
    expect(model.head.map).toBe(model.map)
  })
})
