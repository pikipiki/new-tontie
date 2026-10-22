# tontie-re

Faithful local port of [Tontie v1](https://www.eyezmaze.com/game/tontie.html) (EYEZMAZE).

- **Adventure (default):** six-mission _Paingpaing’s Adventure_ rendered with **React Three Fiber**
  on top of the pure TypeScript engine in `src/game/` — see [docs/adventure-mode.md](docs/adventure-mode.md)
- **Classic:** faithful Flash rules (same engine, no adventure layer), selectable from the welcome
  screen and the end-of-run panel
- **Reference mode:** add `?ruffle=1` to play the canonical `tontie.swf` with self-hosted Ruffle.
  The SWF bytes are size- and SHA-256-checked, then handed to Ruffle directly (no second download,
  `allowScriptAccess: false`)
- **Logic source:** ffdec AS (`DefineSprite_459` spawn, `458` stats catalog, `669` combat/items)
- **REA:** SWF not openable in REA; analysis via **ffdec** → `reference/decompiled/` and `reference/game-spec.json`
- **Stack:** Vite, React 19, TypeScript, MUI (shell only), i18next — same family as `automate-videos`

## Contributing

- [CONTRIBUTING.md](CONTRIBUTING.md) — setup, PR process, tests, feature registration
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — layers, dependency rules and extension points
- [docs/OWNERSHIP.md](docs/OWNERSHIP.md) — squad boundaries and review rules
- [docs/DEPLOY-FREE.md](docs/DEPLOY-FREE.md) — GitHub Pages, Netlify, itch.io
- [SECURITY.md](SECURITY.md) — threat model, protections in place and how to report an issue

## Commands

Requires **Node 24+** (`engines` in `package.json`; CI uses Node 24).

```bash
npm install
npx playwright install chromium   # once, for browser tests (macOS uses installed Chrome if present)
npm run dev
npm run build
```

| Command                      | What it checks                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `npm test`                   | Vitest unit/integration suite (engine, audio, session, 3D helpers, UI)           |
| `npm run test:coverage`      | Same suite with the **100 %** gate on `src/game` and `src/audio`                 |
| `npm run test:replay`        | Engine replay fingerprints only (`tests/e2e`, `reference/replays/baseline.json`) |
| `npm run test:e2e`           | **Playwright** in a real browser: builds production, serves it on port 5196      |
| `npm run check:architecture` | Unreachable files, runtime import cycles and forbidden layer dependencies        |
| `npm run lint`               | Prettier check + ESLint with zero warnings                                       |
| `npm run test:all`           | Architecture, lint, tests, coverage and Playwright in sequence                   |

Optional asset tooling:

```bash
npm run export:assets   # Java + ffdec → public/game/sprites (optional visuals)
npm run build:manifest  # reference/reconstruction-manifest.json (REA surfaces)
blender --background --python scripts/blender/plush_photoreal.py   # photoreal Goonk plushies → reference/plush/goonk-plush.blend + renders
```

Dev console (development builds only): `window.tontieReplay({ seed, inputs: [{ frame, hole }] })`
replays the native engine. It is never installed in production builds.

## Tunable settings

Shared, named parameters live in JSON so they can be adjusted without touching code:

| File                              | Contents                                                                   |
| --------------------------------- | -------------------------------------------------------------------------- |
| `src/config/presentation.json`    | Render quality (DPR, antialias), camera framing, plush mesh density, FX ms |
| `src/config/runtime.json`         | Game-loop catch-up limit and audio mixing gains/ramps                      |
| `src/game/adventure/content.json` | Adventure missions, upgrade texts and role names (validated at load)       |
| `reference/game-spec.json`        | Flash-derived timings, bosses, shop and enemy data (fidelity source)       |

Model-specific vertex coordinates stay in their model files on purpose.

## Controls (from the original)

- Numpad **1–9** → holes (layout 7-8-9 / 4-5-6 / 1-2-3)
- **0** → pause
- Click the game once so it keeps keyboard focus

## Reference files

| Path                               | Purpose                               |
| ---------------------------------- | ------------------------------------- |
| `reference/tontie.swf`             | Downloaded artifact                   |
| `reference/game-spec.json`         | Timings, bosses, shop, enemy types    |
| `reference/reverse-engineering.md` | REA + ffdec notes                     |
| `reference/decompiled/ffdec/`      | Exported ActionScript, shapes, sounds |

## Plush arcade scene

The default view uses a centred, raised camera so all nine targets remain separate on phones.
The pink plush hovers at the front ledge when idle, flies above the tapped violet with its held
mallet, then returns. Tapping another target redirects the flight from its current position.
Open `?scene=1` for the three-quarter reference composition with the full plush cast, the pink
player, ceramic bowls and the 28 / 350 / 800 demonstration scoreboard.

`src/game3d/PlushGoonk3D.tsx` builds the photo-derived violet and pink plushies as real 3D
geometry: a single sewn body, flat oval eyes, a curved fabric nose, padded hands and feet,
velour pile and stitches. On its first hit, the bowl variant survives, its helmet bursts into eight flying shards,
and it raises its hands, opens its frightened eyes and mouth, and sheds animated tears.
The cabinet title is “Paingpaing's game” with TIME / SCORE / HIGH SCORE labels.
No generated picture is used as a substitute for the interactive 3D scene. Other catalogue
enemies and props keep their existing GLB models. `cameraComposition.test.ts` checks phone,
tablet and desktop framing, target spacing, and separation from the pink companion.

The welcome cast is interactive: tap a helmeted plush to preview the flight, shattered helmet
and crying reaction without reaching level 2. The same reaction is connected to the real
engine HP and extra-hit shield state in gameplay. `plushAnimation.test.ts` checks the flight,
mallet alignment and the complete first-hit / second-hit helmet sequence.
