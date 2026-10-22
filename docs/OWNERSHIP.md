# Ownership map

Use this map for **reviews and squad boundaries**. GitHub auto-requests reviewers via [`.github/CODEOWNERS`](../.github/CODEOWNERS).

Replace `@pikipiki` in CODEOWNERS with your org teams when they exist, e.g. `@your-org/tontie-engine`.

## Squads (recommended)

| Squad        | Scope                                                 | Paths                                                                                          |
| ------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Engine**   | Simulation, features, combat, shop logic, adventure   | `src/game/**`, `tests/e2e/**`                                                                  |
| **Audio**    | Sound banks, buffer cache, Web Audio runtime          | `src/audio/**`, `src/config/runtime.json` (audio section)                                      |
| **3D**       | R3F scene, GLB, layout, FX state, presenters, theme   | `src/game3d/**`, `src/config/presentation.json`                                                |
| **UI**       | MUI panels, HUD, hooks, pages, session wiring         | `src/components/**`, `src/hooks/**`, `src/pages/**`, `src/session/**`, `src/constants/**`      |
| **Fidelity** | SWF spec, replays, catalog JSON, verified SWF loading | `reference/**`, `src/fidelity/**` (coordinate with Engine for `game-spec.json`)                |
| **Platform** | Tooling, CI, lint, Vite, Playwright, Sonar, security  | `vite.config.ts`, `scripts/**`, `e2e/**`, `playwright.config.mjs`, `.github/**`, `SECURITY.md` |

## Cross-cutting changes

| Change type                              | Required reviewers                                          |
| ---------------------------------------- | ----------------------------------------------------------- |
| `GameState` / `GameEvent` in `types.ts`  | Engine + (UI or 3D if new event fields affect presentation) |
| `reference/game-spec.json`               | Fidelity + Engine                                           |
| `reference/replays/baseline.json`        | Fidelity + Engine                                           |
| New `register*` feature API              | Engine                                                      |
| `themeColors` / HUD copy                 | UI + 3D if 3D uses new tokens                               |
| `src/game/adventure/content.json`        | Engine (+ UI when panel texts change)                       |
| CSP (`scripts/vite/security.mjs`)        | Platform + Fidelity (Ruffle needs WASM/blob)                |
| `reference/reconstruction-manifest.json` | Fidelity (regenerate with `npm run build:manifest`)         |

## Extension ID conventions (avoid registry collisions)

Prefix mod IDs with a **stable squad or plugin slug**:

- Shop offers: `mod-<slug>-<name>` (e.g. `mod-events-mega-heart`)
- Enemy builders: `mod-<slug>-<name>`
- Round rules: `mod-<slug>-<name>`
- Item effects: prefer existing `ItemId` when faithful; for new items, coordinate an `ItemId` union change in Engine PR

Do not register the same `id` twice; registration throws at startup.

## When to split a PR

- Engine-only feature registration + tests → Engine squad
- Visual-only (materials, mesh, camera) → 3D squad
- Overlay layout/strings → UI squad
- Avoid mixing Engine + large 3D scene refactors in one PR
