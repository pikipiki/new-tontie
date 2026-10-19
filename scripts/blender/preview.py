"""
Contact sheet of exported mob GLBs (front 3/4 view, like the game camera) for visual checks.

  blender --background --python scripts/blender/preview.py -- 5 6 22
Writes .cache/mob-preview/<key>.png
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy  # type: ignore
from mathutils import Vector  # type: ignore

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / ".cache/mob-preview"


def render(key: str) -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(ROOT / f"public/game/models/mobs/{key}.glb"))
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = scene.render.resolution_y = 360
    scene.render.film_transparent = True
    world = bpy.data.worlds.new("W")
    world.color = (0.35, 0.5, 0.8)
    scene.world = world

    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 70
    cam = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    target = Vector((0, 0, 0.33))
    cam.location = target + Vector((0.0, -2.2, 1.35))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()

    sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
    sun.data.energy = 3.5
    sun.rotation_euler = (math.radians(50), 0, math.radians(-25))
    scene.collection.objects.link(sun)
    fill = bpy.data.objects.new("Fill", bpy.data.lights.new("Fill", "SUN"))
    fill.data.energy = 1.2
    fill.rotation_euler = (math.radians(70), 0, math.radians(140))
    scene.collection.objects.link(fill)

    OUT.mkdir(parents=True, exist_ok=True)
    scene.render.filepath = str(OUT / f"{key}.png")
    bpy.ops.render.render(write_still=True)


keys = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else ["5"]
for k in keys:
    render(k)
