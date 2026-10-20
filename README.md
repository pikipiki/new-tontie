# tontie-re

Faithful local port of [Tontie v1](https://www.eyezmaze.com/game/tontie.html) (EYEZMAZE).

- **Play (default):** **React Three Fiber 3D** scene + TypeScript engine in `src/game/` — no Ruffle, runs with `npm run dev`
- **Reference mode:** add `?ruffle=1` for canonical `tontie.swf` + self-hosted Ruffle (SHA-256 checked at load)
- **Logic source:** ffdec AS (`DefineSprite_459` spawn, `458` stats catalog, `669` combat/items)
- **REA:** SWF not openable in REA; analysis via **ffdec** → `reference/decompiled/` and `reference/game-spec.json`
- **Stack:** Vite, React 19, TypeScript, MUI (shell only), i18next — same family as `automate-videos`

## Contributing

- [CONTRIBUTING.md](CONTRIBUTING.md) — PR process, tests, feature registration
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — layers and extension points
- [docs/OWNERSHIP.md](docs/OWNERSHIP.md) — squad boundaries and review rules
- [docs/DEPLOY-RU.md](docs/DEPLOY-RU.md) — miroir **Yandex Object Storage + CDN** (joueurs en Russie)
- [docs/TUNNEL.md](docs/TUNNEL.md) — tunnel HTTPS privé vers ton `localhost` (test rapide)

## Commands

```bash
npm install
npm run dev
npm test
npm run build
npm run export:assets   # Java + ffdec → public/game/sprites (optional visuals)
blender --background --python scripts/blender/plush_photoreal.py   # photoreal Goonk plushies → reference/plush/goonk-plush.blend + renders
```

Regression: `npm test` — RNG fingerprints + `reference/replays/baseline.json`.

```bash
npm run build:manifest   # reference/reconstruction-manifest.json (REA surfaces)
```

Dev console: `window.tontieReplay({ seed, inputs: [{ frame, hole }] })` replays the native engine.

## Controls (from the original)

- Numpad **1–9** → holes (layout 7-8-9 / 4-5-6 / 1-2-3)
- **0** → pause
- Click the game once so it keeps keyboard focus

## Reference files

| Path | Purpose |
|------|---------|
| `reference/tontie.swf` | Downloaded artifact |
| `reference/game-spec.json` | Timings, bosses, shop, enemy types |
| `reference/reverse-engineering.md` | REA + ffdec notes |
| `reference/decompiled/ffdec/` | Exported ActionScript, shapes, sounds |

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
