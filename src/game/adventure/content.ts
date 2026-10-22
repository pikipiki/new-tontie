import content from './content.json'
import type { AdventureRole, MissionKind, UpgradeId } from './types'

interface Mission {
  kind: MissionKind
  title: string
  hint: string
  goal: number
  seconds: number
  icon: string
}
const MISSION_KINDS: readonly string[] = [
  'cake',
  'choir',
  'impostor',
  'helmets',
  'boss',
]
function parseMission(mission: (typeof content.missions)[number]): Mission {
  if (
    !MISSION_KINDS.includes(mission.kind) ||
    !Number.isInteger(mission.goal) ||
    mission.goal <= 0 ||
    !Number.isFinite(mission.seconds) ||
    mission.seconds <= 0
  ) {
    throw new Error(`Invalid mission: ${mission.title}`)
  }
  return { ...mission, kind: mission.kind as MissionKind }
}
export const MISSIONS: readonly Mission[] = content.missions.map(parseMission)
export const MISSION_COUNT = MISSIONS.length
export function missionFor(stage: number): Mission {
  const index = Number.isFinite(stage) ? Math.floor(stage) - 1 : 0
  // Content validation above ensures every configured mission has a playable duration and goal.
  const mission = MISSIONS[Math.min(MISSION_COUNT - 1, Math.max(0, index))]
  if (!mission) throw new Error('Adventure requires at least one mission')
  return mission
}
export const UPGRADES = content.upgrades satisfies Record<
  UpgradeId,
  { title: string; description: string; icon: string }
>
export const ROLE_NAMES = content.roles satisfies Record<AdventureRole, string>
