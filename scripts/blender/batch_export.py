"""
Sprite → volumetric GLB (Blender 5+). Real depth on Y-up characters.

  npm run mesh:blender
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

try:
    import bpy  # type: ignore
except ImportError:
    print("Run with Blender's Python.", file=sys.stderr)
    raise SystemExit(1)

ROOT = Path(__file__).resolve().parents[2]
SPRITES = ROOT / "public/game/sprites/mobs"
HAMMER_SPRITE = ROOT / "public/game/sprites/hammer/01.png"
BOARD_SPRITE = ROOT / "public/game/sprites/board-gameplay-clean.png"
OUT_MOBS = ROOT / "public/game/models/mobs"
OUT_MODELS = ROOT / "public/game/models"
MANIFEST = ROOT / "reference/models.manifest.json"

# After normalize to height=1, extrusion depth in glTF units (~0.74 in game)
MOB_DEPTH = 0.38
HAMMER_DEPTH = 0.22
BOARD_THICK = 0.32
TARGET_MOB_HEIGHT = 1.0
BOARD_WORLD = 4.2


def clear_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def fix_front_material(mat: bpy.types.Material) -> None:
    mat.use_nodes = True
    mat.blend_method = "CLIP"
    if hasattr(mat, "shadow_method"):
        mat.shadow_method = "CLIP"
    mat.alpha_threshold = 0.4
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf is not None:
        bsdf.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.78


def side_material(name: str = "Side") -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.22, 0.17, 0.14, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.96
    return mat


def import_sprite_plane(image_path: Path) -> bpy.types.Object:
    bpy.ops.image.import_as_mesh_planes(
        files=[{"name": image_path.name}],
        directory=str(image_path.parent) + os.sep,
        relative=False,
    )
    obj = bpy.context.active_object
    for slot in obj.material_slots:
        if slot.material:
            fix_front_material(slot.material)
    return obj


def stand_vertical_for_gltf(obj: bpy.types.Object) -> None:
    obj.rotation_euler = (1.57079632679, 0.0, 0.0)
    bpy.ops.object.transform_apply(rotation=True)


def normalize_height(obj: bpy.types.Object, target: float) -> None:
    h = obj.dimensions.y
    if h < 1e-6:
        h = max(obj.dimensions)
    scale = target / h
    obj.scale = (obj.scale.x * scale, obj.scale.y * scale, obj.scale.z * scale)
    bpy.ops.object.transform_apply(scale=True)


def volumize_sprite(obj: bpy.types.Object, depth: float) -> None:
    """Solidify with rim material so side faces read as real thickness."""
    if len(obj.data.materials) == 0:
        obj.data.materials.append(bpy.data.materials.new("Front"))
    if len(obj.data.materials) == 1:
        obj.data.materials.append(side_material("ExtrudeSide"))

    mod = obj.modifiers.new(name="Solidify", type="SOLIDIFY")
    mod.thickness = depth
    mod.offset = 1.0
    if hasattr(mod, "use_rim"):
        mod.use_rim = True
    if hasattr(mod, "rim_material_offset"):
        mod.rim_material_offset = 1
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)

    bevel = obj.modifiers.new(name="Bevel", type="BEVEL")
    bevel.width = min(depth * 0.1, 0.035)
    bevel.segments = 2
    try:
        bpy.ops.object.modifier_apply(modifier=bevel.name)
    except RuntimeError:
        obj.modifiers.remove(bevel)

    bpy.ops.object.shade_smooth()
    if hasattr(obj.data, "use_auto_smooth"):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = 0.785398


def center_feet_on_ground(obj: bpy.types.Object) -> None:
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    obj.location = (0.0, 0.0, 0.0)
    bpy.ops.object.transform_apply(location=True)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    min_y = min((obj.matrix_world @ v.co).y for v in obj.data.vertices)
    obj.location.y -= min_y
    bpy.ops.object.transform_apply(location=True)


def export_glb(obj: bpy.types.Object, out_path: Path) -> dict:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=str(out_path),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
    )
    return {
        "glb": str(out_path.relative_to(ROOT)),
        "vertices": len(obj.data.vertices),
        "faces": len(obj.data.polygons),
    }


def export_sprite_glb(image_path: Path, out_path: Path, depth: float, height: float) -> dict:
    clear_scene()
    obj = import_sprite_plane(image_path)
    stand_vertical_for_gltf(obj)
    normalize_height(obj, height)
    volumize_sprite(obj, depth)
    center_feet_on_ground(obj)
    info = export_glb(obj, out_path)
    info["source"] = str(image_path.relative_to(ROOT))
    info["depth"] = depth
    return info


def export_board() -> dict:
    clear_scene()
    if not BOARD_SPRITE.exists():
        raise FileNotFoundError(BOARD_SPRITE)
    obj = import_sprite_plane(BOARD_SPRITE)
    # Horizontal playfield in glTF Y-up (XZ plane, thickness on Y).
    obj.rotation_euler = (0.0, 0.0, 0.0)
    bpy.ops.object.transform_apply(rotation=True)
    w = obj.dimensions.x
    if w > 1e-6:
        s = BOARD_WORLD / w
        obj.scale = (s, s, s)
        bpy.ops.object.transform_apply(scale=True)
    volumize_sprite(obj, BOARD_THICK)
    center_feet_on_ground(obj)
    out = OUT_MODELS / "board.glb"
    info = export_glb(obj, out)
    info["source"] = str(BOARD_SPRITE.relative_to(ROOT))
    return info


def export_hole() -> dict:
    clear_scene()
    bpy.ops.mesh.primitive_cylinder_add(radius=0.11, depth=0.26, location=(0.0, -0.13, 0.0), vertices=24)
    pit = bpy.context.active_object
    pit_mat = bpy.data.materials.new("Pit")
    pit_mat.use_nodes = True
    pit_mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.08, 0.05, 0.04, 1.0)
    pit.data.materials.append(pit_mat)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.14, minor_radius=0.025, location=(0.0, 0.0, 0.0), major_segments=24)
    rim = bpy.context.active_object
    rim_mat = bpy.data.materials.new("Rim")
    rim_mat.use_nodes = True
    rim_mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.32, 0.22, 0.16, 1.0)
    rim.data.materials.append(rim_mat)

    bpy.ops.object.select_all(action="DESELECT")
    pit.select_set(True)
    rim.select_set(True)
    bpy.context.view_layer.objects.active = pit
    bpy.ops.object.join()
    out = OUT_MODELS / "hole.glb"
    info = export_glb(bpy.context.active_object, out)
    info["source"] = "procedural/blender"
    return info


def export_hammer() -> dict:
    if not HAMMER_SPRITE.exists():
        raise FileNotFoundError(HAMMER_SPRITE)
    return export_sprite_glb(HAMMER_SPRITE, OUT_MODELS / "hammer.glb", HAMMER_DEPTH, 0.95)


def mob_targets() -> list[tuple[str, Path]]:
    targets: list[tuple[str, Path]] = []
    for frame in range(5, 25):
        p = SPRITES / f"{frame}.png"
        if p.exists():
            targets.append((str(frame), p))
    for name in ("shop", "treasure"):
        p = SPRITES / f"{name}.png"
        if p.exists() and p.stat().st_size > 400:
            targets.append((name, p))
    mob = ROOT / "public/game/sprites/mob.png"
    if mob.exists():
        targets.append(("default", mob))
    shop = SPRITES / "shop.png"
    if not any(k == "shop" for k, _ in targets) and mob.exists():
        targets.append(("shop", mob))
    return targets


def main() -> int:
    entries: dict[str, dict] = {}
    errors: list[str] = []

    for key, path in mob_targets():
        out = OUT_MOBS / f"{key}.glb"
        try:
            entries[key] = export_sprite_glb(path, out, MOB_DEPTH, TARGET_MOB_HEIGHT)
            print("OK mob", key)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{key}: {exc}")
            print("FAIL mob", key, exc)

    props: dict[str, dict] = {}
    for name, fn in (("board", export_board), ("hole", export_hole), ("hammer", export_hammer)):
        try:
            props[name] = fn()
            print("OK", name)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{name}: {exc}")
            print("FAIL", name, exc)

    manifest = {
        "generator": "scripts/blender/batch_export.py",
        "blender": bpy.app.version_string,
        "mobDepth": MOB_DEPTH,
        "worldHeight": 0.74,
        "boardWidth": BOARD_WORLD,
        "mobs": entries,
        "props": props,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("Wrote", MANIFEST)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
