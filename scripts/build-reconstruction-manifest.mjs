#!/usr/bin/env node
/** Maps ffdec surfaces → TypeScript owners for REA evaluate_reconstruction_coverage */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const surfaces = [
  {
    surface_id: 'init.frame_25',
    family: 'as2',
    location: 'reference/decompiled/ffdec/scripts/frame_25/DoAction.as',
    owner: 'src/game/engine.ts',
    export: 'createInitialState',
  },
  {
    surface_id: 'spawn.DefineSprite_459',
    family: 'as2',
    location: 'reference/decompiled/ffdec/scripts/DefineSprite_459/frame_1/PlaceObject2_458_1/CLIPACTIONRECORD onClipEvent(load).as',
    owner: 'src/game/spawn.ts',
    export: 'rollSpawnDecision',
  },
  {
    surface_id: 'enemies.DefineSprite_458',
    family: 'as2',
    location: 'reference/decompiled/ffdec/scripts/DefineSprite_458',
    owner: 'src/game/catalog.ts',
    export: 'enemyFromCatalogFrame',
  },
  {
    surface_id: 'combat.DefineSprite_669',
    family: 'as2',
    location: 'reference/decompiled/ffdec/scripts/DefineSprite_669/frame_1/DoAction.as',
    owner: 'src/game/combat.ts',
    export: 'applyItem',
  },
  {
    surface_id: 'difficulty.lv_set',
    family: 'as2',
    location: 'reference/decompiled/ffdec/scripts/frame_141/DoAction.as',
    owner: 'src/game/difficulty.ts',
    export: 'applyLvSet',
  },
  {
    surface_id: 'shop.DefineSprite_607',
    family: 'as2',
    location: 'reference/decompiled/ffdec/scripts/DefineSprite_607/frame_4/DoAction.as',
    owner: 'src/game/shop.ts',
    export: 'SHOP_OFFERS',
  },
  {
    surface_id: 'loop.spawn_timer',
    family: 'as2',
    location: 'reference/decompiled/ffdec/scripts/frame_41/PlaceObject2_560_182/CLIPACTIONRECORD onClipEvent(enterFrame).as',
    owner: 'src/game/engine.ts',
    export: 'trySpawn',
  },
  {
    surface_id: 'render.board',
    family: 'visual',
    location: 'DefineSprite_559 frame 141',
    owner: 'src/game3d/TontieScene3D.tsx',
    export: 'TontieScene3D',
  },
  {
    surface_id: 'audio.sound_banks',
    family: 'as2',
    location: 'DefineSprite_65 (sound) + DefineSprite_71 (sound2)',
    owner: 'src/game/audio.ts',
    export: 'SOUND_BANK',
  },
]

const manifest = {
  artifact: 'reference/tontie.swf',
  gameSpec: 'reference/game-spec.json',
  boundary: 'native-typescript-webgl',
  surfaces,
  nonGoals: [
    { id: 'timeline.cinematics', reason: '749 AS timeline scripts — animations served by board sprite + simplified mole motion' },
    { id: 'cheats.pass1-4', reason: 'Easter egg start codes; optional future title screen' },
  ],
}

const out = path.join(root, 'reference/reconstruction-manifest.json')
fs.writeFileSync(out, JSON.stringify(manifest, null, 2))
console.log(`Wrote ${surfaces.length} surfaces → ${out}`)
