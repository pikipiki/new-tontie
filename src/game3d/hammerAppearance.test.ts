import { BoxGeometry, Group, Mesh, MeshPhysicalMaterial, Texture } from 'three'
import { describe, expect, it } from 'vitest'
import { createInitialState } from '@/game/engine'
import { buyShopOffer, SHOP_OFFERS } from '@/game/shop'
import { applyHammerAppearance } from './hammerAppearance'

function weapon() {
  const root = new Group()
  const map = new Texture()
  const normal = new Texture()
  const head = new MeshPhysicalMaterial({
    color: '#ed8dbc',
    map,
    normalMap: normal,
    roughness: 0.9,
    sheen: 1,
  })
  const body = new Mesh(new BoxGeometry(), head)
  body.name = 'HeadBody'
  const handle = new MeshPhysicalMaterial({ color: '#8b55dc' })
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
    for (const [id, color] of [
      ['hammer2', '#c27a3a'],
      ['hammer3', '#e9eef5'],
      ['hammer4', '#ffc83a'],
    ]) {
      const index = SHOP_OFFERS.findIndex((offer) => offer.id === id)
      expect(buyShopOffer(state, index)).toBe(true)
      for (const model of [resting, flying]) {
        applyHammerAppearance(model.root, state.hammerLv)
        expect(model.head.color.getHexString()).toBe(color?.slice(1))
        expect(model.head.metalness).toBe(0.85)
        expect(model.head.map).toBeNull()
        expect(model.head.normalMap).toBeNull()
        expect(model.head.sheen).toBe(0)
        expect(model.handle.color.getHexString()).toBe('8b55dc')
      }
    }
  })
  it('restores the original pink fabric when a run resets to level 1', () => {
    const model = weapon()
    applyHammerAppearance(model.root, 4)
    applyHammerAppearance(model.root, 1)
    expect(model.head.map).toBe(model.map)
    expect(model.head.normalMap).toBe(model.normal)
    expect(model.head.color.getHexString()).toBe('ed8dbc')
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
