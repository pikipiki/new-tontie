# tontie-re

Faithful local port of [Tontie v1](https://www.eyezmaze.com/game/tontie.html) (EYEZMAZE).

- **Play (default):** native **Canvas 2D + TypeScript** engine in `src/game/` — no Ruffle, runs with `npm run dev`
- **Reference mode:** add `?ruffle=1` for canonical `tontie.swf` + self-hosted Ruffle (SHA-256 checked at load)
- **Logic source:** ffdec AS (`DefineSprite_459` spawn, `458` stats catalog, `669` combat/items)
- **REA:** SWF not openable in REA; analysis via **ffdec** → `reference/decompiled/` and `reference/game-spec.json`
- **Stack:** Vite, React 19, TypeScript, MUI (shell only), i18next — same family as `automate-videos`

## Commands

```bash
npm install
npm run dev
npm test
npm run build
npm run export:assets   # Java + ffdec → public/game/sprites (optional visuals)
```

Regression: `npm test` (15 tests) — RNG fingerprints + `reference/replays/baseline.json`.

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
