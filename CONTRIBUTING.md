# Contributing

Thanks for helping on tontie-re. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/OWNERSHIP.md](docs/OWNERSHIP.md) before opening a PR.

## Prerequisites

- **Node 24+** (see `engines`; CI uses Node 24). Older Node versions can behave differently.
- A Chromium-family browser for Playwright: on macOS the installed Google Chrome is used
  automatically; elsewhere run `npx playwright install --with-deps chromium` or set
  `BROWSER_EXECUTABLE=/path/to/chrome`.

```bash
npm install
```

## Checks to run before a PR

The full chain expected for every change (same as CI):

```bash
npm run check:architecture
npm run format && npx eslint . --max-warnings 0 && npx vitest run && npm run test:e2e
npm run test:coverage
GITHUB_PAGES=true E2E_BASE_PATH=/tontie-re/ npm run test:e2e   # Pages sub-path build
npm audit --audit-level=low
```

- `npm run test:e2e` is **Playwright**: it builds production and serves it on port **5196**
  with `strictPort` and without reusing an existing server, so it never touches your own dev
  server. Artifacts (screenshots, traces, HTML report) go to `artifacts/` (git-ignored).
- `npm run test:replay` runs only the engine replay fingerprints in `tests/e2e/`.
- Do not lower coverage thresholds or disable lint rules to get a green run.

Optional: `npm run sonar` reads `SONAR_TOKEN` / `SONAR_HOST_URL` from `.env` as data (it is not
sourced as a shell script) and passes the token through the environment. It never installs a
scanner implicitly.

## Branch and PR process

1. Branch from `main`: `feat/<area>-<short-description>` or `fix/<area>-<issue>`.
2. Keep PRs **focused** (see ownership map — one squad’s surface area when possible).
3. Fill out the [PR template](.github/pull_request_template.md).
4. Ensure CI-equivalent commands pass locally.
5. Request review from CODEOWNERS (auto-assigned on GitHub).

## Where to put code

| Goal                              | Location                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| New shop row / consumable         | `registerShopOffer` at app bootstrap; optional row in `src/game/features/shopOffers.ts` if built-in |
| New pickup / takara effect        | `registerItemEffect` or `src/game/features/itemEffects.ts`                                          |
| Shop after level N                | `registerShopLevel`                                                                                 |
| New boss level                    | `registerBossLevel`                                                                                 |
| Custom mob from catalog frame     | `registerEnemyBuilder`                                                                              |
| Timer / hurry / side rule on tick | `registerRoundRule`                                                                                 |
| Adventure missions / upgrade text | `src/game/adventure/content.json` (validated by `content.ts`)                                       |
| Shared tunables (quality, audio)  | `src/config/presentation.json`, `src/config/runtime.json`                                           |
| Sound banks / playback            | `src/audio/` (public API `src/audio/index.ts`)                                                      |
| Session (state, presenter wiring) | `src/session/GameSession.ts`                                                                        |
| Event → audio/FX presentation     | `src/game3d/presentation.ts`                                                                        |
| 3D layout / camera                | `src/game3d/layout/`                                                                                |
| HUD / shop UI                     | `src/components/Tontie3D/`                                                                          |
| Wire input / loop                 | `src/hooks/`                                                                                        |

**Do not** import MUI, R3F, React, browser audio or session code from `src/game/`;
`npm run check:architecture` rejects it.

## Registering a mod at startup

Example in `main.tsx` (or a dedicated `src/mods/` module imported once):

```ts
import { registerShopOffer, registerRoundRule } from '@game'

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
- Engine and audio behavior: maintain **100% coverage** on `src/game` and `src/audio`.
- Replay-sensitive changes: run `npm run test:replay` and update `reference/replays/baseline.json` only with intentional fidelity changes.
- UI, rendering or Ruffle changes: run `npm run test:e2e` (browser) and look at the screenshots
  in `artifacts/` when a test fails. Console errors and CSP violations fail the browser tests;
  fix them rather than filtering them.
- Surface ownership changes: edit `scripts/build-reconstruction-manifest.mjs`, then
  `npm run build:manifest` (never hand-edit `reference/reconstruction-manifest.json`).

## Generated files and caches

`.cache/`, `scripts/mesh-pipeline/.venv/`, `.scannerwork/`, `__pycache__`, compiled Python files
and `*.tsbuildinfo` are reproducible exports or local dependencies. They used to be tracked
(≈219 000 files) and were removed **from the Git index only** (`git rm --cached`) and added to
`.gitignore`; local copies were kept on disk and history was not rewritten. Do not re-add them.
`reports/` contains personal review reports and must not be committed by convenience.

## Style

- Prettier + ESLint (`npm run lint`) — zero warnings. `npm run format` covers source, tests,
  E2E, scripts, configs, docs and workflows.
- Readability first: prefer a clear module over a clever abstraction or a micro-optimisation.
- Prefer `@game` / `@game3d` aliases over deep relative imports in app code.
- No raw hex in UI/3D — use `@game3d/theme` (`themeColors`).

## Commits

Short imperative subject; body explains **why** when behavior or fidelity changes.

## Questions

Open a discussion or tag the squad from [docs/OWNERSHIP.md](docs/OWNERSHIP.md).
