# Architecture

Tontie-re is a **single app** with strict layers. Simulation rules must not depend on React, Three.js, MUI or browser audio. The rules below are enforced by `npm run check:architecture` (CI fails on violations).

## Layers

```text
reference/              Flash fidelity (SWF, spec JSON, replays, manifest) — read-only gameplay truth
src/game/               Pure simulation engine (mutable GameState, tick, events) — no browser APIs
src/game/engine/        Engine internals: holes/spawn timer, strike resolution, progression, shared primitives
src/game/features/      Extensible gameplay catalog (shop, items, bosses, enemy builders, round rules)
src/game/adventure/     Adventure layer (missions, swaps, weapons, boss, donut) + content.json
src/audio/              Browser audio: sound banks, buffer cache, Web Audio runtime (public API: index.ts)
src/session/            GameSession (state + FX + injected random/clock/presenter) and dev replay tools
src/config/             Shared tunables in JSON (presentation, runtime loop/audio)
src/game3d/             3D presentation (layout, FX timestamps, theme palette, presenters, R3F scene)
src/fidelity/           SWF manifest: verified loading of the canonical bytes for reference mode
src/components/         MUI overlays and shell (Tontie3D UI, Ruffle player, error boundary)
src/hooks/              React wiring (loop, keyboard, actions)
src/pages/              Page composition (game vs. `?ruffle=1` reference player)
```

### Dependency rules

| From                             | May import                                      | Must not import                                                                            |
| -------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/game/**`                    | `@game/*`, `@reference/*` (data only)           | React, Three, R3F, MUI, `src/audio`, `src/session`, `src/game3d`, components, hooks, pages |
| `src/game3d/**`                  | `@game`, `@game3d/*`, `src/audio`, `src/config` | `src/components/**`                                                                        |
| `src/session/**`                 | `@game`, `@game3d` (FX + presenters)            | components, hooks                                                                          |
| `components` / `hooks` / `pages` | everything above, MUI                           | —                                                                                          |

Additionally the checker requires **zero runtime import cycles** (type-only imports are ignored) and **zero unreachable source files** from the entry points (`main.tsx`, `@game`, `@game3d`, tests).

Public entry points:

- **`@game`** → `src/game/index.ts` (engine API + feature registration)
- **`@game3d`** → `src/game3d/index.ts` (layout, FX, theme, presenters)
- **`src/audio/index.ts`** → sound banks and playback API (test hooks `__test*` are internal and not re-exported)

Inside a layer, import the precise module you need rather than the global features barrel; this keeps the graph acyclic.

## Runtime flow

1. **`GameSession`** (`src/session/GameSession.ts`) holds `state` + `gameFx` and injectable `random` / `clock` / `presenter`. It selects adventure (default) or classic mode.
2. **`useTontieGameLoop`** calls `tick(state, random)` at the engine `FPS`, catching up at most `runtime.json → maxCatchUpMs`.
3. The engine pushes `GameEvent`s; the session drains them into a **`GameEventPresenter`** (`src/game3d/presentation.ts`): the default composite plays audio through `src/audio` and stamps FX timestamps.
4. React reads `state` and `gameFx.clock` for UI and R3F.

The audio buffer cache deduplicates concurrent loads and invalidates callbacks when the `AudioContext` is replaced, so stale effects never play on an old context.

## Modes

- **Adventure** (default) — `src/game/adventure/`, content in `content.json`, described in [adventure-mode.md](adventure-mode.md).
- **Classic** — the faithful Flash rules; the adventure layer is absent from `GameState`.
- **Reference** (`?ruffle=1`) — `src/fidelity/swfManifest.ts` downloads `tontie.swf`, checks size + SHA-256, and passes **those exact bytes** to self-hosted Ruffle with `allowScriptAccess: false`. Errors are shown to the user.

## Feature registry (extension without editing core)

Built-ins register at first `ensureGameFeaturesLoaded()`. Mods call register APIs **once at app startup** (e.g. `main.tsx` after imports).

| API                    | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `registerShopOffer`    | Merchant grid row                                    |
| `registerItemEffect`   | `applyItem` handler                                  |
| `registerShopLevel`    | Open shop after level clear                          |
| `registerBossLevel`    | Boss level → catalog frame                           |
| `registerEnemyBuilder` | Override spawn for a catalog frame                   |
| `registerRoundRule`    | Hook on playing tick (`after-clock` / `after-spawn`) |

Duplicate IDs throw at registration time.

## Configuration

Named, shared parameters are JSON files validated or typed at import: `src/config/presentation.json`, `src/config/runtime.json`, `src/game/adventure/content.json`, plus fidelity data in `reference/game-spec.json`. Per-model geometry coordinates intentionally stay in the model code.

## Fidelity

- Gameplay timings and economy: `reference/game-spec.json` + tests under `src/game/__tests__` and `tests/e2e`.
- `reference/reconstruction-manifest.json` maps Flash surfaces to TypeScript owners. It is generated by `npm run build:manifest` (edit `scripts/build-reconstruction-manifest.mjs`, never the JSON); a test checks that every owner file exists and declares its export.
- Changing spawn/combat/progression without updating replays or fingerprints breaks CI.

## Tests

- **Unit / integration** (Vitest, jsdom): `src/**/__tests__/**/*.test.ts(x)`
- **Engine replays**: `tests/e2e/` — fingerprint smoke, run by Vitest and alone via `npm run test:replay`
- **Browser** (Playwright): `e2e/` — `npm run test:e2e` builds production and serves it on port **5196** (`strictPort`, never reuses an existing server). Covers adventure, classic, keyboard/pause/sound, Ruffle with a real canvas and rejection of an altered SWF, on 390×844, 844×390 and 1280×800. Console errors and CSP violations fail the test. Screenshots and traces go to `artifacts/` (git-ignored). `E2E_BASE_PATH=/tontie-re/` serves the build under a GitHub Pages sub-path.
- **Coverage gate**: 100 % lines, statements, functions and branches on `src/game/**` and `src/audio/**` (`vite.config.ts`).
