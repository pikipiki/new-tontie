"""
Contact sheet of exported mob GLBs (front 3/4 view, like the game camera) for visual checks.

  blender --background --python scripts/blender/preview.py -- 5 6 6:damaged ../player ../hammer
Writes .cache/mob-preview/<key>.png. A ":damaged" suffix shows the Damaged* nodes instead of Intact*.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy  # type: ignore
from mathutils import Vector  # type: ignore

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / ".cache/mob-preview"


def hide_tree(obj, hidden: bool) -> None:
    obj.hide_render = hidden
    for c in obj.children:
        hide_tree(c, hidden)


def render(spec: str) -> None:
    key, _, state = spec.partition(":")
    damaged = state == "damaged"
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(ROOT / f"public/game/models/mobs/{key}.glb"))
    for o in list(bpy.data.objects):
        if o.name.startswith("Damaged" if not damaged else "Intact"):
            hide_tree(o, True)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = scene.render.resolution_y = 420
    scene.render.film_transparent = True
    world = bpy.data.worlds.new("W")
    world.color = (0.35, 0.5, 0.8)
    scene.world = world

    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for o in meshes:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
    size = max((hi - lo).x, (hi - lo).z, 0.3)

    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 70
    cam = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    target = (lo + hi) / 2
    cam.location = target + Vector((0.0, -2.2, 1.0)) * (size / 0.8)
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
    name = spec.replace("../", "").replace(":", "-")
    scene.render.filepath = str(OUT / f"{name}.png")
    bpy.ops.render.render(write_still=True)


keys = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else ["5"]
for k in keys:
    render(k)
