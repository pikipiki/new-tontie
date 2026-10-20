import { Group } from 'three'
import { describe, expect, it } from 'vitest'
import modelsManifest from '@reference/models.manifest.json'
import {
  HAMMER_HEAD_HALF_HEIGHT,
  HAMMER_REACH,
  PLAYER_HOVER,
  PLAYER_SHOULDER,
  strikePose,
} from '@game3d/layout3d'
import { showDamageState } from '@game3d/sceneMutations'

function headCentre(hitY: number): [number, number] {
  const { pivot, tilt } = strikePose(hitY)
  return [
    pivot[0] - HAMMER_REACH * Math.cos(tilt),
    pivot[1] - HAMMER_REACH * Math.sin(tilt),
  ]
}

describe('pink Goonk strike pose', () => {
  it('lands the mallet head on the hole centre at the requested height', () => {
    for (const hitY of [0.04, 0.3, 0.75, 0.95]) {
      const [headX, headY] = headCentre(hitY)
      expect(headX).toBeCloseTo(0, 6)
      expect(headY).toBeCloseTo(hitY + HAMMER_HEAD_HALF_HEIGHT + 0.01, 6)
    }
  })

  it('floats above its target and swings down onto it', () => {
    for (const hitY of [0.04, 0.8]) {
      const pose = strikePose(hitY)
      expect(pose.body[1]).toBeCloseTo(hitY + PLAYER_HOVER, 6)
      expect(pose.tilt).toBeGreaterThan(0)
    }
  })

  it('matches the player.glb shoulder written by Blender', () => {
    expect(modelsManifest.props.player.shoulder).toEqual([...PLAYER_SHOULDER])
  })
})

describe('damage-state variants', () => {
  it('shows Intact* before the first hit and Damaged* after', () => {
    const root = new Group()
    const intact = new Group()
    intact.name = 'IntactPose'
    const damaged = new Group()
    damaged.name = 'DamagedBowl'
    const bowl = new Group()
    bowl.name = 'Bowl'
    root.add(intact, damaged, bowl)
    showDamageState(root, false)
    expect([intact.visible, damaged.visible, bowl.visible]).toEqual([
      true,
      false,
      true,
    ])
    showDamageState(root, true)
    expect([intact.visible, damaged.visible, bowl.visible]).toEqual([
      false,
      true,
      true,
    ])
  })
})
