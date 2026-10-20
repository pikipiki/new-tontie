# Architecture

Tontie-re is a **single app** with strict layers. Simulation rules must not depend on React, Three.js, or MUI.

## Layers

```text
reference/          Flash fidelity (spec JSON, replays, SWF) — read-only for gameplay truth
src/game/           Simulation engine (mutable GameState, tick, events)
src/game/features/  Extensible gameplay catalog (shop, items, bosses, round rules)
src/game3d/         3D presentation (layout, FX timestamps, theme palette, R3F)
src/components/     MUI overlays and shell (Tontie3D UI)
src/hooks/          React wiring (session, loop, keyboard)
```

### Dependency rules

| From | May import | Must not import |
|------|------------|-----------------|
| `@game` | `@game/*`, `@reference/*` (data only) | `@game3d`, `@/components`, React |
| `@game3d` | `@game`, `@game3d/*` | `@/components` (except re-exports avoided in 3D) |
| `components` / `hooks` | `@game`, `@game3d`, MUI | — |

Public entry points:

- **`@game`** → `src/game/index.ts` (engine API + feature registration)
- **`@game3d`** → `src/game3d/index.ts` (layout, FX, theme, presenters)

## Runtime flow

1. **`GameSession`** holds `state` + `gameFx` + injectable `random` / `clock` / `presenter`.
2. **`useTontieGameLoop`** calls `tick(state, random)` at `FPS`.
3. **`flush`** drains `state.events` → **`GameEventPresenter`** (audio + FX by default).
4. React reads `state` and `gameFx.clock` for UI and R3F.

## Feature registry (extension without editing core)

Built-ins register at first `ensureGameFeaturesLoaded()`. Mods call register APIs **once at app startup** (e.g. `main.tsx` after imports).

| API | Purpose |
|-----|---------|
| `registerShopOffer` | Merchant grid row |
| `registerItemEffect` | `applyItem` handler |
| `registerShopLevel` | Open shop after level clear |
| `registerBossLevel` | Boss level → catalog frame |
| `registerEnemyBuilder` | Override spawn for a catalog frame |
| `registerRoundRule` | Hook on playing tick (`after-clock` / `after-spawn`) |

Duplicate IDs throw at registration time.

## Fidelity

- Gameplay timings and economy: `reference/game-spec.json` + tests under `src/game/__tests__` and `tests/e2e`.
- Changing spawn/combat/progression without updating replays or fingerprints breaks CI.

## Tests

- **Unit**: `src/**/__tests__/**/*.test.ts`
- **E2E (engine)**: `tests/e2e/` — replay fingerprint smoke
- **Coverage gate**: `src/game/**/*.ts` (100% thresholds in `vite.config.ts`)
