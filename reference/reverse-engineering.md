# Tontie v1 — reverse engineering (REA + ffdec)

**Source:** [EYEZMAZE — Tontie (GAME)](https://www.eyezmaze.com/game/tontie.html)  
**Binary:** `reference/tontie.swf` (Flash 6, zlib, 400×400 @ 17 FPS)

## REA

| Step | Result |
|------|--------|
| `open_binary` on `tontie.swf` | **Rejected** — unsupported binary format (Flash SWF) |
| `evaluate_reconstruction_coverage` | Use `reference/reconstruction-manifest.json` (owners TS ↔ surfaces ffdec) |

REA ne décompile pas le SWF ; **JPEXS ffdec** → `reference/decompiled/ffdec/`.

## Jeu livré (sans Ruffle par défaut)

| Couche | Implémentation |
|--------|----------------|
| Logique | `src/game/*` porté depuis AS2 (spawn 459, catalog 458, combat 669, shop 607, lv_set) |
| Graphismes | `public/game/sprites/` (board 559:141, mobs 692, trous 583) + `reference/sprites.manifest.json` |
| Audio | `public/game/sounds/` + `src/game/audio.ts` |
| Parité | `src/game/rng.ts`, `reference/replays/baseline.json`, Vitest fingerprints |
| Référence SWF | `?ruffle=1` + `npm run sync:swf` |

```bash
npm run dev
npm test
npm run build:catalog
npm run build:manifest
npm run export:assets   # Java 21 + ffdec
```

## Périmètre « 100 % » honnête

| Inclus | Exclu (non-objectif) |
|--------|----------------------|
| Boucle 17 FPS, 9 trous, spawn, shop, boss 10/20, items takara, shop, marteaux, gun, wing, stone, difficulté | 749 scripts **timeline** (ciné, transitions frame à frame) |
| Constantes `game-spec.json` | Easter eggs `pass1–4` (codes dans `frame_20/DoAction.as`) |
| Sprites ffdec clés | Chaque sous-movieclip animé à la frame près |

**Validation :** comparer `npm run dev` vs `?ruffle=1` ; rejouer `reference/replays/baseline.json` ; console dev `window.tontieReplay(script)`.

**Artefact canonique :** SHA-256 `2b91801d763ff6c1fdf52d461849e11e4c3fa31a9dd6aea3b836f4dfff9f8193`
