# Contributing

Thanks for helping on tontie-re. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/OWNERSHIP.md](docs/OWNERSHIP.md) before opening a PR.

## Prerequisites

```bash
npm install
npm run lint
npm test
npm run test:coverage   # required for src/game changes
npm run build
```

Optional: `npm run sonar` with `.env` (`SONAR_TOKEN`, `SONAR_HOST_URL`).

## Branch and PR process

1. Branch from `main`: `feat/<area>-<short-description>` or `fix/<area>-<issue>`.
2. Keep PRs **focused** (see ownership map — one squad’s surface area when possible).
3. Fill out the [PR template](.github/pull_request_template.md).
4. Ensure CI-equivalent commands pass locally.
5. Request review from CODEOWNERS (auto-assigned on GitHub).

## Where to put code

| Goal | Location |
|------|-----------|
| New shop row / consumable | `registerShopOffer` at app bootstrap; optional row in `src/game/features/shopOffers.ts` if built-in |
| New pickup / takara effect | `registerItemEffect` or `src/game/features/itemEffects.ts` |
| Shop after level N | `registerShopLevel` |
| New boss level | `registerBossLevel` |
| Custom mob from catalog frame | `registerEnemyBuilder` |
| Timer / hurry / side rule on tick | `registerRoundRule` |
| 3D layout / camera | `src/game3d/layout/` |
| HUD / shop UI | `src/components/Tontie3D/` |
| Wire input / session | `src/hooks/` |

**Do not** import MUI or R3F from `src/game/`.

## Registering a mod at startup

Example in `main.tsx` (or a dedicated `src/mods/` module imported once):

```ts
import {
  registerShopOffer,
  registerRoundRule,
} from '@game'

registerShopOffer({
  id: 'mod-myteam-bonus-coins',
  label: 'Bonus coins',
  price: 1,
  apply: (state) => {
    state.money += 50
    return true
  },
})

registerRoundRule({
  id: 'mod-myteam-tick-log',
  phase: 'after-spawn',
  tick: () => {
    /* … */
  },
})
```

Use **prefixed IDs** (`mod-<team>-…`) per [docs/OWNERSHIP.md](docs/OWNERSHIP.md).

## Tests

- Add or update tests in `src/**/__tests__/` next to the code you change.
- Engine behavior: maintain **100% coverage** on `src/game`.
- Replay-sensitive changes: run `npm run test:e2e` and update `reference/replays/baseline.json` only with intentional fidelity changes.

## Style

- Prettier + ESLint (`npm run lint`) — zero warnings.
- Prefer `@game` / `@game3d` aliases over deep relative imports in app code.
- No raw hex in UI/3D — use `@game3d/theme` (`themeColors`).

## Commits

Short imperative subject; body explains **why** when behavior or fidelity changes.

## Questions

Open a discussion or tag the squad from [docs/OWNERSHIP.md](docs/OWNERSHIP.md).
